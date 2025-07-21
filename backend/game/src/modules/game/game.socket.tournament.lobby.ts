import { Socket, Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { Tournament, TournamentParticipant } from './game.socket.types'
import redis, { getSocketIds } from '../../database/redis'
import { getUserByEmail, getFriend } from '../user/user.service'
import CryptoJS from 'crypto-js'

// Key prefix for tournaments in Redis
const TOURNAMENT_PREFIX = 'tournament:'
const TOURNAMENT_INVITE_PREFIX = 'tournament_invite:'

// Helper function to get all active tournaments
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
    console.error('Error getting active tournaments:', err)
    return []
  }
}

export function registerTournamentLobbyHandlers(socket: Socket, io: Server) {
  // List tournaments
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
      console.error('[Tournament] Error listing tournaments:', err)
      socket.emit('TournamentError', { message: 'Failed to list tournaments.' })
    }
  })

  // Invite to tournament (encrypted)
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

      // Validate users
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

      // Check friendship
      const friendship = await getFriend(hostEmail, inviteeEmail)
      if (!friendship)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'You can only invite friends.',
        })

      // Check for existing invite and clean up if expired
      const existingInviteId = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`);
      if (existingInviteId) {
        const existingInviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`);
        if (existingInviteData) {
          const existingInvite = JSON.parse(existingInviteData);
          // If invite is expired (older than 30 seconds), clean up and allow new invite
          if (Date.now() - existingInvite.createdAt > 30000) {
            await Promise.all([
              redis.del(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`),
              redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`),
            ]);
          } else {
            // If invite is for the same tournament, block
            if (existingInvite.tournamentId === tournamentId) {
              return socket.emit('InviteToTournamentResponse', {
                status: 'error',
                message: 'Already invited to this tournament.',
              });
            }
            // If invite is for a different tournament, allow new invite
            // (or optionally block, but old behavior allowed new invites)
            return socket.emit('InviteToTournamentResponse', {
              status: 'error',
              message: 'Already has a pending invite.',
            });
          }
        } else {
          // Clean up stale invite reference and allow new invite
          await redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`);
        }
      }

      // Check if guest is online
      const guestSocketIds = (await getSocketIds(inviteeEmail, 'sockets')) || []
      if (guestSocketIds.length === 0)
        return socket.emit('InviteToTournamentResponse', {
          status: 'error',
          message: 'User not online.',
        })

      // Store invite in Redis
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

      // Ensure hostUser and guestUser are plain objects
      const host = (hostUser as any).toJSON
        ? (hostUser as any).toJSON()
        : (hostUser as any)
      const guest = (guestUser as any).toJSON
        ? (guestUser as any).toJSON()
        : (guestUser as any)

      // Notify guest
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

      // Confirm to host
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

      // Auto-expire
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

  // Decline tournament invite
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

        // Clean up invite
        await Promise.all([
          redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
          redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`),
        ])

        // Notify host that invite was declined
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

  // Cancel tournament invite (host only)
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

        // Clean up invite
        await Promise.all([
          redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
          redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.inviteeEmail}`),
        ])

        // Notify invitee that invite was canceled
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

  // Leave tournament
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

        // Get tournament data
        const tournamentData = await redis.get(
          `${TOURNAMENT_PREFIX}${tournamentId}`
        )
        if (!tournamentData)
          return socket.emit('TournamentLeaveResponse', {
            status: 'error',
            message: 'Tournament not found.',
          })

        const tournament: Tournament = JSON.parse(tournamentData)

        // Check if user is a participant
        const participantIndex = tournament.participants.findIndex(
          (p) => p.email === playerEmail
        )
        if (participantIndex === -1)
          return socket.emit('TournamentLeaveResponse', {
            status: 'error',
            message: 'You are not a participant in this tournament.',
          })

        // Check if user is the host
        if (tournament.hostEmail === playerEmail) {
          return socket.emit('TournamentLeaveResponse', {
            status: 'error',
            message: 'Host cannot leave. Cancel the tournament instead.',
          })
        }

        // Handle different tournament states
        if (tournament.status === 'lobby') {
          // Simple leave for lobby tournaments
          const leftPlayer = tournament.participants[participantIndex]
          tournament.participants.splice(participantIndex, 1)

          // Update tournament in Redis
          await redis.setex(
            `${TOURNAMENT_PREFIX}${tournamentId}`,
            3600,
            JSON.stringify(tournament)
          )

          // Notify all remaining participants
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
          // Handle forfeit for active tournaments
          const { handleTournamentPlayerForfeit } = await import(
            './game.socket.tournament.events'
          )

          const {
            updatedTournament,
            affectedMatch,
            forfeitedPlayer,
            advancingPlayer,
          } = handleTournamentPlayerForfeit(tournament, playerEmail)

          // Save updated tournament
          await redis.setex(
            `${TOURNAMENT_PREFIX}${tournamentId}`,
            3600,
            JSON.stringify(updatedTournament)
          )

          // Notify all tournament participants about the forfeit
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
        console.error('[Tournament] Error leaving tournament:', error)
        socket.emit('TournamentLeaveResponse', {
          status: 'error',
          message: 'Failed to leave tournament.',
        })
      }
    }
  )

  // Cancel tournament (host only)
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

        // Get tournament data
        const tournamentData = await redis.get(
          `${TOURNAMENT_PREFIX}${tournamentId}`
        )
        if (!tournamentData)
          return socket.emit('TournamentCancelResponse', {
            status: 'error',
            message: 'Tournament not found.',
          })

        const tournament: Tournament = JSON.parse(tournamentData)

        // Check if user is the host
        if (tournament.hostEmail !== hostEmail) {
          return socket.emit('TournamentCancelResponse', {
            status: 'error',
            message: 'Only the host can cancel the tournament.',
          })
        }

        // Check if tournament is in lobby state
        if (tournament.status !== 'lobby') {
          return socket.emit('TournamentCancelResponse', {
            status: 'error',
            message: 'Tournament is not in lobby state.',
          })
        }

        // Get all participants before deletion
        const allParticipantEmails = tournament.participants.map(
          (p: any) => p.email
        )
        const allSocketIds: any = []

        for (const email of allParticipantEmails) {
          const socketIds = (await getSocketIds(email, 'sockets')) || []
          allSocketIds.push(...socketIds)
        }

        // Delete tournament immediately from Redis (event-driven cleanup)
        await redis.del(`${TOURNAMENT_PREFIX}${tournamentId}`)

        // Emit tournament canceled event to all participants
        io.to(allSocketIds).emit('TournamentCanceled', {
          tournamentId,
          tournament: {
            ...tournament,
            status: 'canceled',
            endedAt: Date.now(),
          },
          reason: 'Host canceled the tournament',
        })

        // Redirect all participants to play page
        io.to(allSocketIds).emit('RedirectToPlay', {
          message: 'Tournament was canceled by the host.',
        })

        // Emit updated tournament list to all clients
        const remainingTournaments = await getAllActiveTournaments()
        io.emit('TournamentList', remainingTournaments)

        socket.emit('TournamentCancelResponse', {
          status: 'success',
          message: 'Tournament canceled successfully.',
        })
      } catch (error) {
        console.error('[Tournament] Error canceling tournament:', error)
        socket.emit('TournamentCancelResponse', {
          status: 'error',
          message: 'Failed to cancel tournament.',
        })
      }
    }
  )
}
