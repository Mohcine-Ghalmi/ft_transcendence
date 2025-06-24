import { Socket, Server } from 'socket.io'
import redis from '../../utils/redis'
import { getSocketIds } from '../../socket'
import { 
  GameRoomData, 
  matchmakingQueue,
  removeFromQueue,
  removeFromQueueByEmail,
  isInQueue,
  MatchmakingPlayer,
  GameSocketHandler 
} from './game.socket.types'
import { createMatchHistory } from './game.service'
import { v4 as uuidv4 } from 'uuid'

export const handleMatchmaking: GameSocketHandler = (socket: Socket, io: Server) => {
  
  // Join matchmaking queue
  socket.on('JoinMatchmaking', async (data: { email: string }) => {
    try {
      const { email } = data
      
      if (!email) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'Email is required.'
        })
      }

      // Check if user is already in queue
      if (isInQueue(email)) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'You are already in the matchmaking queue.'
        })
      }

      // Check if user is already in an active game and clean up stale data
      const redisGameRooms = await redis.keys('game_room:*')
      let hasActiveGame = false
      let cleanedCount = 0
      
      for (const roomKey of redisGameRooms) {
        const gameRoomData = await redis.get(roomKey)
        if (gameRoomData) {
          try {
            const gameRoom: GameRoomData = JSON.parse(gameRoomData)
            
            // Check if user is in this game
            if (gameRoom.hostEmail === email || gameRoom.guestEmail === email) {
              // If game is completed or canceled, clean it up
              if (gameRoom.status === 'completed' || gameRoom.status === 'canceled') {
                await redis.del(roomKey)
                cleanedCount++
                continue
              }
              
              // If game is older than 30 minutes, consider it stale and clean it up
              const gameAge = Date.now() - gameRoom.createdAt
              if (gameAge > 1800000) { // 30 minutes in milliseconds
                await redis.del(roomKey)
                cleanedCount++
                continue
              }
              
              // If game is still active, prevent joining matchmaking
              if (gameRoom.status === 'waiting' || gameRoom.status === 'accepted' || gameRoom.status === 'in_progress') {
                hasActiveGame = true
                break
              }
            }
          } catch (parseError) {
            // If we can't parse the game room data, it's corrupted, so delete it
            await redis.del(roomKey)
            cleanedCount++
          }
        }
      }

      if (hasActiveGame) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'You are already in an active game. Please finish or leave your current game first.'
        })
      }

      // Add to matchmaking queue
      const player: MatchmakingPlayer = {
        socketId: socket.id,
        email: email,
        joinedAt: Date.now()
      }
      matchmakingQueue.push(player)

      socket.emit('MatchmakingResponse', {
        status: 'success',
        message: 'Joined matchmaking queue. Waiting for opponent...',
        queuePosition: matchmakingQueue.length
      })

      // Try to find a match
      await tryMatchPlayers(io)

    } catch (error) {
      console.error('Error joining matchmaking:', error)
      socket.emit('MatchmakingResponse', {
        status: 'error',
        message: 'Failed to join matchmaking queue.'
      })
    }
  })

  // Leave matchmaking queue
  socket.on('LeaveMatchmaking', async (data: { email: string }) => {
    try {
      const { email } = data
      
      if (!email) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'Email is required.'
        })
      }

      // Remove from queue
      removeFromQueueByEmail(email)

      socket.emit('MatchmakingResponse', {
        status: 'success',
        message: 'Left matchmaking queue.'
      })

    } catch (error) {
      console.error('Error leaving matchmaking:', error)
      socket.emit('MatchmakingResponse', {
        status: 'error',
        message: 'Failed to leave matchmaking queue.'
      })
    }
  })

  // Get queue status
  socket.on('GetQueueStatus', async (data: { email: string }) => {
    try {
      const { email } = data
      
      if (!email) {
        return socket.emit('QueueStatusResponse', {
          status: 'error',
          message: 'Email is required.'
        })
      }

      const inQueue = isInQueue(email)
      const queuePosition = inQueue ? matchmakingQueue.findIndex(p => p.email === email) + 1 : 0
      const totalInQueue = matchmakingQueue.length

      socket.emit('QueueStatusResponse', {
        status: 'success',
        inQueue,
        queuePosition,
        totalInQueue
      })

    } catch (error) {
      console.error('Error getting queue status:', error)
      socket.emit('QueueStatusResponse', {
        status: 'error',
        message: 'Failed to get queue status.'
      })
    }
  })

  // Clean up stale game data for a user
  socket.on('CleanupGameData', async (data: { email: string }) => {
    try {
      const { email } = data
      
      if (!email) {
        return socket.emit('CleanupResponse', {
          status: 'error',
          message: 'Email is required.'
        })
      }

      const redisGameRooms = await redis.keys('game_room:*')
      let cleanedCount = 0
      let details = []
      
      for (const roomKey of redisGameRooms) {
        const gameRoomData = await redis.get(roomKey)
        if (gameRoomData) {
          try {
            const gameRoom = JSON.parse(gameRoomData)
            
            // Check if user is in this game
            if (gameRoom.hostEmail === email || gameRoom.guestEmail === email) {
              const gameAge = Date.now() - gameRoom.createdAt
              const ageMinutes = Math.round(gameAge / 1000 / 60)
              
              details.push({
                roomKey,
                status: gameRoom.status,
                age: ageMinutes,
                hostEmail: gameRoom.hostEmail,
                guestEmail: gameRoom.guestEmail
              })
              
              // Remove the game room
              await redis.del(roomKey)
              cleanedCount++
            }
          } catch (parseError) {
            // If we can't parse the game room data, it's corrupted, so delete it
            await redis.del(roomKey)
            cleanedCount++
            details.push({
              roomKey,
              error: 'Corrupted data',
              rawData: gameRoomData.substring(0, 100) + '...'
            })
          }
        }
      }

      socket.emit('CleanupResponse', {
        status: 'success',
        message: `Cleaned up ${cleanedCount} game room(s) for user.`,
        cleanedCount,
        details
      })

    } catch (error) {
      console.error('Error cleaning up game data:', error)
      socket.emit('CleanupResponse', {
        status: 'error',
        message: 'Failed to clean up game data.'
      })
    }
  })

  // Handle disconnect from matchmaking
  socket.on('disconnect', () => {
    // Remove from queue if disconnected
    removeFromQueue(socket.id)
  })
}

// Function to try matching players in the queue
async function tryMatchPlayers(io: Server) {
  if (matchmakingQueue.length < 2) {
    return // Need at least 2 players to match
  }

  // Get first two players from queue
  const player1 = matchmakingQueue.shift()!
  const player2 = matchmakingQueue.shift()!

  if (!player1 || !player2) {
    return
  }

  // Create a new game room
  const gameId = uuidv4()
  const gameRoom: GameRoomData = {
    gameId,
    hostEmail: player1.email,
    guestEmail: player2.email,
    status: 'accepted',
    createdAt: Date.now()
  }

  // Save game room to Redis
  await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))

  // Get socket IDs for both players
  const player1SocketIds = await getSocketIds(player1.email, 'sockets') || []
  const player2SocketIds = await getSocketIds(player2.email, 'sockets') || []

  // Notify both players about the match
  const matchData = {
    gameId,
    hostEmail: player1.email,
    guestEmail: player2.email,
    status: 'match_found',
    message: 'Match found! Game will start shortly.'
  }

  io.to([...player1SocketIds, ...player2SocketIds]).emit('MatchFound', matchData)

  // Wait a moment for players to prepare, then start the game
  setTimeout(async () => {
    // Update game status to in_progress
    gameRoom.status = 'in_progress'
    gameRoom.startedAt = Date.now()
    await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))

    // Notify players that game is starting
    io.to([...player1SocketIds, ...player2SocketIds]).emit('GameStarting', {
      gameId,
      hostEmail: player1.email,
      guestEmail: player2.email,
      startedAt: gameRoom.startedAt
    })
  }, 3000) // 3 second delay before starting
} 