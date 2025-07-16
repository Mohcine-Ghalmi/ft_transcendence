// modules/game/game.socket.acceptance.ts
import { Socket, Server } from 'socket.io'
import redis from '../../utils/redis'
import { getSocketIds } from '../../socket'
import { getUserByEmail } from '../user/user.service'
import { 
  GameInviteData, 
  GameRoomData, 
  User, 
  getPlayerData,
  gameRooms,
  GameSocketHandler 
} from './game.socket.types'

export const handleGameAcceptance: GameSocketHandler = (socket: Socket, io: Server) => {
  
  // Handle accepting game invitations
  socket.on('AcceptGameInvite', async (data: { gameId: string; guestEmail: string }) => {
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
        redis.del(`game_invite:${guestEmail}`)
      ])

      // Get user data
      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(invite.hostEmail),
        getUserByEmail(invite.guestEmail)
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
        createdAt: Date.now()
      }
      
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoomData))
      gameRooms.set(gameId, gameRoomData);

      // Notify both players
      const hostSocketIds = await getSocketIds(host.email, 'sockets') || []
      const guestSocketIds = await getSocketIds(guest.email, 'sockets') || []

      const acceptedData = {
        gameId,
        status: 'ready_to_start',
        acceptedBy: guest.email
      }

      io.to(hostSocketIds).emit('GameInviteAccepted', {
        ...acceptedData,
        guestData: getPlayerData(guest)
      })

      io.to(guestSocketIds).emit('GameInviteAccepted', {
        ...acceptedData,
        hostData: getPlayerData(host)
      })

    } catch (error) {
      socket.emit('GameInviteResponse', {
        status: 'error',
        message: 'Failed to accept invitation.',
      })
    }
  })

  // Handle declining game invitations
  socket.on('DeclineGameInvite', async (data: { gameId: string; guestEmail: string }) => {
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
        redis.del(`game_invite:${guestEmail}`)
      ])

      const guestUser = await getUserByEmail(invite.guestEmail)
      const guest = guestUser as unknown as User

      if (guest) {
        // Notify host of decline
        const hostSocketIds = await getSocketIds(invite.hostEmail, 'sockets') || []
        io.to(hostSocketIds).emit('GameInviteDeclined', {
          gameId,
          declinedBy: guest.email,
          guestName: guest.username,
          guestLogin: guest.login
        })
      }

      // Confirm to guest
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
  })
} 