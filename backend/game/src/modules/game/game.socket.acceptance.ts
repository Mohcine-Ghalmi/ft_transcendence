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

        console.log(`Processing game acceptance for gameId: ${gameId}, guest: ${guestEmail}`)

        // Get invitation data
        const inviteData = await redis.get(`game_invite:${gameId}`)
        if (!inviteData) {
          console.log('Invitation expired or not found')
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Invitation has expired.',
          })
        }

        const invite: GameInviteData = JSON.parse(inviteData)

        if (invite.guestEmail !== guestEmail) {
          console.log('Invalid invitation for this user')
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'Invalid invitation.',
          })
        }

        // IMPORTANT: Clean up invitation data IMMEDIATELY to prevent double processing
        console.log('Cleaning up invitation data...')
        await Promise.all([
          redis.del(`game_invite:${gameId}`),
          redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), 
          redis.del(`game_invite:${guestEmail}:${invite.hostEmail}`),
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

        console.log('Creating game room:', gameId)
        await redis.setex(
          `game_room:${gameId}`,
          3600,
          JSON.stringify(gameRoomData)
        )
        gameRooms.set(gameId, gameRoomData)

        // Get ALL socket IDs for both users
        const hostSocketIds = (await getSocketIds(host.email, 'sockets')) || []
        const guestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []

        console.log(`Host sockets: ${hostSocketIds.length}, Guest sockets: ${guestSocketIds.length}`)

        const acceptedData = {
          gameId,
          status: 'ready_to_start',
          acceptedBy: guest.email,
        }

        // Send acceptance confirmation to the accepting guest
        socket.emit('GameInviteAccepted', {
          ...acceptedData,
          hostEmail: host.email,
          guestEmail: guest.email,
          hostData: getPlayerData(host),
        })

        // Send acceptance notification to ALL host sockets
        if (hostSocketIds.length > 0) {
          console.log('Notifying host of acceptance...')
          io.to(hostSocketIds).emit('GameInviteAccepted', {
            ...acceptedData,
            hostEmail: host.email,
            guestEmail: guest.email,
            guestData: getPlayerData(guest),
            isHostNotification: true, // Flag to indicate this is for host
          })
        }

        // Clean up invitations from other guest sessions (if any)
        const otherGuestSockets = guestSocketIds.filter(socketId => socketId !== socket.id)
        if (otherGuestSockets.length > 0) {
          console.log('Cleaning up other guest sessions...')
          io.to(otherGuestSockets).emit('GameInviteCleanup', {
            gameId,
            action: 'accepted',
            message: 'Invite accepted in another session'
          })
        }

        console.log(`Game acceptance processed successfully for ${gameId}`)
      } catch (error) {
        console.error('Error processing game acceptance:', error)
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

        console.log(`Processing game decline for gameId: ${gameId}, guest: ${guestEmail}`)

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

        // Clean up BOTH directional invitation keys
        await Promise.all([
          redis.del(`game_invite:${gameId}`),
          redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), // Host -> Guest
          redis.del(`game_invite:${guestEmail}:${invite.hostEmail}`), // Guest -> Host (if exists)
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
        console.error('Error processing game decline:', error)
        socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Failed to decline invitation.',
        })
      }
    }
  )
}