// modules/game/game.socket.invitation.ts
import { Socket, Server } from 'socket.io'
import CryptoJS from 'crypto-js'
import crypto from 'crypto'
import redis from '../../utils/redis'
import { getSocketIds } from '../../socket'
import { getFriend, getUserByEmail } from '../user/user.service'
import { 
  InviteToGameData, 
  GameInviteData, 
  User, 
  getPlayerData,
  GameSocketHandler 
} from './game.socket.types'
import { emitToUsers } from './game.socket.utils'

export const handleGameInvitation: GameSocketHandler = (socket: Socket, io: Server) => {
  
  // Handle sending game invitations
  socket.on('InviteToGame', async (encryptedData: string) => {
    try {
      const key = process.env.ENCRYPTION_KEY
      if (!key) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Server configuration error.',
        })
      }

      // Decrypt the invitation data
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      
      if (!decrypted) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Invalid invitation data.',
        })
      }

      const { hisEmail: invitedUserEmail, myEmail } = JSON.parse(decrypted) as InviteToGameData
      
      if (!myEmail || !invitedUserEmail) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }

      // Validate users exist and are friends
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

      // Check if guest already has a pending invite
      const existingInvite = await redis.get(`game_invite:${invitedUserEmail}`)
      if (existingInvite) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: `${guest.username} already has a pending invitation.`,
        })
      }

      // Check if guest is online
      const guestSocketIds = await getSocketIds(invitedUserEmail, 'sockets') || []
      if (guestSocketIds.length === 0) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: `${guest.username} is not online.`,
        })
      }

      // Generate unique game ID
      const gameId = crypto.randomUUID()
      
      // Store invitation in Redis with 30-second expiration
      const inviteData: GameInviteData = {
        gameId,
        hostEmail: host.email,
        guestEmail: guest.email,
        createdAt: Date.now()
      }
      
      await Promise.all([
        redis.setex(`game_invite:${gameId}`, 30, JSON.stringify(inviteData)),
        redis.setex(`game_invite:${guest.email}`, 30, gameId)
      ])

      // Send invitation to guest with minimal data
      io.to(guestSocketIds).emit('GameInviteReceived', {
        type: 'game_invite',
        gameId,
        hostEmail: host.email,
        message: `${host.username} invited you to play!`,
        hostData: getPlayerData(host),
        expiresAt: Date.now() + 30000
      })

      // Confirm to host with minimal data
      socket.emit('InviteToGameResponse', {
        type: 'invite_sent',
        status: 'success',
        message: `Invitation sent to ${guest.username}`,
        gameId,
        guestEmail: guest.email,
        guestData: getPlayerData(guest)
      })

      // Auto-expire invitation after 30 seconds
      setTimeout(async () => {
        try {
          const stillExists = await redis.get(`game_invite:${gameId}`)
          if (stillExists) {
            await Promise.all([
              redis.del(`game_invite:${gameId}`),
              redis.del(`game_invite:${guest.email}`)
            ])
            
            await emitToUsers(io, [host.email, guest.email], 'GameInviteTimeout', { gameId })
          }
        } catch (error) {
          // Error handling for invitation timeout
        }
      }, 30000)

    } catch (error) {
      socket.emit('InviteToGameResponse', {
        status: 'error',
        message: 'Failed to send invitation. Please try again.',
      })
    }
  })

  // Handle canceling invitations
  socket.on('CancelGameInvite', async (data: { gameId: string; hostEmail: string }) => {
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

      // Clean up invitation
      await Promise.all([
        redis.del(`game_invite:${gameId}`),
        redis.del(`game_invite:${invite.guestEmail}`)
      ])

      // Notify guest
      const guestSocketIds = await getSocketIds(invite.guestEmail, 'sockets') || []
      io.to(guestSocketIds).emit('GameInviteCanceled', {
        gameId,
        canceledBy: hostEmail
      })

      // Confirm to host
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
  })
} 