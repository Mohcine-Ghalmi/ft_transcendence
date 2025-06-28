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
  GameSocketHandler,
  getPlayerData
} from './game.socket.types'
import { createMatchHistory } from './game.service'
import { v4 as uuidv4 } from 'uuid'
import { getUserByEmail } from '../user/user.service'

// Function to clean up user's game data
async function cleanupUserGameData(email: string): Promise<{ cleanedCount: number, details: any[] }> {
  const redisGameRooms = await redis.keys('game_room:*')
  let cleanedCount = 0
  let details = []
  
  for (const roomKey of redisGameRooms) {
    const gameRoomData = await redis.get(roomKey)
    if (gameRoomData) {
      try {
        const gameRoom: GameRoomData = JSON.parse(gameRoomData)
        
        // Check if user is in this game
        if (gameRoom.hostEmail === email || gameRoom.guestEmail === email) {
          const gameAge = Date.now() - gameRoom.createdAt
          const ageMinutes = Math.round(gameAge / 1000 / 60)
          
          // Clean up if game is completed, canceled, waiting, accepted, or older than 5 minutes
          if (gameRoom.status === 'completed' || 
              gameRoom.status === 'canceled' || 
              gameRoom.status === 'waiting' ||
              gameRoom.status === 'accepted' ||
              gameAge > 300000) { // 5 minutes in milliseconds
            
            await redis.del(roomKey)
            cleanedCount++
            details.push({
              roomKey,
              status: 'cleaned',
              age: ageMinutes,
              reason: gameRoom.status === 'completed' ? 'completed' : 
                     gameRoom.status === 'canceled' ? 'canceled' : 
                     gameRoom.status === 'waiting' ? 'waiting' :
                     gameRoom.status === 'accepted' ? 'accepted' : 'stale'
            })
          }
        }
      } catch (parseError) {
        // If we can't parse the game room data, it's corrupted, so delete it
        await redis.del(roomKey)
        cleanedCount++
        details.push({
          roomKey,
          status: 'corrupted',
          error: 'Failed to parse game room data'
        })
      }
    }
  }
  
  return { cleanedCount, details }
}

export const handleMatchmaking: GameSocketHandler = (socket: Socket, io: Server) => {
  
  // Periodic cleanup of stale queue entries
  const cleanupStaleQueueEntries = () => {
    const now = Date.now()
    const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000) // 2 minutes
    
    if (stalePlayers.length > 0) {
      console.log(`Cleaning up ${stalePlayers.length} stale players from matchmaking queue`)
      
      for (const player of stalePlayers) {
        removeFromQueueByEmail(player.email)
        console.log(`Removed stale player ${player.email} from matchmaking queue during periodic cleanup`)
      }
      
      console.log(`Matchmaking queue size after cleanup: ${matchmakingQueue.length}`)
    }
  }

  // Run cleanup every 30 seconds
  const cleanupInterval = setInterval(cleanupStaleQueueEntries, 30000)
  
  // Periodic matchmaking attempts every 10 seconds
  const matchmakingInterval = setInterval(() => {
    if (matchmakingQueue.length >= 2) {
      console.log(`Periodic matchmaking attempt with ${matchmakingQueue.length} players in queue`)
      tryMatchPlayers(io)
    }
  }, 10000)
  
  // Handle socket disconnect - clean up user data
  socket.on('disconnect', async () => {
    try {
      // Find user email from socket ID in queue
      const playerInQueue = matchmakingQueue.find(p => p.socketId === socket.id)
      if (playerInQueue) {
        const { email } = playerInQueue
        console.log(`User ${email} disconnected, cleaning up game data...`)
        
        // Remove from queue
        removeFromQueueByEmail(email)
        
        // Clean up any stale game data
        await cleanupUserGameData(email)
      }
      
      // Also clean up any stale queue entries (older than 2 minutes)
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000) // 2 minutes
      
      for (const player of stalePlayers) {
        removeFromQueueByEmail(player.email)
        console.log(`Removed stale player ${player.email} from matchmaking queue on disconnect`)
      }
      
    } catch (error) {
      console.error('Error cleaning up on disconnect:', error)
    } finally {
      // Clean up intervals
      clearInterval(cleanupInterval)
      clearInterval(matchmakingInterval)
    }
  })

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

      // Always clean up any stale game data first
      const { cleanedCount } = await cleanupUserGameData(email)
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} stale game rooms for ${email}`)
      }

      // Clean up any stale queue entries (older than 2 minutes)
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000) // 2 minutes
      
      for (const player of stalePlayers) {
        removeFromQueueByEmail(player.email)
        console.log(`Removed stale player ${player.email} from matchmaking queue when joining`)
      }

      // Remove user from queue if they're already there (clean slate approach)
      removeFromQueueByEmail(email)

      // Check if user is still in an active game after cleanup
      const redisGameRooms = await redis.keys('game_room:*')
      let hasActiveGame = false
      
      for (const roomKey of redisGameRooms) {
        const gameRoomData = await redis.get(roomKey)
        if (gameRoomData) {
          try {
            const gameRoom: GameRoomData = JSON.parse(gameRoomData)
            
            // Check if user is in this game
            if (gameRoom.hostEmail === email || gameRoom.guestEmail === email) {
              // If game is still active, prevent joining matchmaking
              if (gameRoom.status === 'waiting' || gameRoom.status === 'accepted' || gameRoom.status === 'in_progress') {
                hasActiveGame = true
                break
              }
            }
          } catch (parseError) {
            // Ignore parse errors, corrupted data was already cleaned up
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

      console.log(`User ${email} joined matchmaking queue. Queue size: ${matchmakingQueue.length}`)

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

      // Clean up any stale game data when leaving matchmaking
      const { cleanedCount } = await cleanupUserGameData(email)
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} stale game rooms for ${email} when leaving matchmaking`)
      }

      // Also clean up any stale queue entries (older than 2 minutes)
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000) // 2 minutes
      
      for (const player of stalePlayers) {
        removeFromQueueByEmail(player.email)
        console.log(`Removed stale player ${player.email} from matchmaking queue when leaving`)
      }

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

      // Add debug information
      const queueInfo = matchmakingQueue.map((player, index) => ({
        position: index + 1,
        email: player.email,
        joinedAt: new Date(player.joinedAt).toISOString(),
        waitTime: Math.round((Date.now() - player.joinedAt) / 1000)
      }))

      socket.emit('QueueStatusResponse', {
        status: 'success',
        inQueue,
        queuePosition,
        totalInQueue,
        queueInfo, // Debug information
        timestamp: Date.now()
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

      const { cleanedCount, details } = await cleanupUserGameData(email)

      socket.emit('CleanupResponse', {
        status: 'success',
        message: `Cleaned up ${cleanedCount} game room(s).`,
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

  // Handle player leaving before game starts
  socket.on('PlayerLeftBeforeGameStart', async (data: { gameId: string; leaver: string }) => {
    try {
      const { gameId, leaver } = data
      
      if (!gameId || !leaver) {
        return
      }

      // Get game room data
      const gameRoomData = await redis.get(`game_room:${gameId}`)
      if (!gameRoomData) {
        return
      }

      const gameRoom: GameRoomData = JSON.parse(gameRoomData)
      
      // Only handle if game hasn't started yet
      if (gameRoom.status !== 'accepted') {
        return
      }

      // Determine winner (the player who didn't leave)
      const winner = gameRoom.hostEmail === leaver ? gameRoom.guestEmail : gameRoom.hostEmail

      // Update game status
      gameRoom.status = 'ended'
      gameRoom.endedAt = Date.now()
      gameRoom.winner = winner
      gameRoom.leaver = leaver
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))

      // Get socket IDs for both players
      const [hostSocketIds, guestSocketIds] = await Promise.all([
        getSocketIds(gameRoom.hostEmail, 'sockets') || [],
        getSocketIds(gameRoom.guestEmail, 'sockets') || []
      ])

      // Notify both players
      io.to([...hostSocketIds, ...guestSocketIds]).emit('GameEndedByOpponentLeave', {
        gameId,
        winner,
        leaver,
        message: 'Opponent left before the game started.'
      })

    } catch (error) {
      console.error('Error handling player leaving before game start:', error)
    }
  })

  // Handle player leaving during matchmaking game (same as OneVsOne)
  socket.on('LeaveMatchmakingGame', async (data: { gameId: string; playerEmail: string }) => {
    try {
      const { gameId, playerEmail } = data
      
      if (!gameId || !playerEmail) {
        return
      }

      // Get game room data
      const gameRoomData = await redis.get(`game_room:${gameId}`)
      if (!gameRoomData) {
        return
      }

      const gameRoom: GameRoomData = JSON.parse(gameRoomData)
      
      // Determine winner (the player who didn't leave)
      const winner = gameRoom.hostEmail === playerEmail ? gameRoom.guestEmail : gameRoom.hostEmail
      const loser = playerEmail

      // Update game status
      gameRoom.status = 'ended'
      gameRoom.endedAt = Date.now()
      gameRoom.winner = winner
      gameRoom.leaver = loser
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))

      // Get socket IDs for both players
      const [hostSocketIds, guestSocketIds] = await Promise.all([
        getSocketIds(gameRoom.hostEmail, 'sockets') || [],
        getSocketIds(gameRoom.guestEmail, 'sockets') || []
      ])

      // Notify both players about the game ending
      io.to([...hostSocketIds, ...guestSocketIds]).emit('GameEnded', {
        gameId,
        winner,
        loser,
        message: 'Game ended due to player leaving.',
        reason: 'player_left'
      })

      // Clean up the game room immediately
      await redis.del(`game_room:${gameId}`)
      
      // Import gameRooms to remove from map
      const { gameRooms } = await import('./game.socket.types')
      gameRooms.delete(gameId)

    } catch (error) {
      console.error('Error handling player leaving matchmaking game:', error)
    }
  })

  // Manual trigger for matchmaking (for testing/debugging)
  socket.on('TriggerMatchmaking', async () => {
    try {
      console.log(`Manual matchmaking trigger requested. Queue size: ${matchmakingQueue.length}`)
      
      if (matchmakingQueue.length >= 2) {
        await tryMatchPlayers(io)
        socket.emit('MatchmakingResponse', {
          status: 'success',
          message: `Manual matchmaking triggered. Attempted to match ${matchmakingQueue.length} players.`
        })
      } else {
        socket.emit('MatchmakingResponse', {
          status: 'info',
          message: `Not enough players for matchmaking. Queue size: ${matchmakingQueue.length}`
        })
      }
    } catch (error) {
      console.error('Error in manual matchmaking trigger:', error)
      socket.emit('MatchmakingResponse', {
        status: 'error',
        message: 'Failed to trigger matchmaking.'
      })
    }
  })

  // Function to try matching players in the queue
  async function tryMatchPlayers(io: Server) {
    try {
      if (matchmakingQueue.length < 2) {
        return // Need at least 2 players to match
      }

      // Get first two players from queue
      const player1 = matchmakingQueue.shift()!
      const player2 = matchmakingQueue.shift()!

      if (!player1 || !player2) {
        return
      }

      // Prevent matching a user with themselves
      if (player1.email === player2.email) {
        console.log(`Preventing self-match for user: ${player1.email}`)
        // Put the player back in queue and try again
        matchmakingQueue.unshift(player1)
        // Recursively try to match again
        setTimeout(() => tryMatchPlayers(io), 1000)
        return
      }

      // Verify both players are still connected
      const player1Socket = io.sockets.sockets.get(player1.socketId)
      const player2Socket = io.sockets.sockets.get(player2.socketId)

      if (!player1Socket || !player2Socket) {
        console.log(`One or both players disconnected during matchmaking: ${player1.email}, ${player2.email}`)
        // Put the connected player back in queue if they exist
        if (player1Socket) {
          matchmakingQueue.unshift(player1)
        }
        if (player2Socket) {
          matchmakingQueue.unshift(player2)
        }
        return
      }

      // Fetch user data for both players
      const [player1User, player2User] = await Promise.all([
        getUserByEmail(player1.email),
        getUserByEmail(player2.email)
      ])

      if (!player1User || !player2User) {
        console.log(`Failed to fetch user data for matchmaking: ${player1.email}, ${player2.email}`)
        // Put players back in queue
        matchmakingQueue.unshift(player1, player2)
        return
      }

      const player1Data = getPlayerData(player1User)
      const player2Data = getPlayerData(player2User)

      // Create a new game room using the same system as OneVsOne
      const gameId = uuidv4()
      const gameRoom: GameRoomData = {
        gameId,
        hostEmail: player1.email, // Use player1 as host for consistency with OneVsOne
        guestEmail: player2.email,
        status: 'accepted', // Start with 'accepted' status like OneVsOne
        createdAt: Date.now()
      }

      // Save game room to Redis and add to gameRooms map
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
      
      // Import gameRooms from types to add the room
      const { gameRooms } = await import('./game.socket.types')
      gameRooms.set(gameId, gameRoom)

      // Get socket IDs for both players
      const player1SocketIds = await getSocketIds(player1.email, 'sockets') || []
      const player2SocketIds = await getSocketIds(player2.email, 'sockets') || []

      // Notify both players about the match - use the same format as OneVsOne
      const matchData = {
        gameId,
        hostEmail: player1.email,
        guestEmail: player2.email,
        hostData: player1Data,
        guestData: player2Data,
        status: 'match_found',
        message: 'Match found! Game will start shortly.'
      }

      io.to([...player1SocketIds, ...player2SocketIds]).emit('MatchFound', matchData)

      console.log(`Match created: ${player1.email} vs ${player2.email} (Game ID: ${gameId})`)

      // Wait a moment for players to prepare, then start the game
      setTimeout(async () => {
        try {
          // Verify game room still exists
          const currentGameRoomData = await redis.get(`game_room:${gameId}`)
          if (!currentGameRoomData) {
            console.log(`Game room ${gameId} no longer exists, skipping game start`)
            return
          }

          // Update game status to in_progress
          gameRoom.status = 'in_progress'
          gameRoom.startedAt = Date.now()
          await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
          gameRooms.set(gameId, gameRoom)

          // Notify players that game is starting
          io.to([...player1SocketIds, ...player2SocketIds]).emit('GameStarting', {
            gameId,
            hostEmail: player1.email,
            guestEmail: player2.email,
            hostData: player1Data,
            guestData: player2Data,
            startedAt: gameRoom.startedAt
          })

          console.log(`Game ${gameId} started successfully`)
        } catch (error) {
          console.error(`Error starting game ${gameId}:`, error)
        }
      }, 3000) // 3 second delay before starting

    } catch (error) {
      console.error('Error in tryMatchPlayers:', error)
      // If there was an error, try to put players back in queue
      if (matchmakingQueue.length >= 0) {
        setTimeout(() => tryMatchPlayers(io), 2000) // Retry after 2 seconds
      }
    }
  }
} 