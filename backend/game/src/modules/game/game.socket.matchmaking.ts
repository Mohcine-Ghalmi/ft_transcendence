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
  activeGames,
  gameRooms,
  addUserToGameSession,
  cleanupUserSession,
  socketToUser,
  userGameSessions,
  activeGameSessions,
  hasActiveSockets,
  getUserCurrentGame
} from './game.socket.types'
import { v4 as uuidv4 } from 'uuid'
import { getUserByEmail } from '../user/user.service'
import { saveMatchHistory, cleanupGame, emitToUsers } from './game.socket.utils'

// Helper function to remove all queue entries for a user (prevent duplicates)
function removeAllQueueEntriesForUser(email: string): number {
  let removedCount = 0
  for (let i = matchmakingQueue.length - 1; i >= 0; i--) {
    if (matchmakingQueue[i].email === email) {
      matchmakingQueue.splice(i, 1)
      removedCount++
    }
  }
  return removedCount
}

// Helper function to check if user can join matchmaking
async function canUserJoinMatchmaking(email: string): Promise<{
  canJoin: boolean
  reason?: string
  conflictGameId?: string
}> {
  // Check if user is already in queue
  if (isInQueue(email)) {
    return { canJoin: false, reason: 'Already in matchmaking queue' }
  }

  // Check for active game sessions
  const currentGameId = getUserCurrentGame(email)
  if (currentGameId) {
    const gameRoom = gameRooms.get(currentGameId)
    if (gameRoom && (gameRoom.status === 'accepted' || gameRoom.status === 'in_progress')) {
      return { 
        canJoin: false, 
        reason: 'Already in an active game',
        conflictGameId: currentGameId
      }
    }
  }

  // Check Redis for any active game rooms
  const redisGameRooms = await redis.keys('game_room:*')
  for (const roomKey of redisGameRooms) {
    const gameRoomData = await redis.get(roomKey)
    if (gameRoomData) {
      try {
        const gameRoom: GameRoomData = JSON.parse(gameRoomData)
        if ((gameRoom.hostEmail === email || gameRoom.guestEmail === email) && 
            (gameRoom.status === 'accepted' || gameRoom.status === 'in_progress')) {
          return { 
            canJoin: false, 
            reason: 'Already in an active game',
            conflictGameId: gameRoom.gameId
          }
        }
      } catch (parseError) {
        // Clean up corrupted data
        await redis.del(roomKey)
      }
    }
  }

  return { canJoin: true }
}

// Enhanced cleanup function
async function cleanupUserGameData(email: string): Promise<{ cleanedCount: number; details: any[] }> {
  const redisGameRooms = await redis.keys('game_room:*')
  let cleanedCount = 0
  let details: any = []

  // Remove from matchmaking queue first
  const queueRemoved = removeAllQueueEntriesForUser(email)
  if (queueRemoved > 0) {
    cleanedCount += queueRemoved
    details.push({
      type: 'queue',
      status: 'cleaned',
      count: queueRemoved,
      reason: 'removed_from_queue'
    })
  }

  // Clean up game sessions
  const userGameId = getUserCurrentGame(email)
  if (userGameId) {
    const gameSessions = activeGameSessions.get(userGameId)
    if (gameSessions) {
      // Remove user's sessions from this game
      const userSocketIds = await getSocketIds(email, 'sockets') || []
      for (const socketId of userSocketIds) {
        if (gameSessions.has(socketId)) {
          gameSessions.delete(socketId)
          cleanedCount++
        }
      }
      
      // If no sessions left, remove the game
      if (gameSessions.size === 0) {
        activeGameSessions.delete(userGameId)
      }
    }
    
    // Clear user game session mapping
    userGameSessions.delete(email)
  }

  // Clean up Redis game rooms
  for (const roomKey of redisGameRooms) {
    const gameRoomData = await redis.get(roomKey)
    if (gameRoomData) {
      try {
        const gameRoom: GameRoomData = JSON.parse(gameRoomData)

        if (gameRoom.hostEmail === email || gameRoom.guestEmail === email) {
          const gameAge = Date.now() - gameRoom.createdAt
          const ageMinutes = Math.round(gameAge / 1000 / 60)

          // Clean up stale, completed, or waiting games
          if (
            gameRoom.status === 'completed' ||
            gameRoom.status === 'canceled' ||
            gameRoom.status === 'waiting' ||
            gameAge > 300000 // 5 minutes
          ) {
            await redis.del(roomKey)
            cleanedCount++
            details.push({
              roomKey,
              status: 'cleaned',
              age: ageMinutes,
              reason: gameRoom.status === 'completed' ? 'completed' :
                     gameRoom.status === 'canceled' ? 'canceled' :
                     gameRoom.status === 'waiting' ? 'waiting' : 'stale'
            })
          }
        }
      } catch (parseError) {
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

const processingGames = new Set<string>()

export const handleMatchmaking: GameSocketHandler = (socket: Socket, io: Server) => {
  // Handle socket disconnect
  socket.on('disconnect', async () => {
    try {
      const userEmail = socketToUser.get(socket.id)
      
      if (userEmail) {
        cleanupUserSession(userEmail, socket.id)
        
        // Remove ALL queue entries for this user (not just by socket)
        removeAllQueueEntriesForUser(userEmail)
        
        // Clean up any stale game data
        await cleanupUserGameData(userEmail)

        // Handle case where player disconnects after match found but before game starts
        const currentGameId = getUserCurrentGame(userEmail)
        if (currentGameId && !hasActiveSockets(userEmail)) {
          const gameRoom = gameRooms.get(currentGameId)
          
          if (gameRoom && (gameRoom.status === 'accepted' || gameRoom.status === 'waiting')) {
            
            gameRoom.status = 'canceled'
            gameRoom.endedAt = Date.now()
            gameRoom.leaver = userEmail
            
            const otherPlayerEmail = gameRoom.hostEmail === userEmail 
              ? gameRoom.guestEmail 
              : gameRoom.hostEmail
            
            const winner = otherPlayerEmail
            const loser = userEmail
            
            gameRoom.winner = winner
            gameRoom.loser = loser
            
            await saveMatchHistory(currentGameId, gameRoom, winner, loser, { p1: 0, p2: 0 }, 'player_left')
            await cleanupGame(currentGameId, 'player_left')
            
            const otherPlayerSockets = await getSocketIds(otherPlayerEmail, 'sockets') || []
            if (otherPlayerSockets.length > 0) {
              io.to(otherPlayerSockets).emit('MatchmakingPlayerLeft', {
                gameId: currentGameId,
                winner,
                loser,
                message: 'Opponent left before the game started. You win!',
                reason: 'player_left'
              })
              
              io.to(otherPlayerSockets).emit('GameEnded', {
                gameId: currentGameId,
                winner,
                loser,
                finalScore: { p1: 0, p2: 0 },
                gameDuration: 0,
                reason: 'player_left',
                message: 'Opponent left before the game started. You win!'
              })
            }
          }
        }
      }

      // Clean up stale queue entries
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000)
      for (const player of stalePlayers) {
        removeAllQueueEntriesForUser(player.email)
      }
    } catch (error) {
      console.error('Error cleaning up on disconnect:', error)
    }
  })

  // Join matchmaking queue - ENHANCED
  socket.on('JoinMatchmaking', async (data: { email: string }) => {
    try {
      const { email } = data

      if (!email) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'Email is required.',
        })
      }

      // Map socket to user for session tracking
      socketToUser.set(socket.id, email)

      // Check if user can join matchmaking
      const { canJoin, reason, conflictGameId } = await canUserJoinMatchmaking(email)
      
      if (!canJoin) {
        if (conflictGameId) {
          // Try to clean up the conflicting game first
          await cleanupUserGameData(email)
          
          // Recheck after cleanup
          const recheckResult = await canUserJoinMatchmaking(email)
          if (!recheckResult.canJoin) {
            return socket.emit('MatchmakingResponse', {
              status: 'error',
              message: reason || 'Cannot join matchmaking',
              conflictGameId
            })
          }
        } else {
          return socket.emit('MatchmakingResponse', {
            status: 'error',
            message: reason || 'Cannot join matchmaking'
          })
        }
      }

      // Remove any existing queue entries for this user (prevent duplicates)
      removeAllQueueEntriesForUser(email)


      // Clean up stale queue entries
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000)
      for (const player of stalePlayers) {
        removeAllQueueEntriesForUser(player.email)
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

  // Leave matchmaking queue - ENHANCED
  socket.on('LeaveMatchmaking', async (data: { email: string }) => {
    try {
      const { email } = data

      if (!email) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'Email is required.',
        })
      }

      cleanupUserSession(email, socket.id)

      // Remove ALL queue entries for this user
      const removedCount = removeAllQueueEntriesForUser(email)
      
      // Clean up any stale game data
      const { cleanedCount } = await cleanupUserGameData(email)

      // Clean up stale queue entries
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000)
      for (const player of stalePlayers) {
        removeAllQueueEntriesForUser(player.email)
      }

      socket.emit('MatchmakingResponse', {
        status: 'success',
        message: 'Left matchmaking queue.',
        removedEntries: removedCount
      })
    } catch (error) {
      socket.emit('MatchmakingResponse', {
        status: 'error',
        message: 'Failed to leave matchmaking queue.',
      })
    }
  })

  // Enhanced match finding function
  async function tryMatchPlayers(io: Server) {
    if (matchmakingQueue.length < 2) {
      return
    }

    // Find two different players (prevent self-matching)
    let player1: MatchmakingPlayer | null = null
    let player2: MatchmakingPlayer | null = null

    for (let i = 0; i < matchmakingQueue.length; i++) {
      for (let j = i + 1; j < matchmakingQueue.length; j++) {
        const p1 = matchmakingQueue[i]
        const p2 = matchmakingQueue[j]
        
        // Ensure they are different players
        if (p1.email !== p2.email) {
          player1 = p1
          player2 = p2
          break
        }
      }
      if (player1 && player2) break
    }

    if (!player1 || !player2) {
      return
    }

    // Remove both players from queue
    removeAllQueueEntriesForUser(player1.email)
    removeAllQueueEntriesForUser(player2.email)

    // Verify both players are still online
    const player1SocketIds = (await getSocketIds(player1.email, 'sockets')) || []
    const player2SocketIds = (await getSocketIds(player2.email, 'sockets')) || []

    if (player1SocketIds.length === 0) {
      if (player2SocketIds.length > 0) {
        matchmakingQueue.push(player2)
      }
      return
    }

    if (player2SocketIds.length === 0) {
      matchmakingQueue.push(player1)
      return
    }

    // Fetch user data for both players
    const [player1User, player2User] = await Promise.all([
      getUserByEmail(player1.email),
      getUserByEmail(player2.email),
    ])
    
    if (!player1User || !player2User) {
      return
    }
    
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
    gameRooms.set(gameId, gameRoom)

    // Add both players to game session tracking
    addUserToGameSession(player1.email, gameId, player1.socketId)
    addUserToGameSession(player2.email, gameId, player2.socketId)

    // Notify both players about the match
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

    // Auto-start the game after a delay
    setTimeout(async () => {
      const currentPlayer1Sockets = (await getSocketIds(player1.email, 'sockets')) || []
      const currentPlayer2Sockets = (await getSocketIds(player2.email, 'sockets')) || []

      if (currentPlayer1Sockets.length === 0) {
        await handlePlayerLeftBeforeStart(io, gameId, player1.email, player2.email)
        return
      }

      if (currentPlayer2Sockets.length === 0) {
        await handlePlayerLeftBeforeStart(io, gameId, player2.email, player1.email)
        return
      }

      // Both players still connected, start the game
      const updatedGameRoom = gameRooms.get(gameId)
      if (updatedGameRoom && updatedGameRoom.status === 'accepted') {
        updatedGameRoom.status = 'in_progress'
        updatedGameRoom.startedAt = Date.now()
        await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(updatedGameRoom))
        gameRooms.set(gameId, updatedGameRoom)

        // Initialize game state
        const gameState = {
          gameId,
          ballX: 440,
          ballY: 247.5,
          ballDx: 6 * (Math.random() > 0.5 ? 1 : -1),
          ballDy: 6 * (Math.random() > 0.5 ? 1 : -1),
          paddle1Y: 202.5,
          paddle2Y: 202.5,
          scores: { p1: 0, p2: 0 },
          gameStatus: 'playing',
          lastUpdate: Date.now()
        }
        
        activeGames.set(gameId, {
          ...gameState,
          gameStatus: 'playing' as 'playing',
        });

        io.to([...currentPlayer1Sockets, ...currentPlayer2Sockets]).emit('GameStarting', {
          gameId,
          hostEmail: player1.email,
          guestEmail: player2.email,
          hostData: player1Data,
          guestData: player2Data,
          startedAt: updatedGameRoom.startedAt,
        });

        // Send GameStarted event after a brief delay
        setTimeout(() => {
          io.to([...currentPlayer1Sockets, ...currentPlayer2Sockets]).emit('GameStarted', {
            gameId,
            status: 'game_started',
            players: {
              host: player1.email,
              guest: player2.email,
            },
            hostData: player1Data,
            guestData: player2Data,
            startedAt: updatedGameRoom.startedAt,
            gameState,
          })
        }, 100)
      }
    }, 3000)
  }

  // Helper function to handle player leaving before game starts
  async function handlePlayerLeftBeforeStart(
    io: Server, 
    gameId: string, 
    leaverEmail: string, 
    remainingPlayerEmail: string
  ) {
    const gameRoom = gameRooms.get(gameId)
    if (!gameRoom) return

    gameRoom.status = 'canceled'
    gameRoom.endedAt = Date.now()
    gameRoom.leaver = leaverEmail
    gameRoom.winner = remainingPlayerEmail
    gameRoom.loser = leaverEmail

    await saveMatchHistory(gameId, gameRoom, remainingPlayerEmail, leaverEmail, { p1: 0, p2: 0 }, 'player_left')
    await cleanupGame(gameId, 'player_left')

    const remainingPlayerSockets = await getSocketIds(remainingPlayerEmail, 'sockets') || []
    if (remainingPlayerSockets.length > 0) {
      io.to(remainingPlayerSockets).emit('GameEndedByOpponentLeave', {
        gameId,
        winner: remainingPlayerEmail,
        leaver: leaverEmail,
        message: 'Opponent left before the game started. You win!'
      })

      io.to(remainingPlayerSockets).emit('GameEnded', {
        gameId,
        winner: remainingPlayerEmail,
        loser: leaverEmail,
        finalScore: { p1: 0, p2: 0 },
        gameDuration: 0,
        reason: 'player_left',
        message: 'Opponent left before the game started. You win!'
      })
    }
  }

  // Rest of the handlers remain the same...
  socket.on('PlayerLeftBeforeGameStart', async (data: { gameId: string; leaver: string }) => {
    try {
      const { gameId, leaver } = data
      if (!gameId || !leaver) return

      const gameRoom = gameRooms.get(gameId)
      if (!gameRoom || processingGames.has(gameId)) return

      processingGames.add(gameId)

      const otherPlayerEmail = gameRoom.hostEmail === leaver 
        ? gameRoom.guestEmail 
        : gameRoom.hostEmail

      await handlePlayerLeftBeforeStart(io, gameId, leaver, otherPlayerEmail)

      setTimeout(() => {
        processingGames.delete(gameId)
      }, 5000)

    } catch (error) {
      processingGames.delete(data.gameId)
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
        message: `Cleaned up ${cleanedCount} entries.`,
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
}