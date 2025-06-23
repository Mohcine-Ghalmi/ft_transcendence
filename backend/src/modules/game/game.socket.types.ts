// modules/game/game.socket.types.ts
import { Socket, Server } from 'socket.io'

// Core game types
export interface InviteToGameData {
  myEmail: string
  hisEmail: string
}

export interface GameInviteData {
  gameId: string
  hostEmail: string
  guestEmail: string
  createdAt: number
}

export interface GameRoomData {
  gameId: string
  hostEmail: string
  guestEmail: string
  status: 'waiting' | 'accepted' | 'in_progress' | 'completed' | 'canceled'
  createdAt: number
  startedAt?: number
  endedAt?: number
}

export interface GameState {
  gameId: string
  ballX: number
  ballY: number
  ballDx: number
  ballDy: number
  paddle1Y: number
  paddle2Y: number
  scores: {
    p1: number
    p2: number
  }
  gameStatus: 'waiting' | 'playing' | 'paused' | 'finished'
  winner?: string
  lastUpdate: number
}

export interface User {
  username: string
  email: string
  avatar: string
  level: number
  login: string
  xp: number
  id: number
}

export interface PlayerData {
  username: string
  login: string
  avatar: string
}

// Global state (shared across modules)
export const activeGames = new Map<string, GameState>()
export const gameRooms = new Map<string, GameRoomData>()
export const matchmakingQueue: { socketId: string; email: string }[] = []

// Helper functions
export function getPlayerData(user: User): PlayerData {
  return {
    username: user.username,
    login: user.login,
    avatar: user.avatar
  }
}

export function removeFromQueue(socketId: string) {
  const idx = matchmakingQueue.findIndex((p) => p.socketId === socketId);
  if (idx !== -1) matchmakingQueue.splice(idx, 1);
}

// Socket handler type
export type GameSocketHandler = (socket: Socket, io: Server) => void 