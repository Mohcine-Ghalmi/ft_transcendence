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
  getUserCurrentGame,
  checkGameSessionConflict,
  forceCleanupUserFromAllGames
} from './game.socket.types'
import { v4 as uuidv4 } from 'uuid'
import { getUserByEmail } from '../user/user.service'
import { saveMatchHistory, cleanupGame, emitToUsers } from './game.socket.utils'
const activeMatchmakingUsers = new Map<string, {
  socketId: string;
  joinedAt: number;
  status: 'searching' | 'preparing' | 'match_found';
}>()

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

async function canUserJoinMatchmaking(email: string, socketId: string): Promise<{
  canJoin: boolean
  reason?: string
  conflictGameId?: string
  conflictType?: 'already_searching' | 'in_active_game' | 'session_conflict'
}> {
  const existingMatchmaking = activeMatchmakingUsers.get(email)
  if (existingMatchmaking && existingMatchmaking.socketId !== socketId) {
    const userSockets = await getSocketIds(email, 'sockets') || []
    if (userSockets.includes(existingMatchmaking.socketId)) {
      return { 
        canJoin: false, 
        reason: 'Already searching from another session',
        conflictType: 'already_searching'
      }
    } else {
      activeMatchmakingUsers.delete(email)
      removeAllQueueEntriesForUser(email)
    }
  }

  if (isInQueue(email)) {
    return { canJoin: false, reason: 'Already in matchmaking queue' }
  }

  const conflict = checkGameSessionConflict(email, '', socketId)
  if (conflict.hasConflict) {
    const currentGameId = getUserCurrentGame(email)
    if (currentGameId) {
      const gameRoom = gameRooms.get(currentGameId)
      if (gameRoom && (gameRoom.status === 'accepted' || gameRoom.status === 'in_progress')) {
        return { 
          canJoin: false, 
          reason: 'Already in an active game',
          conflictGameId: currentGameId,
          conflictType: 'in_active_game'
        }
      }
    }
  }

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
            conflictGameId: gameRoom.gameId,
            conflictType: 'in_active_game'
          }
        }
      } catch (parseError) {
        await redis.del(roomKey)
      }
    }
  }

  return { canJoin: true }
}

async function cleanupUserGameData(email: string): Promise<{ cleanedCount: number; details: any[] }> {
  const redisGameRooms = await redis.keys('game_room:*')
  let cleanedCount = 0
  let details: any = []

  const queueRemoved = removeAllQueueEntriesForUser(email)
  activeMatchmakingUsers.delete(email)
  
  if (queueRemoved > 0) {
    cleanedCount += queueRemoved
    details.push({
      type: 'queue',
      status: 'cleaned',
      count: queueRemoved,
      reason: 'removed_from_queue'
    })
  }

  const cleanedGames = forceCleanupUserFromAllGames(email)
  cleanedCount += cleanedGames.length

  for (const roomKey of redisGameRooms) {
    const gameRoomData = await redis.get(roomKey)
    if (gameRoomData) {
      try {
        const gameRoom: GameRoomData = JSON.parse(gameRoomData)

        if (gameRoom.hostEmail === email || gameRoom.guestEmail === email) {
          const gameAge = Date.now() - gameRoom.createdAt
          const ageMinutes = Math.round(gameAge / 1000 / 60)

          if (
            gameRoom.status === 'completed' ||
            gameRoom.status === 'canceled' ||
            gameRoom.status === 'waiting' ||
            gameAge > 300000
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
  socket.on('disconnect', async () => {
    try {
      const userEmail = socketToUser.get(socket.id)
      
      if (userEmail) {
        cleanupUserSession(userEmail, socket.id)
        removeAllQueueEntriesForUser(userEmail)
        const matchmakingEntry = activeMatchmakingUsers.get(userEmail)
        if (matchmakingEntry && matchmakingEntry.socketId === socket.id) {
          activeMatchmakingUsers.delete(userEmail)
        }
        
        await cleanupUserGameData(userEmail)
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

      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000)
      for (const player of stalePlayers) {
        removeAllQueueEntriesForUser(player.email)
        activeMatchmakingUsers.delete(player.email)
      }
    } catch (error) {
      console.error('Error cleaning up on disconnect:', error)
    }
  })

  socket.on('JoinMatchmaking', async (data: { email: string }) => {
    try {
      const { email } = data

      if (!email) {
        return socket.emit('MatchmakingResponse', {
          status: 'error',
          message: 'Email is required.',
        })
      }

      socketToUser.set(socket.id, email)
      const { canJoin, reason, conflictGameId, conflictType } = await canUserJoinMatchmaking(email, socket.id)
      
      if (!canJoin) {
        if (conflictType === 'already_searching') {
          return socket.emit('MatchmakingResponse', {
            status: 'error',
            message: reason || 'Already searching from another session',
            sessionConflict: true,
            conflictType: 'already_searching'
          })
        } else if (conflictGameId) {
          await cleanupUserGameData(email)
          const recheckResult = await canUserJoinMatchmaking(email, socket.id)
          if (!recheckResult.canJoin) {
            return socket.emit('MatchmakingResponse', {
              status: 'error',
              message: reason || 'Cannot join matchmaking',
              conflictGameId,
              sessionConflict: true,
              conflictType: conflictType || 'session_conflict'
            })
          }
        } else {
          return socket.emit('MatchmakingResponse', {
            status: 'error',
            message: reason || 'Cannot join matchmaking'
          })
        }
      }
      removeAllQueueEntriesForUser(email)
      activeMatchmakingUsers.delete(email)
      const { cleanedCount } = await cleanupUserGameData(email)
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000)
      for (const player of stalePlayers) {
        removeAllQueueEntriesForUser(player.email)
        activeMatchmakingUsers.delete(player.email)
      }
      const player: MatchmakingPlayer = {
        socketId: socket.id,
        email: email,
        joinedAt: Date.now(),
      }
      matchmakingQueue.push(player)
      
      activeMatchmakingUsers.set(email, {
        socketId: socket.id,
        joinedAt: Date.now(),
        status: 'searching'
      })

      socket.emit('MatchmakingResponse', {
        status: 'success',
        message: 'Joined matchmaking queue. Waiting for opponent...',
        queuePosition: matchmakingQueue.length,
      })

      await tryMatchPlayers(io)
    } catch (error) {
      socket.emit('MatchmakingResponse', {
        status: 'error',
        message: 'Failed to join matchmaking queue.',
      })
    }
  })
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
      const removedCount = removeAllQueueEntriesForUser(email)
      activeMatchmakingUsers.delete(email)
      const { cleanedCount } = await cleanupUserGameData(email)
      const now = Date.now()
      const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 120000)
      for (const player of stalePlayers) {
        removeAllQueueEntriesForUser(player.email)
        activeMatchmakingUsers.delete(player.email)
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
  async function tryMatchPlayers(io: Server) {
    if (matchmakingQueue.length < 2) {
      return
    }
    let player1: MatchmakingPlayer | null = null
    let player2: MatchmakingPlayer | null = null

    for (let i = 0; i < matchmakingQueue.length; i++) {
      for (let j = i + 1; j < matchmakingQueue.length; j++) {
        const p1 = matchmakingQueue[i]
        const p2 = matchmakingQueue[j]
        if (p1.email !== p2.email) {
          const p1Matchmaking = activeMatchmakingUsers.get(p1.email)
          const p2Matchmaking = activeMatchmakingUsers.get(p2.email)
          
          if (p1Matchmaking && p2Matchmaking && 
              p1Matchmaking.status === 'searching' && 
              p2Matchmaking.status === 'searching') {
            player1 = p1
            player2 = p2
            break
          }
        }
      }
      if (player1 && player2) break
    }

    if (!player1 || !player2) {
      return
    }

    const p1Matchmaking = activeMatchmakingUsers.get(player1.email)
    const p2Matchmaking = activeMatchmakingUsers.get(player2.email)
    if (p1Matchmaking) p1Matchmaking.status = 'match_found'
    if (p2Matchmaking) p2Matchmaking.status = 'match_found'
    removeAllQueueEntriesForUser(player1.email)
    removeAllQueueEntriesForUser(player2.email)
    const player1SocketIds = (await getSocketIds(player1.email, 'sockets')) || []
    const player2SocketIds = (await getSocketIds(player2.email, 'sockets')) || []

    if (!player1SocketIds.includes(player1.socketId)) {
      activeMatchmakingUsers.delete(player1.email)
      if (player2SocketIds.includes(player2.socketId)) {
        matchmakingQueue.push(player2)
        if (p2Matchmaking) p2Matchmaking.status = 'searching'
      } else {
        activeMatchmakingUsers.delete(player2.email)
      }
      return
    }

    if (!player2SocketIds.includes(player2.socketId)) {
      activeMatchmakingUsers.delete(player2.email)
      matchmakingQueue.push(player1)
      if (p1Matchmaking) p1Matchmaking.status = 'searching'
      return
    }

    const [player1User, player2User] = await Promise.all([
      getUserByEmail(player1.email),
      getUserByEmail(player2.email),
    ])
    
    if (!player1User || !player2User) {
      activeMatchmakingUsers.delete(player1.email)
      activeMatchmakingUsers.delete(player2.email)
      return
    }
    
    const player1Data = getPlayerData(player1User)
    const player2Data = getPlayerData(player2User)
    const gameId = uuidv4()
    const gameRoom: GameRoomData = {
      gameId,
      hostEmail: player1.email,
      guestEmail: player2.email,
      status: 'accepted',
      createdAt: Date.now(),
    }

    await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
    gameRooms.set(gameId, gameRoom)
    addUserToGameSession(player1.email, gameId, player1.socketId)
    addUserToGameSession(player2.email, gameId, player2.socketId)
    const activePlayer1Socket = [player1.socketId]
    const activePlayer2Socket = [player2.socketId]
    io.to(activePlayer1Socket).emit('MatchFound', {
      gameId,
      hostEmail: player1.email,
      guestEmail: player2.email,
      hostData: player1Data,
      guestData: player2Data,
      status: 'match_found',
      message: 'Match found! You are Player 1 (Left Paddle).',
      playerPosition: 'player1',
    })

    io.to(activePlayer2Socket).emit('MatchFound', {
      gameId,
      hostEmail: player1.email,
      guestEmail: player2.email,
      hostData: player1Data,
      guestData: player2Data,
      status: 'match_found',
      message: 'Match found! You are Player 2 (Right Paddle).',
      playerPosition: 'player2',
    })

    const otherPlayer1Sockets = player1SocketIds.filter(socketId => socketId !== player1.socketId)
    const otherPlayer2Sockets = player2SocketIds.filter(socketId => socketId !== player2.socketId)

    if (otherPlayer1Sockets.length > 0) {
      io.to(otherPlayer1Sockets).emit('MatchmakingSessionConflict', {
        type: 'another_session_matched',
        message: 'A match was found in another session. This session will remain inactive.',
        gameId,
        action: 'stay_idle'
      })
    }

    if (otherPlayer2Sockets.length > 0) {
      io.to(otherPlayer2Sockets).emit('MatchmakingSessionConflict', {
        type: 'another_session_matched',
        message: 'A match was found in another session. This session will remain inactive.',
        gameId,
        action: 'stay_idle'
      })
    }
    activeMatchmakingUsers.delete(player1.email)
    activeMatchmakingUsers.delete(player2.email)
    setTimeout(async () => {
      const currentPlayer1Sockets = (await getSocketIds(player1.email, 'sockets')) || []
      const currentPlayer2Sockets = (await getSocketIds(player2.email, 'sockets')) || []

      if (!currentPlayer1Sockets.includes(player1.socketId)) {
        await handlePlayerLeftBeforeStart(io, gameId, player1.email, player2.email)
        return
      }

      if (!currentPlayer2Sockets.includes(player2.socketId)) {
        await handlePlayerLeftBeforeStart(io, gameId, player2.email, player1.email)
        return
      }
      const updatedGameRoom = gameRooms.get(gameId)
      if (updatedGameRoom && updatedGameRoom.status === 'accepted') {
        updatedGameRoom.status = 'in_progress'
        updatedGameRoom.startedAt = Date.now()
        await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(updatedGameRoom))
        gameRooms.set(gameId, updatedGameRoom)
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
          gameStatus: 'playing' as 'playing'
        })
        io.to([player1.socketId, player2.socketId]).emit('GameStarting', {
          gameId,
          hostEmail: player1.email,
          guestEmail: player2.email,
          hostData: player1Data,
          guestData: player2Data,
          startedAt: updatedGameRoom.startedAt,
        })
        setTimeout(() => {
          io.to([player1.socketId, player2.socketId]).emit('GameStarted', {
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
    activeMatchmakingUsers.delete(leaverEmail)
    activeMatchmakingUsers.delete(remainingPlayerEmail)

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
  socket.on('ResolveMatchmakingConflict', async (data: { 
    action: 'force_takeover' | 'cancel';
    email: string;
  }) => {
    try {
      const { action, email } = data;
      
      if (action === 'force_takeover') {
        const existingEntry = activeMatchmakingUsers.get(email)
        if (existingEntry) {
          removeAllQueueEntriesForUser(email)
          activeMatchmakingUsers.set(email, {
            socketId: socket.id,
            joinedAt: Date.now(),
            status: 'searching'
          })
          
          const player: MatchmakingPlayer = {
            socketId: socket.id,
            email: email,
            joinedAt: Date.now(),
          }
          matchmakingQueue.push(player)
          
          socket.emit('MatchmakingResponse', {
            status: 'success',
            message: 'Took over matchmaking session. Searching for opponent...',
            queuePosition: matchmakingQueue.length,
          })
          await tryMatchPlayers(io)
        }
      } else {
        socket.emit('MatchmakingResponse', {
          status: 'cancelled',
          message: 'Matchmaking cancelled.'
        })
      }
    } catch (error) {
      socket.emit('MatchmakingResponse', {
        status: 'error',
        message: 'Failed to resolve matchmaking conflict.'
      })
    }
  })
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