import { Socket, Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { Tournament, TournamentParticipant } from './game.socket.types'
import redis, { getSocketIds } from '../../database/redis'
import { getUserByEmail, getFriend } from '../user/user.service'
import CryptoJS from 'crypto-js'

const TOURNAMENT_PREFIX = 'tournament:'
const TOURNAMENT_INVITE_PREFIX = 'tournament_invite:'

async function getAllActiveTournaments(): Promise<any[]> {
  try {
    const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`)
    const tournaments: any[] = []
    for (const key of keys) {
      const t = await redis.get(key)
      if (t) {
        const parsed = JSON.parse(t)
        if (parsed.status === 'lobby' || parsed.status === 'in_progress') {
          tournaments.push(parsed)
        }
      }
    }
    return tournaments
  } catch (err) {
    return []
  }
}

export function registerTournamentLobbyHandlers(socket: Socket, io: Server) {
  socket.on('ListTournaments', async () => {
    try {
      const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`)
      const tournaments: any = []
      for (const key of keys) {
        const data = await redis.get(key)
        if (data) {
          const tournament = JSON.parse(data)
          if (tournament.status === 'lobby') {
            tournaments.push(tournament)
          }
        }
      }
      socket.emit('TournamentList', tournaments)
    } catch (err) {
      socket.emit('TournamentError', { message: 'Failed to list tournaments.' })
    }
  })

  socket.on('InviteToTournament', async (encryptedData: string) => {
    try {
      const key = process.env.ENCRYPTION_KEY
      if (!key)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'Server config error.',
        })
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      if (!decrypted)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'Invalid invite data.',
        })
      const { tournamentId, hostEmail, inviteeEmail } = JSON.parse(decrypted)
      if (!tournamentId || !hostEmail || !inviteeEmail)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'Missing info.',
        })

      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(hostEmail),
        getUserByEmail(inviteeEmail),
      ])
      if (!hostUser || !guestUser)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'User not found.',
        })
      if (hostEmail === inviteeEmail)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'Cannot invite yourself.',
        })

      const friendship = await getFriend(hostEmail, inviteeEmail)
      if (!friendship)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'You can only invite friends.',
        })

      const existingInviteId = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`);
      if (existingInviteId) {
        const existingInviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`);
        if (existingInviteData) {
          const existingInvite = JSON.parse(existingInviteData);
          if (Date.now() - existingInvite.createdAt > 30000) {
            await Promise.all([
              redis.del(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`),
              redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`),
            ]);
          } else {
            if (existingInvite.tournamentId === tournamentId) {
              return socket.emit('InviteToTournamentResponse', {
                status: 'error',
                message: 'Already invited to this tournament.',
              });
            }
            return socket.emit('InviteToTournamentResponse', {
              status: 'error',
              message: 'Already has a pending invite.',
            });
          }
        } else {
          await redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`);
        }
      }

      const guestSocketIds = (await getSocketIds(inviteeEmail, 'sockets')) || []
      if (guestSocketIds.length === 0)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'User not online.',
        })

      const inviteId = uuidv4()
      const inviteData = {
        inviteId,
        tournamentId,
        hostEmail,
        inviteeEmail,
        createdAt: Date.now(),
      }
      await Promise.all([
        redis.setex(
          `${TOURNAMENT_INVITE_PREFIX}${inviteId}`,
          30,
          JSON.stringify(inviteData)
        ),
        redis.setex(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`, 30, inviteId),
      ])

      const host = (hostUser as any).toJSON
        ? (hostUser as any).toJSON()
        : (hostUser as any)
      const guest = (guestUser as any).toJSON
        ? (guestUser as any).toJSON()
        : (guestUser as any)

      io.to(guestSocketIds).emit('TournamentInviteReceived', {
        type: 'tournament_invite',
        inviteId,
        tournamentId,
        hostEmail,
        message: `${
          host.username || host.email || 'Host'
        } invited you to a tournament!`,
        hostData: host,
        expiresAt: Date.now() + 30000,
      })

      socket.emit('InviteToTournamentResponse', {
        type: 'invite_sent',
        status: 'success',
        message: `Invitation sent to ${
          guest.username || guest.email || 'Guest'
        }`,
        inviteId,
        guestEmail: guest.email,
        guestData: guest,
      })

      setTimeout(async () => {
        const stillExists = await redis.get(
          `${TOURNAMENT_INVITE_PREFIX}${inviteId}`
        )
        if (stillExists) {
          await Promise.all([
            redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
            redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`),
          ])
          io.to([
            ...((await getSocketIds(hostEmail, 'sockets')) || []),
            ...guestSocketIds,
          ]).emit('TournamentInviteTimeout', { inviteId })
        }
      }, 30000)
    } catch (error) {
      socket.emit('InviteToTournamentResponse', {
        status: 'error',
        message: 'Failed to send tournament invite.',
      })
    }
  })

  socket.on(
    'DeclineTournamentInvite',
    async (data: { inviteId: string; inviteeEmail: string }) => {
      try {
        const { inviteId, inviteeEmail } = data
        if (!inviteId || !inviteeEmail)
          return socket.emit('TournamentInviteResponse', {
            status: 'error',
            message: 'Missing info.',
          })

        const inviteData = await redis.get(
          `${TOURNAMENT_INVITE_PREFIX}${inviteId}`
        )
        if (!inviteData)
          return socket.emit('TournamentInviteResponse', {
            status: 'error',
            message: 'Invite expired.',
          })

        const invite = JSON.parse(inviteData)
        if (invite.inviteeEmail !== inviteeEmail)
          return socket.emit('TournamentInviteResponse', {
            status: 'error',
            message: 'Invalid invite.',
          })

        await Promise.all([
          redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
          redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`),
        ])

        const hostSocketIds =
          (await getSocketIds(invite.hostEmail, 'sockets')) || []
        io.to(hostSocketIds).emit('TournamentInviteDeclined', {
          inviteId,
          tournamentId: invite.tournamentId,
          inviteeEmail,
          message: 'Tournament invite was declined.',
        })

        socket.emit('TournamentInviteResponse', {
          status: 'success',
          message: 'Tournament invite declined.',
        })
      } catch (error) {
        socket.emit('TournamentInviteResponse', {
          status: 'error',
          message: 'Failed to decline invite.',
        })
      }
    }
  )

  socket.on(
    'CancelTournamentInvite',
    async (data: { inviteId: string; hostEmail: string }) => {
      try {
        const { inviteId, hostEmail } = data
        if (!inviteId || !hostEmail)
          return socket.emit('TournamentInviteResponse', {
            status: 'error',
            message: 'Missing info.',
          })

        const inviteData = await redis.get(
          `${TOURNAMENT_INVITE_PREFIX}${inviteId}`
        )
        if (!inviteData)
          return socket.emit('TournamentInviteResponse', {
            status: 'error',
            message: 'Invite not found or expired.',
          })

        const invite = JSON.parse(inviteData)
        if (invite.hostEmail !== hostEmail)
          return socket.emit('TournamentInviteResponse', {
            status: 'error',
            message: 'Only the host can cancel the invite.',
          })

        await Promise.all([
          redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
          redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.inviteeEmail}`),
        ])

        const inviteeSocketIds =
          (await getSocketIds(invite.inviteeEmail, 'sockets')) || []
        io.to(inviteeSocketIds).emit('TournamentInviteCanceled', {
          inviteId,
          tournamentId: invite.tournamentId,
          message: 'Tournament invite was canceled by the host.',
        })

        socket.emit('TournamentInviteResponse', {
          status: 'success',
          message: 'Tournament invite canceled.',
        })
      } catch (error) {
        socket.emit('TournamentInviteResponse', {
          status: 'error',
          message: 'Failed to cancel invite.',
        })
      }
    }
  )

  socket.on(
    'LeaveTournament',
    async (data: { tournamentId: string; playerEmail: string }) => {
      try {
        const { tournamentId, playerEmail } = data
        if (!tournamentId || !playerEmail)
          return socket.emit('TournamentLeaveResponse', {
            status: 'error',
            message: 'Missing info.',
          })

        const tournamentData = await redis.get(
          `${TOURNAMENT_PREFIX}${tournamentId}`
        )
        if (!tournamentData)
          return socket.emit('TournamentLeaveResponse', {
            status: 'error',
            message: 'Tournament not found.',
          })

        const tournament: Tournament = JSON.parse(tournamentData)

        const participantIndex = tournament.participants.findIndex(
          (p) => p.email === playerEmail
        )
        if (participantIndex === -1)
          return socket.emit('TournamentLeaveResponse', {
            status: 'error',
            message: 'You are not a participant in this tournament.',
          })

        if (tournament.hostEmail === playerEmail) {
          return socket.emit('TournamentLeaveResponse', {
            status: 'error',
            message: 'Host cannot leave. Cancel the tournament instead.',
          })
        }

        if (tournament.status === 'lobby') {
          const leftPlayer = tournament.participants[participantIndex]
          tournament.participants.splice(participantIndex, 1)

          await redis.setex(
            `${TOURNAMENT_PREFIX}${tournamentId}`,
            3600,
            JSON.stringify(tournament)
          )

          const allParticipantEmails = tournament.participants.map(
            (p: any) => p.email
          )
          const allSocketIds: any = []

          for (const email of allParticipantEmails) {
            const socketIds = (await getSocketIds(email, 'sockets')) || []
            allSocketIds.push(...socketIds)
          }

          io.to(allSocketIds).emit('TournamentParticipantLeft', {
            tournamentId,
            tournament,
            leftPlayer,
            message: `${
              leftPlayer.nickname || leftPlayer.email
            } left the tournament.`,
          })

          socket.emit('TournamentLeaveResponse', {
            status: 'success',
            message: 'Left tournament successfully.',
          })
        } else if (tournament.status === 'in_progress') {
          const { handleTournamentPlayerForfeit } = await import(
            './game.socket.tournament.events'
          )

          const {
            updatedTournament,
            affectedMatch,
            forfeitedPlayer,
            advancingPlayer,
          } = handleTournamentPlayerForfeit(tournament, playerEmail)

          await redis.setex(
            `${TOURNAMENT_PREFIX}${tournamentId}`,
            3600,
            JSON.stringify(updatedTournament)
          )

          const allParticipantEmails = updatedTournament.participants.map(
            (p: any) => p.email
          )
          const allSocketIds: string[] = []

          for (const email of allParticipantEmails) {
            const socketIds = (await getSocketIds(email, 'sockets')) || []
            allSocketIds.push(...socketIds)
          }

          io.to(allSocketIds).emit('TournamentPlayerForfeited', {
            tournamentId,
            forfeitedPlayer,
            advancingPlayer,
            affectedMatch,
            tournament: updatedTournament,
            message: `${forfeitedPlayer?.nickname} has forfeited the tournament. ${advancingPlayer?.nickname} advances to the next round.`,
          })

          socket.emit('TournamentLeaveResponse', {
            status: 'success',
            message: 'You have forfeited the tournament.',
          })
        } else {
          return socket.emit('TournamentLeaveResponse', {
            status: 'error',
            message: 'Cannot leave tournament in current state.',
          })
        }
      } catch (error) {
        socket.emit('TournamentLeaveResponse', {
          status: 'error',
          message: 'Failed to leave tournament.',
        })
      }
    }
  )

  socket.on(
    'CancelTournament',
    async (data: { tournamentId: string; hostEmail: string }) => {
      try {
        const { tournamentId, hostEmail } = data
        if (!tournamentId || !hostEmail)
          return socket.emit('TournamentCancelResponse', {
            status: 'error',
            message: 'Missing info.',
          })

        const tournamentData = await redis.get(
          `${TOURNAMENT_PREFIX}${tournamentId}`
        )
        if (!tournamentData)
          return socket.emit('TournamentCancelResponse', {
            status: 'error',
            message: 'Tournament not found.',
          })

        const tournament: Tournament = JSON.parse(tournamentData)
        if (tournament.hostEmail !== hostEmail) {
          return socket.emit('TournamentCancelResponse', {
            status: 'error',
            message: 'Only the host can cancel the tournament.',
          })
        }

        if (tournament.status !== 'lobby') {
          return socket.emit('TournamentCancelResponse', {
            status: 'error',
            message: 'Tournament is not in lobby state.',
          })
        }

        const allParticipantEmails = tournament.participants.map(
          (p: any) => p.email
        )
        const allSocketIds: any = []

        for (const email of allParticipantEmails) {
          const socketIds = (await getSocketIds(email, 'sockets')) || []
          allSocketIds.push(...socketIds)
        }

        await redis.del(`${TOURNAMENT_PREFIX}${tournamentId}`)
        io.to(allSocketIds).emit('TournamentCanceled', {
          tournamentId,
          tournament: {
            ...tournament,
            status: 'canceled',
            endedAt: Date.now(),
          },
          reason: 'Host canceled the tournament',
        })

        io.to(allSocketIds).emit('RedirectToPlay', {
          message: 'Tournament was canceled by the host.',
        })
        const remainingTournaments = await getAllActiveTournaments()
        io.emit('TournamentList', remainingTournaments)

        socket.emit('TournamentCancelResponse', {
          status: 'success',
          message: 'Tournament canceled successfully.',
        })
      } catch (error) {
        socket.emit('TournamentCancelResponse', {
          status: 'error',
          message: 'Failed to cancel tournament.',
        })
      }
    }
  )
}
