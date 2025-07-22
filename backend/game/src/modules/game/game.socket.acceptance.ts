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
          redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), // Host-specific key
        ])

        // Get user data
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

        // Get ALL socket IDs for both players to ensure all sessions are notified
        const hostSocketIds = (await getSocketIds(host.email, 'sockets')) || []
        const guestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []

        const acceptedData = {
          gameId,
          status: 'ready_to_start',
          acceptedBy: guest.email,
        }

        // Notify ALL host sessions
        io.to(hostSocketIds).emit('GameInviteAccepted', {
          ...acceptedData,
          hostEmail: host.email,
          guestEmail: guest.email,
          guestData: getPlayerData(guest),
        })

        // Notify ALL guest sessions
        io.to(guestSocketIds).emit('GameInviteAccepted', {
          ...acceptedData,
          hostEmail: host.email,
          guestEmail: guest.email,
          hostData: getPlayerData(host),
        })

        // IMPORTANT: Clean up the invite from ALL guest sessions
        io.to(guestSocketIds).emit('GameInviteCleanup', {
          gameId,
          action: 'accepted',
          message: 'Invite accepted in another session'
        })
      } catch (error) {
        socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Failed to accept invitation.',
        })
      }
    }
  )

  // Handle declining game invitations
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
          // Get ALL socket IDs for both players
          const hostSocketIds = (await getSocketIds(invite.hostEmail, 'sockets')) || []
          const guestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []

          // Notify host of decline
          io.to(hostSocketIds).emit('GameInviteDeclined', {
            gameId,
            declinedBy: guest.email,
            guestName: guest.username,
            guestLogin: guest.login,
          })

          // IMPORTANT: Clean up the invite from ALL guest sessions
          io.to(guestSocketIds).emit('GameInviteCleanup', {
            gameId,
            action: 'declined',
            message: 'Invite declined in another session'
          })
        }

        // Confirm to the declining session
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