import redis, { getSocketIds } from '../../database/redis'
import { GameRoomData, activeGames, gameRooms } from './game.socket.types'
import { createMatchHistory } from './game.service'
import { activeGameSessions, userGameSessions } from './game.socket.types'

export async function cleanupGame(
  gameId: string,
  reason: 'normal_end' | 'player_left' | 'timeout' = 'normal_end'
) {
  const gameRoom = gameRooms.get(gameId)
  if (!gameRoom) return
  const gameSessions = activeGameSessions.get(gameId)
  if (gameSessions) {
    gameSessions.clear()
    activeGameSessions.delete(gameId)
  }

  const playersToCleanup = [gameRoom.hostEmail, gameRoom.guestEmail]
  for (const playerEmail of playersToCleanup) {
    const userGameId = userGameSessions.get(playerEmail)
    if (userGameId === gameId) {
      userGameSessions.delete(playerEmail)
    }
  }

  gameRoom.status = 'completed'
  gameRoom.endedAt = Date.now()
  await redis.setex(`game_room:${gameId}`, 300, JSON.stringify(gameRoom))
  activeGames.delete(gameId)
  gameRooms.delete(gameId)

  setTimeout(async () => {
    try {
      await redis.del(`game_room:${gameId}`)
    } catch (error) {
      console.error(`Error deleting game room ${gameId} from Redis:`, error)
    }
  }, 1000)
}

export async function saveMatchHistory(
  gameId: string,
  gameRoom: GameRoomData,
  winner: string,
  loser: string,
  finalScore: { p1: number; p2: number },
  reason: 'normal_end' | 'player_left' | 'timeout' = 'normal_end'
) {
  try {
    const { getDatabase } = await import('../../database/connection')
    const db = getDatabase()
    const existingStmt = db.prepare(
      'SELECT id FROM match_history WHERE game_id = ?'
    )
    const existing = existingStmt.get(gameId) as { id: number } | undefined

    if (existing) {
      return
    }
    const gameDuration =
      gameRoom.startedAt && gameRoom.endedAt
        ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
        : 0
    await createMatchHistory({
      gameId,
      player1Email: gameRoom.hostEmail,
      player2Email: gameRoom.guestEmail,
      player1Score: finalScore.p1,
      player2Score: finalScore.p2,
      winner,
      loser,
      gameDuration,
      startedAt: gameRoom.startedAt || Date.now(),
      endedAt: gameRoom.endedAt || Date.now(),
      gameMode: '1v1',
      status: reason === 'player_left' ? 'forfeit' : 'completed',
    })
  } catch (error) {
    console.error(`Error saving match history for game ${gameId}:`, error)
  }
}

export async function emitToUsers(
  io: any,
  userEmails: string[],
  event: string,
  data: any
) {
  const socketIds: string[] = []

  for (const email of userEmails) {
    const userSocketIds = await getSocketIds(email, 'sockets')
    socketIds.push(...userSocketIds)
  }

  if (socketIds.length > 0) {
    io.to(socketIds).emit(event, data)
  }
}
