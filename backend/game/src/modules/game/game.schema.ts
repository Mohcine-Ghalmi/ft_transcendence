import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

// Game state schema for real-time game updates
const gameStateSchema = z.object({
  gameId: z.string(),
  ballX: z.number(),
  ballY: z.number(),
  ballDx: z.number(),
  ballDy: z.number(),
  paddle1Y: z.number(),
  paddle2Y: z.number(),
  scores: z.object({
    p1: z.number(),
    p2: z.number()
  }),
  gameStatus: z.enum(['waiting', 'playing', 'paused', 'finished']),
  winner: z.string().optional(),
  lastUpdate: z.number()
})

// Match history schema
const matchHistorySchema = z.object({
  id: z.number().optional(),
  gameId: z.string(),
  player1Email: z.string().email(),
  player2Email: z.string().email(),
  player1Score: z.number(),
  player2Score: z.number(),
  winner: z.string().email(),
  loser: z.string().email(),
  gameDuration: z.number(), // in seconds
  startedAt: z.number(),
  endedAt: z.number(),
  gameMode: z.enum(['1v1', 'tournament']).default('1v1'),
  status: z.enum(['completed', 'forfeit']).default('completed')
})

// Game action schema for player inputs
const gameActionSchema = z.object({
  gameId: z.string(),
  playerEmail: z.string().email(),
  action: z.enum(['paddle_up', 'paddle_down', 'pause', 'resume', 'leave']),
  timestamp: z.number()
})

// Game result schema
const gameResultSchema = z.object({
  gameId: z.string(),
  winner: z.string().email(),
  loser: z.string().email(),
  finalScore: z.object({
    p1: z.number(),
    p2: z.number()
  }),
  gameDuration: z.number(),
  reason: z.enum(['normal_end', 'player_left', 'timeout']).default('normal_end')
})

export type GameState = z.infer<typeof gameStateSchema>
export type MatchHistory = z.infer<typeof matchHistorySchema>
export type GameAction = z.infer<typeof gameActionSchema>
export type GameResult = z.infer<typeof gameResultSchema>

export const { schemas: gameSchemas, $ref } = buildJsonSchemas(
  {
    gameStateSchema,
    matchHistorySchema,
    gameActionSchema,
    gameResultSchema
  },
  { $id: 'gameSchemas' }
) 