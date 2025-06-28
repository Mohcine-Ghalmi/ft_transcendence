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
        console.log(`User ${userEmail} disconnected, checking for active games...`)
        
        // Find all active games for this user
        const redisGameRooms = await redis.keys('game_room:*')
        
        for (const roomKey of redisGameRooms) {
          const gameRoomData = await redis.get(roomKey)
          if (gameRoomData) {
            const gameRoom: GameRoomData = JSON.parse(gameRoomData)
            
            // Check if this user is in this game
            if (gameRoom.hostEmail === userEmail || gameRoom.guestEmail === userEmail) {
              const gameId = gameRoom.gameId
              const otherPlayerEmail = gameRoom.hostEmail === userEmail ? gameRoom.guestEmail : gameRoom.hostEmail
              
              console.log(`Found active game ${gameId} for disconnected user ${userEmail}`)
              
              // If game is in progress, mark the other player as winner and save to match history
              if (gameRoom.status === 'in_progress') {
                console.log(`Game ${gameId} was in progress, ending game due to disconnect`)
                
                const winner = otherPlayerEmail
                const loser = userEmail
                
                // Get current game state for final score
                const currentGameState = activeGames.get(gameId)
                const finalScore = currentGameState?.scores || { p1: 0, p2: 0 }
                
                // Update game room with end time
                gameRoom.status = 'completed'
                gameRoom.endedAt = Date.now()
                gameRoom.winner = winner
                gameRoom.leaver = loser
                await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
                
                // Save match history
                await saveMatchHistory(gameId, gameRoom, winner, loser, finalScore, 'player_left')
                
                // Clean up game
                await cleanupGame(gameId, 'player_left')
                
                // Emit game end event to remaining player
                const otherPlayerSocketIds = await (await import('../../socket')).getSocketIds(otherPlayerEmail, 'sockets') || []
                io.to(otherPlayerSocketIds).emit('GameEnded', {
                  gameId,
                  winner,
                  loser,
                  finalScore,
                  gameDuration: gameRoom.startedAt && gameRoom.endedAt 
                    ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
                    : 0,
                  reason: 'player_left',
                  message: 'Opponent disconnected. You win!'
                })
                
                console.log(`Game ${gameId} ended due to disconnect. Winner: ${winner}, Loser: ${loser}`)
              } else if (gameRoom.status === 'accepted') {
                // Game was accepted but not started yet - mark as canceled
                console.log(`Game ${gameId} was accepted but not started, canceling due to disconnect`)
                
                // Update game room
                gameRoom.status = 'canceled'
                gameRoom.endedAt = Date.now()
                gameRoom.leaver = userEmail
                await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
                
                // Clean up game
                await cleanupGame(gameId, 'timeout')
                
                // Notify other player
                const otherPlayerSocketIds = await (await import('../../socket')).getSocketIds(otherPlayerEmail, 'sockets') || []
                io.to(otherPlayerSocketIds).emit('GameEndedByOpponentLeave', {
                  gameId,
                  winner: otherPlayerEmail,
                  leaver: userEmail,
                  message: 'Opponent disconnected before the game started.'
                })
                
                console.log(`Game ${gameId} canceled due to disconnect before start`)
              }
              
              break // Only handle one game per user
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in game disconnect handler:', error)
    }
  })
} 
