// modules/game/game.socket.gameplay.ts
import { Socket, Server } from 'socket.io'
import redis from '../../utils/redis'
import { getSocketIds } from '../../socket'
import { 
  GameRoomData, 
  GameState, 
  activeGames, 
  gameRooms,
  GameSocketHandler 
} from './game.socket.types'
import { emitToUsers } from './game.socket.utils'
import { getUserByEmail } from '../user/user.service'
import { getPlayerData } from './game.socket.types'

export const handleGameplay: GameSocketHandler = (socket: Socket, io: Server) => {
  
  // Handle starting the game
  socket.on('StartGame', async (data: { gameId: string }) => {
    try {
      const { gameId } = data
      
      if (!gameId) {
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'Missing game ID.',
        })
      }

      const gameRoomData = await redis.get(`game_room:${gameId}`)
      
      if (!gameRoomData) {
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'Game room not found.',
        })
      }

      const gameRoom: GameRoomData = JSON.parse(gameRoomData)
      
      // Get user email from socket data to verify authorization
      const userEmail = (socket as any).userEmail
      
      if (!userEmail) {
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'User not authenticated.',
        })
      }

      // Verify that the user trying to start the game is the host
      if (userEmail !== gameRoom.hostEmail) {
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'Only the host can start the game.',
        })
      }

      // Update game status
      gameRoom.status = 'in_progress'
      gameRoom.startedAt = Date.now()
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
      gameRooms.set(gameId, gameRoom);

      // Initialize game state
      const gameState: GameState = {
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
      
      activeGames.set(gameId, gameState)

      // Notify both players
      const hostSocketIds = await getSocketIds(gameRoom.hostEmail, 'sockets') || []
      const guestSocketIds = await getSocketIds(gameRoom.guestEmail, 'sockets') || []

      // Fetch user data for both players
      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(gameRoom.hostEmail),
        getUserByEmail(gameRoom.guestEmail)
      ])
      const hostData = getPlayerData(hostUser)
      const guestData = getPlayerData(guestUser)

      const gameStartData = {
        gameId,
        status: 'game_started',
        players: {
          host: gameRoom.hostEmail,
          guest: gameRoom.guestEmail
        },
        hostData,
        guestData,
        startedAt: gameRoom.startedAt,
        gameState
      }

      io.to([...hostSocketIds, ...guestSocketIds]).emit('GameStarted', gameStartData)

      socket.emit('GameStartResponse', {
        status: 'success',
        message: 'Game started successfully.',
      })

    } catch (error) {
      socket.emit('GameStartResponse', {
        status: 'error',
        message: 'Failed to start game.',
      })
    }
  })

  // Handle game state updates
  socket.on('GameStateUpdate', async (data: { gameId: string; gameState: GameState }) => {
    try {
      const { gameId, gameState } = data
      
      if (!gameId || !gameState) {
        return
      }

      // Get current game state for comparison
      const currentGameState = activeGames.get(gameId)
      const currentTime = Date.now()
      
      // Check if this is a score update (scores changed)
      const isScoreUpdate = currentGameState && (
        currentGameState.scores.p1 !== gameState.scores.p1 ||
        currentGameState.scores.p2 !== gameState.scores.p2
      )
      
      // Throttle regular updates but allow immediate score updates
      const lastUpdate = currentGameState?.lastUpdate || 0
      if (!isScoreUpdate && currentTime - lastUpdate < 30) {
        return
      }

      // Update the game state
      activeGames.set(gameId, {
        ...gameState,
        lastUpdate: currentTime
      })

      // Get game room to find players
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) return;
      
      // Broadcast to both players
      const hostSocketIds = await getSocketIds(gameRoom.hostEmail, 'sockets') || []
      const guestSocketIds = await getSocketIds(gameRoom.guestEmail, 'sockets') || []

      io.to([...hostSocketIds, ...guestSocketIds]).emit('GameStateUpdate', {
        gameId,
        gameState: activeGames.get(gameId)
      })

    } catch (error) {
      // Error handling for GameStateUpdate
    }
  })

  // Handle paddle position updates from guest players
  socket.on('PaddleUpdate', async (data: { gameId: string; paddleY: number; playerType: 'p1' | 'p2' }) => {
    try {
      const { gameId, paddleY, playerType } = data
      
      if (!gameId || paddleY === undefined || !playerType) {
        return
      }

      // Get game room to find players
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) return;
      
      // Forward paddle update to host only
      const hostSocketIds = await getSocketIds(gameRoom.hostEmail, 'sockets') || []
      
      io.to(hostSocketIds).emit('PaddleUpdate', {
        gameId,
        paddleY,
        playerType
      })

    } catch (error) {
      // Error handling for PaddleUpdate
    }
  })

  // Handle player ready event
  socket.on('PlayerReady', async (data: { gameId: string; playerEmail: string }) => {
    try {
      const { gameId, playerEmail } = data
      
      if (!gameId || !playerEmail) {
        return
      }

      // Get game room
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) {
        return
      }

      // Verify player is part of this game
      if (gameRoom.hostEmail !== playerEmail && gameRoom.guestEmail !== playerEmail) {
        return
      }

      // Store ready status in Redis
      const readyKey = `game_ready:${gameId}:${playerEmail}`
      await redis.setex(readyKey, 60, 'ready')

      // Check if both players are ready
      const hostReady = await redis.get(`game_ready:${gameId}:${gameRoom.hostEmail}`)
      const guestReady = await redis.get(`game_ready:${gameId}:${gameRoom.guestEmail}`)

      if (hostReady && guestReady) {
        // Notify both players that both are ready
        const hostSocketIds = await getSocketIds(gameRoom.hostEmail, 'sockets') || []
        const guestSocketIds = await getSocketIds(gameRoom.guestEmail, 'sockets') || []
        
        io.to([...hostSocketIds, ...guestSocketIds]).emit('PlayerReady', {
          gameId,
          message: 'Both players are ready!'
        })
      }

    } catch (error) {
      // Error handling for PlayerReady
    }
  })
} 