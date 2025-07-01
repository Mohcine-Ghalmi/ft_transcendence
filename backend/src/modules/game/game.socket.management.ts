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

// Track games that are currently being processed to prevent duplicate GameEnd events
const processingGames = new Set<string>();

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
      if (!gameRoom) {
        console.log(`Game room not found for game ${gameId}`)
        return
      }
      
      // Check if game is already being processed or completed
      if (processingGames.has(gameId) || gameRoom.status === 'completed') {
        console.log(`Game ${gameId} is already being processed or completed, ignoring duplicate GameEnd event`)
        return
      }
      
      // Additional check: verify game status in Redis
      const redisGameData = await redis.get(`game_room:${gameId}`)
      if (redisGameData) {
        const redisGameRoom = JSON.parse(redisGameData)
        if (redisGameRoom.status === 'completed') {
          console.log(`Game ${gameId} is already completed in Redis, ignoring duplicate GameEnd event`)
          return
        }
      }
      
      // Mark game as being processed
      processingGames.add(gameId);
      
      console.log(`Game ${gameId} ending with reason: ${reason}`)
      
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
      
      // Update game room with end time
      gameRoom.status = 'completed';
      gameRoom.endedAt = Date.now();
      gameRoom.winner = winner;
      gameRoom.loser = loser;
      
      // Save match history
      await saveMatchHistory(gameId, gameRoom, winner, loser, finalScore, reason);
      
      // Clean up game
      await cleanupGame(gameId, reason);
      
      // Emit game end event to both players
      await emitToUsers(io, [gameRoom.hostEmail, gameRoom.guestEmail], 'GameEnded', {
        gameId,
        winner,
        loser,
        finalScore,
        gameDuration: gameRoom.startedAt && gameRoom.endedAt 
          ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
          : 0,
        reason,
        message: reason === 'normal_end' ? 'Game completed!' : 'Game ended due to player leaving.'
      })
      
      console.log(`Game ${gameId} ended successfully. Winner: ${winner}, Loser: ${loser}`)
      
      // Remove from processing set after a delay to ensure cleanup is complete
      setTimeout(() => {
        processingGames.delete(gameId);
      }, 5000);
      
    } catch (error) {
      console.error('Error in GameEnd handler:', error)
      // Remove from processing set on error
      processingGames.delete(data.gameId);
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
      
      // Check if game is already being processed or completed
      if (processingGames.has(gameId) || gameRoom.status === 'completed') {
        console.log(`Game ${gameId} is already being processed or completed, ignoring duplicate LeaveGame event`)
        return socket.emit('GameResponse', {
          status: 'success',
          message: 'Game already ended.',
        })
      }
      
      // Additional check: verify game status in Redis
      const redisGameData = await redis.get(`game_room:${gameId}`)
      if (redisGameData) {
        const redisGameRoom = JSON.parse(redisGameData)
        if (redisGameRoom.status === 'completed') {
          console.log(`Game ${gameId} is already completed in Redis, ignoring duplicate LeaveGame event`)
          return socket.emit('GameResponse', {
            status: 'success',
            message: 'Game already ended.',
          })
        }
      }
      
      // Mark game as being processed
      processingGames.add(gameId);
      
      console.log(`Player ${playerEmail} leaving game ${gameId}`)
      
      // Get current game state for final score
      const currentGameState = activeGames.get(gameId)
      const finalScore = currentGameState?.scores || { p1: 0, p2: 0 }
      
      // Determine winner and loser
      const otherPlayerEmail = gameRoom.hostEmail === playerEmail ? gameRoom.guestEmail : gameRoom.hostEmail;
      const winner = otherPlayerEmail;
      const loser = playerEmail;
      
      // Update game room with end time
      gameRoom.status = 'completed';
      gameRoom.endedAt = Date.now();
      gameRoom.winner = winner;
      gameRoom.leaver = loser;
      
      // Save match history
      await saveMatchHistory(gameId, gameRoom, winner, loser, finalScore, 'player_left');
      
      // Clean up game
      await cleanupGame(gameId, 'player_left');
      
      // Emit game end event to both players
      await emitToUsers(io, [gameRoom.hostEmail, gameRoom.guestEmail], 'GameEnded', {
        gameId,
        winner,
        loser,
        finalScore,
        gameDuration: gameRoom.startedAt && gameRoom.endedAt 
          ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
          : 0,
        reason: 'player_left',
        message: 'Opponent left the game. You win!'
      })
      
      // Notify the other player specifically
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
      
      console.log(`Player ${playerEmail} left game ${gameId}. Winner: ${winner}`)
      
      // Remove from processing set after a delay
      setTimeout(() => {
        processingGames.delete(gameId);
      }, 5000);
      
    } catch (error) {
      console.error('Error in LeaveGame handler:', error)
      socket.emit('GameResponse', {
        status: 'error',
        message: 'Failed to leave game.',
      })
      // Remove from processing set on error
      processingGames.delete(data.gameId);
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

      // Check if game is already being processed
      if (processingGames.has(gameId)) {
        console.log(`Game ${gameId} is already being processed, ignoring duplicate CancelGame event`)
        return socket.emit('GameResponse', {
          status: 'success',
          message: 'Game already being canceled.',
        })
      }

      // Mark game as being processed
      processingGames.add(gameId);

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

      // Remove from processing set after a delay
      setTimeout(() => {
        processingGames.delete(gameId);
      }, 5000);

    } catch (error) {
      socket.emit('GameResponse', {
        status: 'error',
        message: 'Failed to cancel game.',
      })
      // Remove from processing set on error
      processingGames.delete(data.gameId);
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