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
  getPlayerData,
  gameRooms
} from './game.socket.types'
import { createMatchHistory } from './game.service'
import { v4 as uuidv4 } from 'uuid'
import { getUserByEmail } from '../user/user.service'

// Key prefix for matchmaking sessions in Redis
const MATCHMAKING_SESSION_PREFIX = 'matchmaking_session:';

// Track active matchmaking sessions
interface MatchmakingSession {
  sessionId: string;
  players: MatchmakingPlayer[];
  status: 'waiting' | 'matched' | 'in_progress' | 'completed';
  createdAt: number;
  maxPlayers: number;
}

const activeMatchmakingSessions = new Map<string, MatchmakingSession>();

// Function to clean up user's game data
async function cleanupUserGameData(email: string): Promise<{ cleanedCount: number, details: any[] }> {
  try {
    const redisGameRooms = await redis.keys('game_room:*')
    let cleanedCount = 0
    const details: any[] = []
    
    for (const roomKey of redisGameRooms) {
      const gameRoomData = await redis.get(roomKey)
      if (gameRoomData) {
        try {
          const gameRoom: GameRoomData = JSON.parse(gameRoomData)
          
          // Check if user is in this game
          if (gameRoom.hostEmail === email || gameRoom.guestEmail === email) {
            // If game is still active, clean it up
            if (gameRoom.status === 'waiting' || gameRoom.status === 'accepted' || gameRoom.status === 'in_progress') {
              await redis.del(roomKey)
              cleanedCount++
              details.push({
                roomKey,
                status: 'cleaned',
                age: Math.round((Date.now() - gameRoom.createdAt) / 60000)
              })
            }
          }
        } catch (parseError) {
          // If parsing fails, clean up the corrupted data
          await redis.del(roomKey)
          cleanedCount++
          details.push({
            roomKey,
            status: 'corrupted_data',
            error: 'Parse error'
          })
        }
      }
    }
    
    return { cleanedCount, details }
  } catch (error) {
    console.error('Error cleaning up user game data:', error)
    return { cleanedCount: 0, details: [] }
  }
}

// Function to create a new matchmaking session
function createMatchmakingSession(): string {
  const sessionId = uuidv4()
  const session: MatchmakingSession = {
    sessionId,
    players: [],
    status: 'waiting',
    createdAt: Date.now(),
    maxPlayers: 2 // Each session is for 2 players
  }
  activeMatchmakingSessions.set(sessionId, session)
  
  // Also store in Redis for persistence
  redis.setex(`${MATCHMAKING_SESSION_PREFIX}${sessionId}`, 3600, JSON.stringify(session))
  
  return sessionId
}

// Function to get or create a matchmaking session
function getOrCreateMatchmakingSession(): string {
  // Look for an existing session with available space
  for (const [sessionId, session] of activeMatchmakingSessions.entries()) {
    if (session.status === 'waiting' && session.players.length < session.maxPlayers) {
      return sessionId
    }
  }
  
  // Create a new session if none available
  return createMatchmakingSession()
}

// Function to update session status
function updateSessionStatus(sessionId: string, status: MatchmakingSession['status']) {
  const session = activeMatchmakingSessions.get(sessionId)
  if (session) {
    session.status = status
    // Update in Redis
    redis.setex(`${MATCHMAKING_SESSION_PREFIX}${sessionId}`, 3600, JSON.stringify(session))
  }
}

export const handleMatchmaking: GameSocketHandler = (socket: Socket, io: Server) => {
  
  // Remove periodic cleanup - cleanup happens on specific events and disconnect

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

      // Get or create a matchmaking session
      const sessionId = getOrCreateMatchmakingSession()
      const session = activeMatchmakingSessions.get(sessionId)
      
      if (!session) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'Failed to create matchmaking session.'
        })
      }

      // Check if session is full
      if (session.players.length >= session.maxPlayers) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'Matchmaking session is full. Please wait for a new session.',
          sessionFull: true,
          sessionId: sessionId
        })
      }

      // Add player to session
      const player: MatchmakingPlayer = {
        socketId: socket.id,
        email: email,
        joinedAt: Date.now()
      }
      session.players.push(player)
      
      // Also add to global queue for backward compatibility
      matchmakingQueue.push(player)

      console.log(`User ${email} joined matchmaking session ${sessionId}. Session players: ${session.players.length}/${session.maxPlayers}`)

      socket.emit('MatchmakingResponse', {
        status: 'success',
        message: 'Joined matchmaking session. Waiting for opponent...',
        sessionId: sessionId,
        sessionPlayers: session.players.length,
        maxPlayers: session.maxPlayers
      })

      // Try to find a match if session is full, but with a 3-second delay between players
      if (session.players.length >= session.maxPlayers) {
        // Add a 3-second delay before starting matchmaking to allow for more players
        setTimeout(async () => {
          await tryMatchPlayersInSession(io, sessionId)
        }, 3000)
      }

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
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }

      const gameRoom = gameRooms.get(gameId)
      if (!gameRoom) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Game room not found.',
        })
      }

      // Only handle if game hasn't started yet
      if (gameRoom.status !== 'accepted') {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Game has already started or ended.',
        })
      }

      console.log(`Player ${leaver} left before game start in room ${gameId}`)

      // Determine the other player
      const otherPlayerEmail = gameRoom.hostEmail === leaver ? gameRoom.guestEmail : gameRoom.hostEmail

      // Update game room status
      gameRoom.status = 'canceled'
      gameRoom.endedAt = Date.now()
      gameRoom.leaver = leaver
      gameRoom.winner = otherPlayerEmail

      // Save to Redis
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
      gameRooms.set(gameId, gameRoom)

      // Notify the other player
      const otherPlayerSocketIds = await getSocketIds(otherPlayerEmail, 'sockets') || []
      io.to(otherPlayerSocketIds).emit('MatchmakingPlayerLeft', {
        gameId,
        leaver,
        message: 'Opponent left before the game started.'
      })

      // Clean up the game room after a delay
      setTimeout(async () => {
        try {
          await redis.del(`game_room:${gameId}`)
          gameRooms.delete(gameId)
          console.log(`Cleaned up game room ${gameId} after player left before start`)
        } catch (error) {
          console.error(`Error cleaning up game room ${gameId}:`, error)
        }
      }, 5000)

      socket.emit('GameResponse', {
        status: 'success',
        message: 'Left game successfully.',
      })

    } catch (error) {
      console.error('Error handling PlayerLeftBeforeGameStart:', error)
      socket.emit('GameResponse', {
        status: 'error',
        message: 'Failed to handle player leaving.',
      })
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

      // Remove both players from the global matchmaking queue to prevent duplicate matches
      removeFromQueueByEmail(player1.email)
      removeFromQueueByEmail(player2.email)

      // Save game room to Redis and add to gameRooms map
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
      
      // Import gameRooms from types to add the room
      const { gameRooms } = await import('./game.socket.types')
      gameRooms.set(gameId, gameRoom)

      // Get socket IDs for both players
      const player1SocketIds = await getSocketIds(player1.email, 'sockets') || []
      const player2SocketIds = await getSocketIds(player2.email, 'sockets') || []

      // Notify both players about the match
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

      // Give players a moment to prepare, then start the game
      setTimeout(async () => {
        try {
          // Double-check that both players are still connected before starting
          const currentPlayer1SocketIds = await getSocketIds(player1.email, 'sockets') || []
          const currentPlayer2SocketIds = await getSocketIds(player2.email, 'sockets') || []
          
          if (currentPlayer1SocketIds.length === 0 || currentPlayer2SocketIds.length === 0) {
            console.log(`One or both players disconnected before game start: ${player1.email}, ${player2.email}`)
            
            // Clean up the game room
            await redis.del(`game_room:${gameId}`)
            gameRooms.delete(gameId)
            
            // Notify the remaining player
            const remainingPlayerSocketIds = currentPlayer1SocketIds.length > 0 ? currentPlayer1SocketIds : currentPlayer2SocketIds
            io.to(remainingPlayerSocketIds).emit('MatchmakingPlayerLeft', {
              gameId,
              message: 'Opponent disconnected before the game started.'
            })
            
            return
          }

          // Update game status to in_progress
          gameRoom.status = 'in_progress'
          gameRoom.startedAt = Date.now()
          await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
          gameRooms.set(gameId, gameRoom)

          // Notify players that game is starting
          io.to([...currentPlayer1SocketIds, ...currentPlayer2SocketIds]).emit('GameStarting', {
            gameId,
            hostEmail: gameRoom.hostEmail,
            guestEmail: gameRoom.guestEmail,
            hostData: player1Data,
            guestData: player2Data,
            startedAt: gameRoom.startedAt
          })

          console.log(`Game ${gameId} started successfully`)
        } catch (error) {
          console.error(`Error starting game ${gameId}:`, error)
        }
      }, 2000) // 2 second delay to give players time to prepare

    } catch (error) {
      console.error('Error in tryMatchPlayers:', error)
      // If there was an error, try to put players back in queue
      if (matchmakingQueue.length >= 0) {
        setTimeout(() => tryMatchPlayers(io), 2000) // Retry after 2 seconds
      }
    }
  }

  // Function to try matching players in a specific session
  async function tryMatchPlayersInSession(io: Server, sessionId: string) {
    try {
      const session = activeMatchmakingSessions.get(sessionId)
      if (!session || session.players.length < 2) {
        return // Need at least 2 players in the session to match
      }

      // Get players from the session
      const player1 = session.players.shift()!
      const player2 = session.players.shift()!

      if (!player1 || !player2) {
        return
      }

      // Prevent matching a user with themselves
      if (player1.email === player2.email) {
        // Put the players back in session and try again
        session.players.push(player1, player2)
        // Recursively try to match again
        setTimeout(() => tryMatchPlayersInSession(io, sessionId), 1000)
        return
      }

      // Verify both players are still connected
      const player1Socket = io.sockets.sockets.get(player1.socketId)
      const player2Socket = io.sockets.sockets.get(player2.socketId)

      if (!player1Socket || !player2Socket) {
        console.log(`One or both players disconnected during matchmaking: ${player1.email}, ${player2.email}`)
        // Put the connected players back in session if they exist
        if (player1Socket) {
          session.players.push(player1)
        }
        if (player2Socket) {
          session.players.push(player2)
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
        // Put players back in session
        session.players.push(player1, player2)
        return
      }

      const player1Data = getPlayerData(player1User)
      const player2Data = getPlayerData(player2User)

      // Create the game room immediately when both players are matched
      const gameId = uuidv4()
      const gameRoom: GameRoomData = {
        gameId,
        hostEmail: player1.email, // Use player1 as host for consistency with OneVsOne
        guestEmail: player2.email,
        status: 'accepted', // Start with 'accepted' status like OneVsOne
        createdAt: Date.now()
      }

      // Remove both players from the global matchmaking queue to prevent duplicate matches
      removeFromQueueByEmail(player1.email)
      removeFromQueueByEmail(player2.email)

      // Save game room to Redis and add to gameRooms map
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
      gameRooms.set(gameId, gameRoom)

      // Get socket IDs for both players
      const player1SocketIds = await getSocketIds(player1.email, 'sockets') || []
      const player2SocketIds = await getSocketIds(player2.email, 'sockets') || []

      // Notify both players about the match
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

      // Give players a moment to prepare, then start the game
      setTimeout(async () => {
        try {
          // Double-check that both players are still connected before starting
          const currentPlayer1SocketIds = await getSocketIds(player1.email, 'sockets') || []
          const currentPlayer2SocketIds = await getSocketIds(player2.email, 'sockets') || []
          
          if (currentPlayer1SocketIds.length === 0 || currentPlayer2SocketIds.length === 0) {
            console.log(`One or both players disconnected before game start: ${player1.email}, ${player2.email}`)
            
            // Clean up the game room
            await redis.del(`game_room:${gameId}`)
            gameRooms.delete(gameId)
            
            // Notify the remaining player
            const remainingPlayerSocketIds = currentPlayer1SocketIds.length > 0 ? currentPlayer1SocketIds : currentPlayer2SocketIds
            io.to(remainingPlayerSocketIds).emit('MatchmakingPlayerLeft', {
              gameId,
              message: 'Opponent disconnected before the game started.'
            })
            
            return
          }

          // Update game status to in_progress
          gameRoom.status = 'in_progress'
          gameRoom.startedAt = Date.now()
          await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
          gameRooms.set(gameId, gameRoom)

          // Notify players that game is starting
          io.to([...currentPlayer1SocketIds, ...currentPlayer2SocketIds]).emit('GameStarting', {
            gameId,
            hostEmail: gameRoom.hostEmail,
            guestEmail: gameRoom.guestEmail,
            hostData: player1Data,
            guestData: player2Data,
            startedAt: gameRoom.startedAt
          })

          console.log(`Game ${gameId} started successfully`)
        } catch (error) {
          console.error(`Error starting game ${gameId}:`, error)
        }
      }, 2000) // 2 second delay to give players time to prepare

    } catch (error) {
      console.error('Error in tryMatchPlayersInSession:', error)
      // If there was an error, try to put players back in session
      const currentSession = activeMatchmakingSessions.get(sessionId)
      if (currentSession && currentSession.players.length >= 2) {
        setTimeout(() => tryMatchPlayersInSession(io, sessionId), 2000) // Retry after 2 seconds
      }
    }
  }
} 