import redis from '../../utils/redis'
import { GameRoomData, activeGames, gameRooms } from './game.socket.types'
import { createMatchHistory } from './game.service'

// Helper function to clean up game resources
export async function cleanupGame(gameId: string, reason: 'normal_end' | 'player_left' | 'timeout' = 'normal_end') {
  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom) return;

  // Update game status
  gameRoom.status = 'completed';
  gameRoom.endedAt = Date.now();
  
  // Save the final state to Redis briefly (for debugging/logging purposes)
  await redis.setex(`game_room:${gameId}`, 300, JSON.stringify(gameRoom)); // Keep for 5 minutes instead of 1 hour

  // Remove from active games immediately
  activeGames.delete(gameId);
  gameRooms.delete(gameId);
  
  // Delete the Redis key immediately after a short delay to ensure data is saved
  setTimeout(async () => {
    try {
      await redis.del(`game_room:${gameId}`);
      console.log(`Cleaned up game room ${gameId} from Redis`);
    } catch (error) {
      console.error(`Error deleting game room ${gameId} from Redis:`, error);
    }
  }, 1000); // 1 second delay to ensure the final state is saved
}

// Helper function to save match history
export async function saveMatchHistory(
  gameId: string,
  gameRoom: GameRoomData,
  winner: string,
  loser: string,
  finalScore: { p1: number; p2: number },
  reason: 'normal_end' | 'player_left' | 'timeout' = 'normal_end'
) {
  try {
    // Check if match history already exists for this game
    const { getDatabase } = await import('../../database/connection')
    const db = getDatabase()
    const existingStmt = db.prepare('SELECT id FROM match_history WHERE game_id = ?')
    const existing = existingStmt.get(gameId) as { id: number } | undefined
    
    if (existing) {
      console.log(`Match history already exists for game ${gameId}, skipping duplicate save`)
      return
    }

    // Calculate game duration
    const gameDuration = gameRoom.startedAt && gameRoom.endedAt 
      ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
      : 0

    // Save match history
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
      status: reason === 'player_left' ? 'forfeit' : 'completed'
    })
  } catch (error) {
    console.error(`Error saving match history for game ${gameId}:`, error)
    // Don't re-throw the error to prevent game cleanup from failing
  }
}

// Helper function to get socket IDs for a user
export async function getUserSocketIds(userEmail: string) {
  const { getSocketIds } = await import('../../socket')
  return await getSocketIds(userEmail, 'sockets') || []
}

// Helper function to emit to multiple users
export async function emitToUsers(io: any, userEmails: string[], event: string, data: any) {
  const socketIds: string[] = []
  
  for (const email of userEmails) {
    const userSocketIds = await getUserSocketIds(email)
    socketIds.push(...userSocketIds)
  }
  
  if (socketIds.length > 0) {
    io.to(socketIds).emit(event, data)
  }
} 