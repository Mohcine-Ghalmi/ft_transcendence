import { Socket, Server } from 'socket.io'
import redis, { getSocketIds } from '../../database/redis'
import {
  GameRoomData,
  matchmakingQueue,
  removeFromQueue,
  removeFromQueueByEmail,
  isInQueue,
  MatchmakingPlayer,
  GameSocketHandler,
  getPlayerData,
} from './game.socket.types'
import { createMatchHistory } from './game.service'
import { v4 as uuidv4 } from 'uuid'
import { getUserByEmail } from '../user/user.service'

// Function to clean up user's game data
async function cleanupUserGameData(
  email: string
): Promise<{ cleanedCount: number; details: any[] }> {
  const redisGameRooms = await redis.keys('game_room:*')
  let cleanedCount = 0
  let details: any = []

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
          if (
            gameRoom.status === 'completed' ||
            gameRoom.status === 'canceled' ||
            gameRoom.status === 'waiting' ||
            gameRoom.status === 'accepted' ||
            gameAge > 300000
          ) {
            // 5 minutes in milliseconds

            await redis.del(roomKey)
            cleanedCount++
            details.push({
              roomKey,
              status: 'cleaned',
              age: ageMinutes,
              reason:
                gameRoom.status === 'completed'
                  ? 'completed'
                  : gameRoom.status === 'canceled'
                  ? 'canceled'
                  : gameRoom.status === 'waiting'
                  ? 'waiting'
                  : gameRoom.status === 'accepted'
                  ? 'accepted'
                  : 'stale',
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
          error: 'Failed to parse game room data',
        })
      }
    }
  }

  return { cleanedCount, details }
}

export const handleMatchmaking: GameSocketHandler = (
  socket: Socket,
  io: Server
) => {
  // Handle socket disconnect - clean up user data
  socket.on('disconnect', async () => {
    try {
      // Find user email from socket ID in queue
      const playerInQueue = matchmakingQueue.find(
        (p) => p.socketId === socket.id
      )
      if (playerInQueue) {
        const { email } = playerInQueue

        // Remove from queue
        removeFromQueueByEmail(email)

        // Clean up any stale game data
        await cleanupUserGameData(email)
      }

      // Also clean up any stale queue entries (older than 2 minutes)
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(
        (player) => now - player.joinedAt > 120000
      ) // 2 minutes

      for (const player of stalePlayers) {
        removeFromQueueByEmail(player.email)
      }
    } catch (error) {
      console.error('Error cleaning up on disconnect:', error)
    }
  })

  // Join matchmaking queue
  socket.on('JoinMatchmaking', async (data: { email: string }) => {
    try {
      const { email } = data

      if (!email) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'Email is required.',
        })
      }

      // Check if user is already in queue
      if (isInQueue(email)) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'You are already in the matchmaking queue.',
        })
      }

      // Always clean up any stale game data first
      const { cleanedCount } = await cleanupUserGameData(email)
      if (cleanedCount > 0) {
      }

      // Clean up any stale queue entries (older than 2 minutes)
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(
        (player) => now - player.joinedAt > 120000
      ) // 2 minutes

      for (const player of stalePlayers) {
        removeFromQueueByEmail(player.email)
      }

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
              if (
                gameRoom.status === 'waiting' ||
                gameRoom.status === 'accepted' ||
                gameRoom.status === 'in_progress'
              ) {
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
          message:
            'You are already in an active game. Please finish or leave your current game first.',
        })
      }

      // Add to matchmaking queue
      const player: MatchmakingPlayer = {
        socketId: socket.id,
        email: email,
        joinedAt: Date.now(),
      }
      matchmakingQueue.push(player)

      socket.emit('MatchmakingResponse', {
        status: 'success',
        message: 'Joined matchmaking queue. Waiting for opponent...',
        queuePosition: matchmakingQueue.length,
      })

      // Try to find a match
      await tryMatchPlayers(io)
    } catch (error) {
      socket.emit('MatchmakingResponse', {
        status: 'error',
        message: 'Failed to join matchmaking queue.',
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
          message: 'Email is required.',
        })
      }

      // Remove from queue
      removeFromQueueByEmail(email)

      // Clean up any stale game data when leaving matchmaking
      const { cleanedCount } = await cleanupUserGameData(email)
      if (cleanedCount > 0) {
      }

      // Also clean up any stale queue entries (older than 2 minutes)
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(
        (player) => now - player.joinedAt > 120000
      ) // 2 minutes

      for (const player of stalePlayers) {
        removeFromQueueByEmail(player.email)
      }

      socket.emit('MatchmakingResponse', {
        status: 'success',
        message: 'Left matchmaking queue.',
      })
    } catch (error) {
      socket.emit('MatchmakingResponse', {
        status: 'error',
        message: 'Failed to leave matchmaking queue.',
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
          message: 'Email is required.',
        })
      }

      const inQueue = isInQueue(email)
      const queuePosition = inQueue
        ? matchmakingQueue.findIndex((p) => p.email === email) + 1
        : 0
      const totalInQueue = matchmakingQueue.length

      socket.emit('QueueStatusResponse', {
        status: 'success',
        inQueue,
        queuePosition,
        totalInQueue,
      })
    } catch (error) {
      socket.emit('QueueStatusResponse', {
        status: 'error',
        message: 'Failed to get queue status.',
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
          message: 'Email is required.',
        })
      }

      const { cleanedCount, details } = await cleanupUserGameData(email)

      socket.emit('CleanupResponse', {
        status: 'success',
        message: `Cleaned up ${cleanedCount} game room(s).`,
        cleanedCount,
        details,
      })
    } catch (error) {
      socket.emit('CleanupResponse', {
        status: 'error',
        message: 'Failed to clean up game data.',
      })
    }
  })

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

    // Fetch user data for both players
    const [player1User, player2User] = await Promise.all([
      getUserByEmail(player1.email),
      getUserByEmail(player2.email),
    ])
    const player1Data = getPlayerData(player1User)
    const player2Data = getPlayerData(player2User)

    // Create a new game room
    const gameId = uuidv4()
    const gameRoom: GameRoomData = {
      gameId,
      hostEmail: player1.email,
      guestEmail: player2.email,
      status: 'accepted',
      createdAt: Date.now(),
    }

    // Save game room to Redis
    await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))

    // Get socket IDs for both players
    const player1SocketIds =
      (await getSocketIds(player1.email, 'sockets')) || []
    const player2SocketIds =
      (await getSocketIds(player2.email, 'sockets')) || []

    // Notify both players about the match
    const matchData = {
      gameId,
      hostEmail: player1.email,
      guestEmail: player2.email,
      hostData: player1Data,
      guestData: player2Data,
      status: 'match_found',
      message: 'Match found! Game will start shortly.',
    }

    // Always assign host as player1 and guest as player2 for consistency
    io.to(player1SocketIds).emit('MatchFound', {
      gameId,
      hostEmail: player1.email,
      guestEmail: player2.email,
      hostData: player1Data,
      guestData: player2Data,
      status: 'match_found',
      message: 'Match found! You are Player 1 (Left Paddle).',
      playerPosition: 'player1',
    })

    io.to(player2SocketIds).emit('MatchFound', {
      gameId,
      hostEmail: player1.email,
      guestEmail: player2.email,
      hostData: player1Data,
      guestData: player2Data,
      status: 'match_found',
      message: 'Match found! You are Player 2 (Right Paddle).',
      playerPosition: 'player2',
    })

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
        hostData: player1Data,
        guestData: player2Data,
        startedAt: gameRoom.startedAt,
      })
    }, 3000) // 3 second delay before starting
  }
}
