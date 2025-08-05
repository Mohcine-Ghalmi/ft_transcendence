import { Socket, Server } from 'socket.io'
import {
  GameRoomData,
  GameState,
  activeGames,
  gameRooms,
  GameSocketHandler,
} from './game.socket.types'
import { emitToUsers } from './game.socket.utils'
import { getUserByEmail } from '../user/user.service'
import { getPlayerData } from './game.socket.types'
import redis, { getSocketIds } from '../../database/redis'
import { activeGameSessions, userGameSessions, addUserToGameSession } from './game.socket.types'
import server from '../../app'


export const handleGameplay: GameSocketHandler = (
  socket: Socket,
  io: Server
) => {
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
      const userEmail = (socket as any).userEmail
  
      if (!userEmail) {
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'User not authenticated.',
        })
      }
      if (userEmail !== gameRoom.hostEmail) {
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'Only the host can start the game.',
        })
      }
      const currentGameId = userGameSessions.get(userEmail)
      if (currentGameId && currentGameId === gameId) {
        const existingSessions = activeGameSessions.get(gameId) || new Set()
        if (existingSessions.size > 1) {
          return socket.emit('GameStartResponse', {
            status: 'error',
            message: 'Game is being played from another session.',
          })
        }
      }
      gameRoom.status = 'in_progress'
      gameRoom.startedAt = Date.now()
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
      gameRooms.set(gameId, gameRoom)
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
        lastUpdate: Date.now(),
      }
  
      activeGames.set(gameId, gameState)
      const hostSocketIds =
        (await getSocketIds(gameRoom.hostEmail, 'sockets')) || []
      const guestSocketIds =
        (await getSocketIds(gameRoom.guestEmail, 'sockets')) || []
      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(gameRoom.hostEmail),
        getUserByEmail(gameRoom.guestEmail),
      ])
      const hostData = getPlayerData(hostUser)
      const guestData = getPlayerData(guestUser)
  
      const gameStartData = {
        gameId,
        status: 'game_started',
        players: {
          host: gameRoom.hostEmail,
          guest: gameRoom.guestEmail,
        },
        hostData,
        guestData,
        startedAt: gameRoom.startedAt,
        gameState,
      }
  
      io.to([...hostSocketIds, ...guestSocketIds]).emit(
        'GameStarted',
        gameStartData
      )
  
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

  socket.on(
    'GameStateUpdate',
    async (data: { gameId: string; gameState: GameState }) => {
      try {
        const { gameId, gameState } = data

        if (!gameId || !gameState) {
          return
        }
        const currentGameState = activeGames.get(gameId)
        const currentTime = Date.now()
        const isScoreUpdate =
          currentGameState &&
          (currentGameState.scores.p1 !== gameState.scores.p1 ||
            currentGameState.scores.p2 !== gameState.scores.p2)
        const lastUpdate = currentGameState?.lastUpdate || 0
        if (!isScoreUpdate && currentTime - lastUpdate < 30) {
          return
        }
        activeGames.set(gameId, {
          ...gameState,
          lastUpdate: currentTime,
        })
        const gameRoom = gameRooms.get(gameId)
        if (!gameRoom) return
        const hostSocketIds =
          (await getSocketIds(gameRoom.hostEmail, 'sockets')) || []
        const guestSocketIds =
          (await getSocketIds(gameRoom.guestEmail, 'sockets')) || []

        io.to([...hostSocketIds, ...guestSocketIds]).emit('GameStateUpdate', {
          gameId,
          gameState: activeGames.get(gameId),
        })
      } catch (error: any) {
        server.log.error(error.message || 'Failed in Game State update')
      }
    }
  )
  socket.on(
    'PaddleUpdate',
    async (data: {
      gameId: string
      paddleY: number
      playerType: 'p1' | 'p2'
    }) => {
      try {
        const { gameId, paddleY, playerType } = data

        if (!gameId || paddleY === undefined || !playerType) {
          return
        }
        const gameRoom = gameRooms.get(gameId)
        if (!gameRoom) return
        const hostSocketIds =
          (await getSocketIds(gameRoom.hostEmail, 'sockets')) || []

        io.to(hostSocketIds).emit('PaddleUpdate', {
          gameId,
          paddleY,
          playerType,
        })
      } catch (error: any) {
        server.log.error(error.message || "failed in paddle update");
      }
    }
  )

  socket.on(
    'PlayerReady',
    async (data: { gameId: string; playerEmail: string }) => {
      try {
        const { gameId, playerEmail } = data

        if (!gameId || !playerEmail) {
          return
        }
        const gameRoom = gameRooms.get(gameId)
        if (!gameRoom) {
          return
        }
        if (
          gameRoom.hostEmail !== playerEmail &&
          gameRoom.guestEmail !== playerEmail
        ) {
          return
        }
        const readyKey = `game_ready:${gameId}:${playerEmail}`
        await redis.setex(readyKey, 60, 'ready')
        const hostReady = await redis.get(
          `game_ready:${gameId}:${gameRoom.hostEmail}`
        )
        const guestReady = await redis.get(
          `game_ready:${gameId}:${gameRoom.guestEmail}`
        )

        if (hostReady && guestReady) {
          const hostSocketIds =
            (await getSocketIds(gameRoom.hostEmail, 'sockets')) || []
          const guestSocketIds =
            (await getSocketIds(gameRoom.guestEmail, 'sockets')) || []

          io.to([...hostSocketIds, ...guestSocketIds]).emit('PlayerReady', {
            gameId,
            message: 'Both players are ready!',
          })
        }
      } catch (error: any) {
        server.log.error(error.message || "failed in player ready check");
      }
    }
  )
}
