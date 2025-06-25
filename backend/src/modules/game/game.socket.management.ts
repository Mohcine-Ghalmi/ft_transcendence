import { Socket, Server } from 'socket.io'
import redis from '../../utils/redis'
import { getSocketIds } from '../../socket'
import { 
  GameRoomData, 
  activeGames, 
  gameRooms,
  GameSocketHandler 
} from './game.socket.types'
import { cleanupGame, saveMatchHistory, emitToUsers } from './game.socket.utils'

export const handleGameManagement: GameSocketHandler = (socket: Socket, io: Server) => {
  
  // Handle game end
  socket.on('GameEnd', async (data: { 
    gameId: string; 
    winner: string; 
    loser: string; 
    finalScore: { p1: number; p2: number };
    reason?: 'normal_end' | 'player_left' | 'timeout'
  }) => {
    try {
      const { gameId, finalScore, reason = 'normal_end' } = data
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) return;
      // Determine winner and loser based on score
      let winner, loser;
      if (finalScore.p1 > finalScore.p2) {
        winner = gameRoom.hostEmail;
        loser = gameRoom.guestEmail;
      } else if (finalScore.p2 > finalScore.p1) {
        winner = gameRoom.guestEmail;
        loser = gameRoom.hostEmail;
      } else {
        // If tie, fallback to provided winner/loser or default to host as winner
        winner = data.winner || gameRoom.hostEmail;
        loser = data.loser || gameRoom.guestEmail;
      }
      await saveMatchHistory(gameId, gameRoom, winner, loser, finalScore, reason);
      await cleanupGame(gameId, reason);
      await emitToUsers(io, [gameRoom.hostEmail, gameRoom.guestEmail], 'GameEnded', {
        gameId,
        winner,
        loser,
        finalScore,
        gameDuration: gameRoom.startedAt && gameRoom.endedAt 
          ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
          : 0,
        reason
      })
    } catch (error) {
      // Error handling for GameEnd
    }
  })

  // Handle player leaving game
  socket.on('LeaveGame', async (data: { gameId: string; playerEmail: string }) => {
    try {
      const { gameId, playerEmail } = data
      if (!gameId || !playerEmail) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Game room not found.',
        })
      }
      // Get current game state for final score
      const currentGameState = activeGames.get(gameId)
      const finalScore = currentGameState?.scores || { p1: 0, p2: 0 }
      // Determine winner and loser based on score
      let winner, loser;
      if (finalScore.p1 > finalScore.p2) {
        winner = gameRoom.hostEmail;
        loser = gameRoom.guestEmail;
      } else if (finalScore.p2 > finalScore.p1) {
        winner = gameRoom.guestEmail;
        loser = gameRoom.hostEmail;
      } else {
        // If tie, the player who did not leave is the winner
        const otherPlayerEmail = gameRoom.hostEmail === playerEmail ? gameRoom.guestEmail : gameRoom.hostEmail;
        winner = otherPlayerEmail;
        loser = playerEmail;
      }
      await saveMatchHistory(gameId, gameRoom, winner, loser, finalScore, 'player_left');
      await cleanupGame(gameId, 'player_left');
      await emitToUsers(io, [gameRoom.hostEmail, gameRoom.guestEmail], 'GameEnded', {
        gameId,
        winner,
        loser,
        finalScore,
        gameDuration: gameRoom.startedAt && gameRoom.endedAt 
          ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
          : 0,
        reason: 'player_left'
      })
      const otherPlayerEmail = gameRoom.hostEmail === playerEmail ? gameRoom.guestEmail : gameRoom.hostEmail
      const otherPlayerSocketIds = await getSocketIds(otherPlayerEmail, 'sockets') || []
      io.to(otherPlayerSocketIds).emit('PlayerLeft', {
        gameId,
        playerWhoLeft: playerEmail,
        reason: 'player_left'
      })
      socket.emit('GameResponse', {
        status: 'success',
        message: 'Left game successfully.',
      })
    } catch (error) {
      socket.emit('GameResponse', {
        status: 'error',
        message: 'Failed to leave game.',
      })
    }
  })

  // Handle canceling accepted games
  socket.on('CancelGame', async (data: { gameId: string }) => {
    try {
      const { gameId } = data
      
      if (!gameId) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Missing game ID.',
        })
      }

      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Game room not found.',
        })
      }

      // Clean up game
      await cleanupGame(gameId, 'timeout');

      // Notify both players
      await emitToUsers(io, [gameRoom.hostEmail, gameRoom.guestEmail], 'GameCanceled', {
        gameId,
        canceledBy: socket.id
      })

      socket.emit('GameResponse', {
        status: 'success',
        message: 'Game canceled successfully.',
      })

    } catch (error) {
      socket.emit('GameResponse', {
        status: 'error',
        message: 'Failed to cancel game.',
      })
    }
  })

  // Handle checking game authorization
  socket.on('CheckGameAuthorization', async (data: { gameId: string; playerEmail: string }) => {
    try {
      const { gameId, playerEmail } = data
      
      if (!gameId || !playerEmail) {
        return socket.emit('GameAuthorizationResponse', {
          status: 'error',
          message: 'Missing required information.',
          authorized: false
        })
      }

      // Get user email from socket data to verify
      const socketUserEmail = (socket as any).userEmail
      
      if (!socketUserEmail || socketUserEmail !== playerEmail) {
        return socket.emit('GameAuthorizationResponse', {
          status: 'error',
          message: 'User not authenticated or email mismatch.',
          authorized: false
        })
      }

      // Check if game room exists
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) {
        return socket.emit('GameAuthorizationResponse', {
          status: 'error',
          message: 'Game room not found.',
          authorized: false
        })
      }

      // Check if game room is in a valid state
      if (gameRoom.status === 'canceled' || gameRoom.status === 'completed') {
        return socket.emit('GameAuthorizationResponse', {
          status: 'error',
          message: 'Game is no longer active.',
          authorized: false
        })
      }

      // Check if user is part of this game (host or guest)
      const isAuthorized = gameRoom.hostEmail === playerEmail || gameRoom.guestEmail === playerEmail

      socket.emit('GameAuthorizationResponse', {
        status: 'success',
        message: isAuthorized ? 'User authorized for this game.' : 'User not authorized for this game.',
        authorized: isAuthorized,
        gameStatus: gameRoom.status,
        isHost: gameRoom.hostEmail === playerEmail
      })

    } catch (error) {
      socket.emit('GameAuthorizationResponse', {
        status: 'error',
        message: 'Failed to check game authorization.',
        authorized: false
      })
    }
  })
} 