// Enhanced game.socket.acceptance.ts with host status validation

import { Socket, Server } from 'socket.io'
import { getUserByEmail } from '../user/user.service'
import {
  GameInviteData,
  GameRoomData,
  User,
  getPlayerData,
  gameRooms,
  GameSocketHandler,
  getUserCurrentGame,
  activeGames
} from './game.socket.types'
import redis, { getSocketIds } from '../../database/redis'

// Helper function to check if user is currently in an active game
async function isUserInActiveGame(userEmail: string): Promise<{
  isInGame: boolean;
  gameId?: string;
  gameStatus?: string;
}> {
  try {
    // Check in-memory game sessions first
    const currentGameId = getUserCurrentGame(userEmail);
    if (currentGameId) {
      const gameRoom = gameRooms.get(currentGameId);
      if (gameRoom && (gameRoom.status === 'accepted' || gameRoom.status === 'in_progress')) {
        return {
          isInGame: true,
          gameId: currentGameId,
          gameStatus: gameRoom.status
        };
      }
    }

    // Check Redis for any active game rooms
    const redisGameRooms = await redis.keys('game_room:*');
    for (const roomKey of redisGameRooms) {
      const gameRoomData = await redis.get(roomKey);
      if (gameRoomData) {
        try {
          const gameRoom: GameRoomData = JSON.parse(gameRoomData);
          if ((gameRoom.hostEmail === userEmail || gameRoom.guestEmail === userEmail) && 
              (gameRoom.status === 'accepted' || gameRoom.status === 'in_progress')) {
            return {
              isInGame: true,
              gameId: gameRoom.gameId,
              gameStatus: gameRoom.status
            };
          }
        } catch (parseError) {
          // Clean up corrupted data
          await redis.del(roomKey);
        }
      }
    }

    // Check if user is in active game state
    const activeGameStates = Array.from(activeGames.entries());
    for (const [gameId, gameState] of activeGameStates) {
      const gameRoom = gameRooms.get(gameId);
      if (gameRoom && 
          (gameRoom.hostEmail === userEmail || gameRoom.guestEmail === userEmail) &&
          gameState.gameStatus === 'playing') {
        return {
          isInGame: true,
          gameId: gameId,
          gameStatus: 'in_progress'
        };
      }
    }

    return { isInGame: false };
  } catch (error) {
    console.error('Error checking user game status:', error);
    return { isInGame: false };
  }
}

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

        // NEW: Check if the host (sender) is currently in an active game
        const hostGameStatus = await isUserInActiveGame(invite.hostEmail);
        if (hostGameStatus.isInGame) {
          // Clean up the expired invitation since host is unavailable
          await Promise.all([
            redis.del(`game_invite:${gameId}`),
            redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), 
            redis.del(`game_invite:${guestEmail}:${invite.hostEmail}`),
          ]);

          // Notify the guest that the host is already in a game
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'The sender is already in an active game and cannot start a new one.',
            reason: 'host_in_game',
            hostGameStatus: hostGameStatus.gameStatus
          });
        }

        // NEW: Check if the guest (acceptor) is currently in an active game
        const guestGameStatus = await isUserInActiveGame(guestEmail);
        if (guestGameStatus.isInGame) {
          // Clean up the invitation
          await Promise.all([
            redis.del(`game_invite:${gameId}`),
            redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), 
            redis.del(`game_invite:${guestEmail}:${invite.hostEmail}`),
          ]);

          // Notify host that guest is already in a game
          const hostSocketIds = (await getSocketIds(invite.hostEmail, 'sockets')) || [];
          if (hostSocketIds.length > 0) {
            io.to(hostSocketIds).emit('GameInviteDeclined', {
              gameId,
              declinedBy: guestEmail,
              reason: 'guest_in_game',
              message: 'Guest is already in an active game'
            });
          }

          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'You are already in an active game. Please finish your current game first.',
            reason: 'guest_in_game',
            currentGameId: guestGameStatus.gameId
          });
        }

        // IMPORTANT: Clean up invitation data IMMEDIATELY to prevent double processing
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

        await redis.setex(
          `game_room:${gameId}`,
          3600,
          JSON.stringify(gameRoomData)
        )
        gameRooms.set(gameId, gameRoomData)

        // Get ALL socket IDs for both users
        const hostSocketIds = (await getSocketIds(host.email, 'sockets')) || []
        const guestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []

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
          io.to(otherGuestSockets).emit('GameInviteCleanup', {
            gameId,
            action: 'accepted',
            message: 'Invite accepted in another session'
          })
        }

      } catch (error) {
        console.error('Error accepting game invite:', error);
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
            reason: 'declined_by_user'
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
        console.error('Error declining game invite:', error);
        socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Failed to decline invitation.',
        })
      }
    }
  )
}