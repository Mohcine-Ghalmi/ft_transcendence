import Database from 'better-sqlite3'
import { join } from 'path'

let db: Database.Database

export function initializeDatabase(): Database.Database {
  if (db) {
    return db
  }

  try {
    const databaseUrl = process.env.DATABASE_URL || '/db/database.db'
    const dbPath = databaseUrl.startsWith('/')
      ? databaseUrl
      : join(process.cwd(), databaseUrl)

    db = new Database(dbPath)

    db.pragma('journal_mode = WAL')

    db.pragma('foreign_keys = ON')

    console.log('Database connected successfully')
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    console.log('Database connection closed')
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error(
      'Database not initialized. Call initializeDatabase() first.'
    )
  }
  return db
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase()
  process.exit(0)
})

process.on('SIGTERM', () => {
  closeDatabase()
  process.exit(0)
})
