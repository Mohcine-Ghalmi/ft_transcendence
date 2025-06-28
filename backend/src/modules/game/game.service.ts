import { getDatabase } from '../../database/connection'
import { MatchHistory, GameState, GameResult } from './game.schema'

export async function createMatchHistory(match: Omit<MatchHistory, 'id'>): Promise<MatchHistory> {
  const db = getDatabase()
  
  try {
    // First check if a match with this game_id already exists
    const existingStmt = db.prepare('SELECT id FROM match_history WHERE game_id = ?')
    const existing = existingStmt.get(match.gameId) as { id: number } | undefined
    
    if (existing) {
      console.log(`Match history already exists for game ${match.gameId}, skipping duplicate entry`)
      return {
        id: existing.id,
        ...match
      }
    }
    
    const stmt = db.prepare(`
      INSERT INTO match_history (
        game_id, player1_email, player2_email, player1_score, player2_score,
        winner, loser, game_duration, started_at, ended_at, game_mode, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      match.gameId,
      match.player1Email,
      match.player2Email,
      match.player1Score,
      match.player2Score,
      match.winner,
      match.loser,
      match.gameDuration,
      match.startedAt,
      match.endedAt,
      match.gameMode,
      match.status
    )
    
    return {
      id: result.lastInsertRowid as number,
      ...match
    }
  } catch (error) {
    console.error(`Error creating match history for game ${match.gameId}:`, error)
    
    // If it's a UNIQUE constraint error, try to get the existing record
    if (error && typeof error === 'object' && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`UNIQUE constraint error for game ${match.gameId}, attempting to retrieve existing record`)
      const existingStmt = db.prepare('SELECT * FROM match_history WHERE game_id = ?')
      const existing = existingStmt.get(match.gameId) as MatchHistory | undefined
      
      if (existing) {
        console.log(`Found existing match history for game ${match.gameId}`)
        return existing
      }
    }
    
    // Re-throw the error if we can't handle it
    throw error
  }
}

export async function getMatchHistoryByUser(email: string, limit: number = 20): Promise<MatchHistory[]> {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    SELECT * FROM match_history 
    WHERE player1_email = ? OR player2_email = ?
    ORDER BY ended_at DESC
    LIMIT ?
  `)
  
  return stmt.all(email, email, limit) as MatchHistory[]
}

export async function getMatchHistoryById(id: number): Promise<MatchHistory | null> {
  const db = getDatabase()
  
  const stmt = db.prepare('SELECT * FROM match_history WHERE id = ?')
  const result = stmt.get(id) as MatchHistory | undefined
  
  return result || null
}

export async function updateMatchHistory(id: number, updates: Partial<MatchHistory>): Promise<boolean> {
  const db = getDatabase()
  
  const fields = Object.keys(updates)
    .filter(key => key !== 'id')
    .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
    .join(', ')
  
  if (!fields) return false
  
  const values = Object.values(updates).filter(value => value !== undefined)
  values.push(id)
  
  const stmt = db.prepare(`UPDATE match_history SET ${fields} WHERE id = ?`)
  const result = stmt.run(...values)
  
  return result.changes > 0
}

export async function getPlayerStats(email: string): Promise<{
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  averageScore: number
}> {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as totalMatches,
      SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN loser = ? THEN 1 ELSE 0 END) as losses,
      AVG(CASE WHEN winner = ? THEN player1_score ELSE player2_score END) as averageScore
    FROM match_history 
    WHERE player1_email = ? OR player2_email = ?
  `)
  
  const result = stmt.get(email, email, email, email, email) as any
  
  const totalMatches = result.totalMatches || 0
  const wins = result.wins || 0
  const losses = result.losses || 0
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0
  
  return {
    totalMatches,
    wins,
    losses,
    winRate: Math.round(winRate * 100) / 100,
    averageScore: Math.round((result.averageScore || 0) * 100) / 100
  }
}

export async function initializeMatchHistoryTable(): Promise<void> {
  const db = getDatabase()
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS match_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT UNIQUE NOT NULL,
      player1_email TEXT NOT NULL,
      player2_email TEXT NOT NULL,
      player1_score INTEGER NOT NULL DEFAULT 0,
      player2_score INTEGER NOT NULL DEFAULT 0,
      winner TEXT NOT NULL,
      loser TEXT NOT NULL,
      game_duration INTEGER NOT NULL DEFAULT 0,
      started_at INTEGER NOT NULL,
      ended_at INTEGER NOT NULL,
      game_mode TEXT NOT NULL DEFAULT '1v1',
      status TEXT NOT NULL DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_match_history_player1 ON match_history(player1_email);
    CREATE INDEX IF NOT EXISTS idx_match_history_player2 ON match_history(player2_email);
    CREATE INDEX IF NOT EXISTS idx_match_history_ended_at ON match_history(ended_at);
    CREATE INDEX IF NOT EXISTS idx_match_history_winner ON match_history(winner);
  `)
} 