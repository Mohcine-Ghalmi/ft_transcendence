import { Socket, Server } from 'socket.io'
import CryptoJS from 'crypto-js'
import crypto from 'crypto'
import { getFriend, getUserByEmail } from '../user/user.service'
import {
  InviteToGameData,
  GameInviteData,
  User,
  getPlayerData,
  GameSocketHandler,
} from './game.socket.types'
import { emitToUsers } from './game.socket.utils'
import redis, { getSocketIds } from '../../database/redis'

export const handleGameInvitation: GameSocketHandler = (
  socket: Socket,
  io: Server
) => {
  // NEW: Validate invitation status
  socket.on('ValidateInvitation', async (data: { inviteKey: string }) => {
    try {
      const { inviteKey } = data
      if (!inviteKey) {
        return socket.emit('InvitationValidation', { inviteKey, isValid: false })
      }

      // Check if there's an active invitation with this key
      const [hostEmail, guestEmail] = inviteKey.split(':')
      if (!hostEmail || !guestEmail) {
        return socket.emit('InvitationValidation', { inviteKey, isValid: false })
      }

      // Check Redis for any active invitations between these users
      const hostToGuestInvite = await redis.get(`game_invite:${hostEmail}:${guestEmail}`)
      const guestToHostInvite = await redis.get(`game_invite:${guestEmail}:${hostEmail}`)
      
      const isValid = !!(hostToGuestInvite || guestToHostInvite)
      
      socket.emit('InvitationValidation', { inviteKey, isValid })
    } catch (error) {
      socket.emit('InvitationValidation', { inviteKey: data.inviteKey, isValid: false })
    }
  })

  socket.on('InviteToGame', async (encryptedData: string) => {
    try {
      const key = process.env.ENCRYPTION_KEY
      if (!key) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Server configuration error.',
        })
      }

      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)

      if (!decrypted) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Invalid invitation data.',
        })
      }

      const { hisEmail: invitedUserEmail, myEmail } = JSON.parse(
        decrypted
      ) as InviteToGameData

      if (!myEmail || !invitedUserEmail) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }

      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(myEmail),
        getUserByEmail(invitedUserEmail),
      ])

      const host = hostUser as unknown as User
      const guest = guestUser as unknown as User

      if (!host || !guest) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'One or both users not found.',
        })
      }

      if (host.email === guest.email) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Cannot invite yourself.',
        })
      }

      // Check if users are friends
      const friendship = await getFriend(myEmail, guest.email)
      if (!friendship) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'You can only invite friends to play.',
        })
      }

      // NEW: Clean up any stale invitations first
      const existingGameInvite = await redis.get(`game_invite:${myEmail}:${invitedUserEmail}`)
      if (existingGameInvite) {
        // Check if the actual invitation data still exists
        const gameId = existingGameInvite
        const inviteData = await redis.get(`game_invite:${gameId}`)
        
        if (!inviteData) {
          // Stale reference, clean it up
          await redis.del(`game_invite:${myEmail}:${invitedUserEmail}`)
        } else {
          return socket.emit('InviteToGameResponse', {
            status: 'error',
            message: `You already sent an invitation to ${guest.username}.`,
            gameId: gameId, // ADD THIS - include the original gameId from Redis
            guestEmail: guest.email, // ADD THIS - help client matching
            type: 'duplicate_invitation' // ADD THIS - identify the error type
          })
        }
      }

      const reverseGameInvite = await redis.get(`game_invite:${invitedUserEmail}:${myEmail}`)
      if (reverseGameInvite) {
        // Check if the actual invitation data still exists
        const gameId = reverseGameInvite
        const inviteData = await redis.get(`game_invite:${gameId}`)
        
        if (!inviteData) {
          // Stale reference, clean it up
          await redis.del(`game_invite:${invitedUserEmail}:${myEmail}`)
        } else {
          return socket.emit('InviteToGameResponse', {
            status: 'error',
            message: `${guest.username} has already sent you an invitation. Please check your notifications.`,
            gameId: gameId, // ADD THIS
            guestEmail: guest.email, // ADD THIS  
            type: 'reverse_duplicate_invitation' // ADD THIS
          })
        }
      }

      const guestSocketIds =
        (await getSocketIds(invitedUserEmail, 'sockets')) || []
      if (guestSocketIds.length === 0) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: `${guest.username} is not online.`,
        })
      }
      
      const gameId = crypto.randomUUID()
      const inviteData: GameInviteData = {
        gameId,
        hostEmail: host.email,
        guestEmail: guest.email,
        createdAt: Date.now(),
      }

      await Promise.all([
        redis.setex(`game_invite:${gameId}`, 30, JSON.stringify(inviteData)),
        redis.setex(`game_invite:${host.email}:${guest.email}`, 30, gameId), // Host-specific key
      ])

      io.to(guestSocketIds).emit('GameInviteReceived', {
        type: 'game_invite',
        gameId,
        hostEmail: host.email,
        message: `${host.username} invited you to play!`,
        hostData: getPlayerData(host),
        expiresAt: Date.now() + 30000,
      })

      socket.emit('InviteToGameResponse', {
        type: 'invite_sent',
        status: 'success',
        message: `Invitation sent to ${guest.username}`,
        gameId,
        guestEmail: guest.email,
        guestData: getPlayerData(guest),
      })

      setTimeout(async () => {
        try {
          const stillExists = await redis.get(`game_invite:${gameId}`)
          if (stillExists) {
            await Promise.all([
              redis.del(`game_invite:${gameId}`),
              redis.del(`game_invite:${host.email}:${guest.email}`), // Host-specific key
            ])

            const currentHostSocketIds = (await getSocketIds(host.email, 'sockets')) || []
            const currentGuestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []
            io.to(currentHostSocketIds).emit('GameInviteTimeout', { gameId })
            io.to(currentGuestSocketIds).emit('GameInviteCleanup', {
              gameId,
              action: 'timeout',
              message: 'Invite expired'
            })
          }
        } catch (error) {
          console.log("error")
        }
      }, 30000)
    } catch (error) {
      socket.emit('InviteToGameResponse', {
        status: 'error',
        message: 'Failed to send invitation. Please try again.',
      })
    }
  })

  socket.on(
    'CancelGameInvite',
    async (data: { gameId: string; hostEmail: string }) => {
      try {
        const { gameId, hostEmail } = data

        if (!gameId || !hostEmail) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Missing required information.',
          })
        }

        const inviteData = await redis.get(`game_invite:${gameId}`)
        if (!inviteData) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Invitation not found or expired.',
          })
        }

        const invite: GameInviteData = JSON.parse(inviteData)

        if (invite.hostEmail !== hostEmail) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'You can only cancel your own invitations.',
          })
        }

        await Promise.all([
          redis.del(`game_invite:${gameId}`),
          redis.del(`game_invite:${invite.hostEmail}:${invite.guestEmail}`), // Host-specific key
        ])

        const guestSocketIds = (await getSocketIds(invite.guestEmail, 'sockets')) || []
        io.to(guestSocketIds).emit('GameInviteCanceled', {
          gameId,
          canceledBy: hostEmail,
        })

        io.to(guestSocketIds).emit('GameInviteCleanup', {
          gameId,
          action: 'canceled',
          message: 'Invite was canceled by host'
        })

        socket.emit('GameInviteResponse', {
          status: 'success',
          message: 'Invitation canceled.',
        })
      } catch (error) {
        socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Failed to cancel invitation.',
        })
      }
    }
  )

  // NEW: Clean up stale invitations endpoint
  socket.on('CleanupStaleInvitations', async (data: { userEmail: string }) => {
    try {
      const { userEmail } = data
      if (!userEmail) return

      // Find all invitation keys involving this user
      const allInviteKeys = await redis.keys('game_invite:*')
      let cleanedCount = 0

      for (const key of allInviteKeys) {
        if (key.includes(userEmail)) {
          const inviteData = await redis.get(key)
          
          if (!inviteData) {
            // Key exists but no data, clean it up
            await redis.del(key)
            cleanedCount++
          } else {
            try {
              const parsedData = JSON.parse(inviteData)
              // Check if it's a valid game invite or just a reference key
              if (!parsedData.gameId && !parsedData.hostEmail) {
                // This is a reference key, check if the actual invitation exists
                const actualInvite = await redis.get(`game_invite:${inviteData}`)
                if (!actualInvite) {
                  await redis.del(key)
                  cleanedCount++
                }
              }
            } catch (parseError) {
              // Corrupted data, clean it up
              await redis.del(key)
              cleanedCount++
            }
          }
        }
      }

      
      socket.emit('StaleInvitationsCleanup', {
        status: 'success',
        cleanedCount
      })
    } catch (error) {
      socket.emit('StaleInvitationsCleanup', {
        status: 'error',
        message: 'Failed to cleanup stale invitations'
      })
    }
  })
}