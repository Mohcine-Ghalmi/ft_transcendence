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

const processingGames = new Set<string>()

export const handleMatchmaking: GameSocketHandler = (
  socket: Socket,
  io: Server
) => {
  // Handle socket disconnect - clean up user data
  socket.on('disconnect', async () => {
    try {
      const userEmail = socketToUser.get(socket.id)
      
      if (userEmail) {
        // Clean up session tracking
        cleanupUserSession(userEmail, socket.id)
        
        // Find player in queue
        const playerInQueue = matchmakingQueue.find(
          (p) => p.socketId === socket.id || p.email === userEmail
        )
        
        if (playerInQueue) {
          // Remove from queue
          removeFromQueueByEmail(userEmail)
          
          // Clean up any stale game data
          await cleanupUserGameData(userEmail)
        }

        // Handle case where player disconnects after match found but before game starts
        const currentGameId = getUserCurrentGame(userEmail)
        if (currentGameId) {
          const gameRoom = gameRooms.get(currentGameId)
          
          if (gameRoom && (gameRoom.status === 'accepted' || gameRoom.status === 'waiting')) {
            console.log(`[Matchmaking] Player ${userEmail} left after match found but before game started`)
            
            // Check if user still has active sockets (other sessions)
            if (!hasActiveSockets(userEmail)) {
              // Mark player as having left
              gameRoom.status = 'canceled'
              gameRoom.endedAt = Date.now()
              gameRoom.leaver = userEmail
              
              const otherPlayerEmail = gameRoom.hostEmail === userEmail 
                ? gameRoom.guestEmail 
                : gameRoom.hostEmail
              
              // Award win to the other player
              const winner = otherPlayerEmail
              const loser = userEmail
              
              gameRoom.winner = winner
              gameRoom.loser = loser
              
              // Save match history (forfeit)
              await saveMatchHistory(
                currentGameId, 
                gameRoom, 
                winner, 
                loser, 
                { p1: 0, p2: 0 }, 
                'player_left'
              )
              
              // Clean up game
              await cleanupGame(currentGameId, 'player_left')
              
              // Notify other player
              const otherPlayerSockets = await getSocketIds(otherPlayerEmail, 'sockets') || []
              if (otherPlayerSockets.length > 0) {
                io.to(otherPlayerSockets).emit('MatchmakingPlayerLeft', {
                  gameId: currentGameId,
                  winner,
                  loser,
                  message: 'Opponent left before the game started. You win!',
                  reason: 'player_left'
                })
                
                // Also emit game ended event for consistency
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

      // Map socket to user for session tracking
      socketToUser.set(socket.id, email)

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
        console.log(`Cleaned up ${cleanedCount} stale game rooms for ${email}`)
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

      // Clean up session tracking
      cleanupUserSession(email, socket.id)

      // Remove from queue
      removeFromQueueByEmail(email)

      // Clean up any stale game data when leaving matchmaking
      const { cleanedCount } = await cleanupUserGameData(email)
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} stale game rooms for ${email}`)
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

  // Handle player leaving before game start but after match found
  socket.on('PlayerLeftBeforeGameStart', async (data: { gameId: string; leaver: string }) => {
    try {
      const { gameId, leaver } = data

      if (!gameId || !leaver) {
        return
      }

      const gameRoom = gameRooms.get(gameId)
      if (!gameRoom) {
        return
      }

      // Check if game is already being processed
      if (processingGames.has(gameId)) {
        return
      }

      processingGames.add(gameId)

      const otherPlayerEmail = gameRoom.hostEmail === leaver 
        ? gameRoom.guestEmail 
        : gameRoom.hostEmail

      // Mark game as canceled and award win to remaining player
      gameRoom.status = 'canceled'
      gameRoom.endedAt = Date.now()
      gameRoom.leaver = leaver
      gameRoom.winner = otherPlayerEmail
      gameRoom.loser = leaver

      // Save match history (forfeit)
      await saveMatchHistory(
        gameId, 
        gameRoom, 
        otherPlayerEmail, 
        leaver, 
        { p1: 0, p2: 0 }, 
        'player_left'
      )

      // Clean up game
      await cleanupGame(gameId, 'player_left')

      // Notify other player
      const otherPlayerSockets = await getSocketIds(otherPlayerEmail, 'sockets') || []
      if (otherPlayerSockets.length > 0) {
        io.to(otherPlayerSockets).emit('GameEndedByOpponentLeave', {
          gameId,
          winner: otherPlayerEmail,
          leaver,
          message: 'Opponent left before the game started. You win!'
        })

        // Also emit game ended event
        io.to(otherPlayerSockets).emit('GameEnded', {
          gameId,
          winner: otherPlayerEmail,
          loser: leaver,
          finalScore: { p1: 0, p2: 0 },
          gameDuration: 0,
          reason: 'player_left',
          message: 'Opponent left before the game started. You win!'
        })
      }

      setTimeout(() => {
        processingGames.delete(gameId)
      }, 5000)

    } catch (error) {
      console.error('Error handling player left before game start:', error)
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

    // Verify both players are still online before creating match
    const player1SocketIds = (await getSocketIds(player1.email, 'sockets')) || []
    const player2SocketIds = (await getSocketIds(player2.email, 'sockets')) || []

    if (player1SocketIds.length === 0) {
      console.log(`Player ${player1.email} is no longer online, removing from match`)
      // Put player2 back in queue
      matchmakingQueue.unshift(player2)
      return
    }

    if (player2SocketIds.length === 0) {
      console.log(`Player ${player2.email} is no longer online, removing from match`)
      // Put player1 back in queue
      matchmakingQueue.unshift(player1)
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
    gameRooms.set(gameId, gameRoom)

    // Add both players to game session tracking
    addUserToGameSession(player1.email, gameId, player1.socketId)
    addUserToGameSession(player2.email, gameId, player2.socketId)

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
      // Check if both players are still connected before starting
      const currentPlayer1Sockets = (await getSocketIds(player1.email, 'sockets')) || []
      const currentPlayer2Sockets = (await getSocketIds(player2.email, 'sockets')) || []

      // If either player disconnected, handle it
      if (currentPlayer1Sockets.length === 0) {
        console.log(`Player 1 (${player1.email}) disconnected before game start`)
        await handlePlayerLeftBeforeStart(io, gameId, player1.email, player2.email)
        return
      }

      if (currentPlayer2Sockets.length === 0) {
        console.log(`Player 2 (${player2.email}) disconnected before game start`)
        await handlePlayerLeftBeforeStart(io, gameId, player2.email, player1.email)
        return
      }

      // Both players still connected, start the game
      const updatedGameRoom = gameRooms.get(gameId)
      if (updatedGameRoom && updatedGameRoom.status === 'accepted') {
        // Update game status to in_progress
        updatedGameRoom.status = 'in_progress'
        updatedGameRoom.startedAt = Date.now()
        await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(updatedGameRoom))
        gameRooms.set(gameId, updatedGameRoom)

        // Notify players that game is starting
        io.to([...currentPlayer1Sockets, ...currentPlayer2Sockets]).emit('GameStarting', {
          gameId,
          hostEmail: player1.email,
          guestEmail: player2.email,
          hostData: player1Data,
          guestData: player2Data,
          startedAt: updatedGameRoom.startedAt,
        })
      }
    }, 3000) // 3 second delay before starting
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

    // Mark game as canceled and award win to remaining player
    gameRoom.status = 'canceled'
    gameRoom.endedAt = Date.now()
    gameRoom.leaver = leaverEmail
    gameRoom.winner = remainingPlayerEmail
    gameRoom.loser = leaverEmail

    // Save match history (forfeit)
    await saveMatchHistory(
      gameId, 
      gameRoom, 
      remainingPlayerEmail, 
      leaverEmail, 
      { p1: 0, p2: 0 }, 
      'player_left'
    )

    // Clean up game
    await cleanupGame(gameId, 'player_left')

    // Notify remaining player
    const remainingPlayerSockets = await getSocketIds(remainingPlayerEmail, 'sockets') || []
    if (remainingPlayerSockets.length > 0) {
      io.to(remainingPlayerSockets).emit('GameEndedByOpponentLeave', {
        gameId,
        winner: remainingPlayerEmail,
        leaver: leaverEmail,
        message: 'Opponent left before the game started. You win!'
      })

      // Also emit game ended event
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
}