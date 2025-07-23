// modules/game/game.socket.acceptance.ts
import { Socket, Server } from 'socket.io'
import { getUserByEmail } from '../user/user.service'
import {
  GameInviteData,
  GameRoomData,
  User,
  getPlayerData,
  gameRooms,
  GameSocketHandler,
} from './game.socket.types'
import redis, { getSocketIds } from '../../database/redis'

export const handleGameAcceptance: GameSocketHandler = (
  socket: Socket,
  io: Server
) => {
  // Handle accepting game invitations
  socket.on(
    'AcceptGameInvite',
    async (data: { gameId: string; guestEmail: string }) => {
      try {
        const { gameId, guestEmail } = data

        if (!gameId || !guestEmail) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Missing required information.',
          })
        }

        // Get invitation data
        const inviteData = await redis.get(`game_invite:${gameId}`)
        if (!inviteData) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Invitation has expired.',
          })
        }

        const invite: GameInviteData = JSON.parse(inviteData)

        if (invite.guestEmail !== guestEmail) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Invalid invitation.',
          })
        }

        // Clean up invitation
        await Promise.all([
          redis.del(`game_invite:${gameId}`),
          redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`),
        ])

        const [hostUser, guestUser] = await Promise.all([
          getUserByEmail(invite.hostEmail),
          getUserByEmail(invite.guestEmail),
        ])

        const host = hostUser as unknown as User
        const guest = guestUser as unknown as User

        if (!host || !guest) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'User data not found.',
          })
        }

        // Create game room
        const gameRoomData: GameRoomData = {
          gameId,
          hostEmail: host.email,
          guestEmail: guest.email,
          status: 'accepted',
          createdAt: Date.now(),
        }

        await redis.setex(
          `game_room:${gameId}`,
          3600,
          JSON.stringify(gameRoomData)
        )
        gameRooms.set(gameId, gameRoomData)

        // FIXED: Get ALL socket IDs but handle them differently
        const hostSocketIds = (await getSocketIds(host.email, 'sockets')) || []
        const guestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []

        const acceptedData = {
          gameId,
          status: 'ready_to_start',
          acceptedBy: guest.email,
        }

        socket.emit('GameInviteAccepted', {
          ...acceptedData,
          hostEmail: host.email,
          guestEmail: guest.email,
          hostData: getPlayerData(host),
        })

        io.to(hostSocketIds).emit('GameInviteAccepted', {
          ...acceptedData,
          hostEmail: host.email,
          guestEmail: guest.email,
          guestData: getPlayerData(guest),
          isHostNotification: true, // Flag to indicate this is for host
        })

        const otherGuestSockets = guestSocketIds.filter(socketId => socketId !== socket.id)
        if (otherGuestSockets.length > 0) {
          io.to(otherGuestSockets).emit('GameInviteCleanup', {
            gameId,
            action: 'accepted',
            message: 'Invite accepted in another session'
          })
        }
      } catch (error) {
        socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Failed to accept invitation.',
        })
      }
    }
  )

  socket.on(
    'DeclineGameInvite',
    async (data: { gameId: string; guestEmail: string }) => {
      try {
        const { gameId, guestEmail } = data

        if (!gameId || !guestEmail) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Missing required information.',
          })
        }

        const inviteData = await redis.get(`game_invite:${gameId}`)
        if (!inviteData) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Invitation has expired.',
          })
        }

        const invite: GameInviteData = JSON.parse(inviteData)

        if (invite.guestEmail !== guestEmail) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Invalid invitation.',
          })
        }

        // Clean up invitation
        await Promise.all([
          redis.del(`game_invite:${gameId}`),
          redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), // Host-specific key
        ])

        const guestUser = await getUserByEmail(invite.guestEmail)
        const guest = guestUser as unknown as User

        if (guest) {
          const hostSocketIds = (await getSocketIds(invite.hostEmail, 'sockets')) || []
          const guestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []

          io.to(hostSocketIds).emit('GameInviteDeclined', {
            gameId,
            declinedBy: guest.email,
            guestName: guest.username,
            guestLogin: guest.login,
          })

          io.to(guestSocketIds).emit('GameInviteCleanup', {
            gameId,
            action: 'declined',
            message: 'Invite declined in another session'
          })
        }

        socket.emit('GameInviteResponse', {
          status: 'success',
          message: 'Invitation declined.',
        })
      } catch (error) {
        socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Failed to decline invitation.',
        })
      }
    }
  )
}