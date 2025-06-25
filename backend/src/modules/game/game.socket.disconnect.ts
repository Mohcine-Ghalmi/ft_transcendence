// modules/game/game.socket.disconnect.ts
import { Socket, Server } from 'socket.io'
import redis from '../../utils/redis'
import { 
  GameRoomData, 
  activeGames, 
  gameRooms,
  GameSocketHandler 
} from './game.socket.types'
import { cleanupGame, saveMatchHistory, emitToUsers } from './game.socket.utils'

export const handleGameDisconnect: GameSocketHandler = (socket: Socket, io: Server) => {
  
  // Handle game cleanup on disconnect
  socket.on('disconnect', async () => {
    try {
      // Get user email from socket data
      const userEmail = (socket as any).userEmail
      
      if (userEmail) {
        // Find all active games for this user
        const redisGameRooms = await redis.keys('game_room:*')
        
        for (const roomKey of redisGameRooms) {
          const gameRoomData = await redis.get(roomKey)
          if (gameRoomData) {
            const gameRoom: GameRoomData = JSON.parse(gameRoomData)
            
            // Check if this user is in this game
            if (gameRoom.hostEmail === userEmail || gameRoom.guestEmail === userEmail) {
              const gameId = gameRoom.gameId
              
              // If game is in progress, mark the other player as winner
              if (gameRoom.status === 'in_progress') {
                const otherPlayerEmail = gameRoom.hostEmail === userEmail ? gameRoom.guestEmail : gameRoom.hostEmail
                const winner = otherPlayerEmail
                const loser = userEmail
                
                // Get current game state for final score
                const currentGameState = activeGames.get(gameId)
                const finalScore = currentGameState?.scores || { p1: 0, p2: 0 }
                
                // Save match history
                await saveMatchHistory(gameId, gameRoom, winner, loser, finalScore, 'player_left');
                
                // Clean up game
                await cleanupGame(gameId, 'player_left');
                
                // Emit game end event
                const otherPlayerSocketIds = await (await import('../../socket')).getSocketIds(otherPlayerEmail, 'sockets') || []
                io.to(otherPlayerSocketIds).emit('GameEnded', {
                  gameId,
                  winner,
                  loser,
                  finalScore,
                  gameDuration: gameRoom.startedAt && gameRoom.endedAt 
                    ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
                    : 0,
                  reason: 'player_left'
                })
              } else if (gameRoom.status === 'accepted') {
                // Game was accepted but not started yet - mark as canceled
                const otherPlayerEmail = gameRoom.hostEmail === userEmail ? gameRoom.guestEmail : gameRoom.hostEmail
                
                // Clean up game
                await cleanupGame(gameId, 'timeout');
                
                // Notify other player
                const otherPlayerSocketIds = await (await import('../../socket')).getSocketIds(otherPlayerEmail, 'sockets') || []
                io.to(otherPlayerSocketIds).emit('PlayerLeft', {
                  gameId,
                  playerWhoLeft: userEmail,
                  reason: 'disconnected'
                })
              }
              
              break // Only handle one game per user
            }
          }
        }
      }
    } catch (error) {
      // Error handling for disconnect cleanup
    }
  })
} 