import { Socket, Server } from 'socket.io'

export const activeGameSessions = new Map<string, Set<string>>()
export const userGameSessions = new Map<string, string>()
export const socketToUser = new Map<string, string>()
export const userToSockets = new Map<string, Set<string>>()
export const gameSessionHeartbeat = new Map<string, number>()


export function addUserToGameSession(userEmail: string, gameId: string, socketId: string) {
  
  socketToUser.set(socketId, userEmail);
  if (!userToSockets.has(userEmail)) {
    userToSockets.set(userEmail, new Set());
  }
  userToSockets.get(userEmail)!.add(socketId);
  userGameSessions.set(userEmail, gameId);
  if (!activeGameSessions.has(gameId)) {
    activeGameSessions.set(gameId, new Set());
  }
  activeGameSessions.get(gameId)!.add(socketId);
  
  gameSessionHeartbeat.set(gameId, Date.now());
}

export function cleanupUserSession(userEmail: string, socketId: string) {
  socketToUser.delete(socketId);
  const userSockets = userToSockets.get(userEmail);
  if (userSockets) {
    userSockets.delete(socketId);
    if (userSockets.size === 0) {
      userToSockets.delete(userEmail);
      const gameId = userGameSessions.get(userEmail);
      if (gameId) {
        const gameSessions = activeGameSessions.get(gameId);
        if (gameSessions) {
          gameSessions.delete(socketId);
        }
      }
    }
  }
  
  const gameId = userGameSessions.get(userEmail);
  if (gameId) {
    const gameSessions = activeGameSessions.get(gameId);
    if (gameSessions) {
      gameSessions.delete(socketId);
    }
  }
}

// New function to handle reconnection
export function reconnectUserToGameSession(userEmail: string, gameId: string, socketId: string): boolean {
  const existingGameId = userGameSessions.get(userEmail);
  if (existingGameId === gameId) {
    addUserToGameSession(userEmail, gameId, socketId);
    return true;
  }
  
  return false;
}

// Check if user has any active sockets
export function hasActiveSockets(userEmail: string): boolean {
  const sockets = userToSockets.get(userEmail);
  return sockets ? sockets.size > 0 : false;
}

export function getUserCurrentGame(userEmail: string): string | undefined {
  return userGameSessions.get(userEmail);
}

export function isGameSessionActive(gameId: string): boolean {
  const sessions = activeGameSessions.get(gameId);
  if (!sessions || sessions.size === 0) return false;
  
  const lastHeartbeat = gameSessionHeartbeat.get(gameId);
  if (lastHeartbeat && Date.now() - lastHeartbeat > 30000) {
    return false;
  }
  
  return true;
}

export function updateGameHeartbeat(gameId: string) {
  gameSessionHeartbeat.set(gameId, Date.now());
}

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
  status: 'waiting' | 'accepted' | 'in_progress' | 'completed' | 'canceled' | 'ended'
  createdAt: number
  startedAt?: number
  endedAt?: number
  winner?: string
  loser?: string
  leaver?: string
  // Tournament properties (optional)
  tournamentId?: string
  matchId?: string
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
  id: number
  username: string
  login: string
  avatar: string
}

export interface MatchmakingPlayer {
  socketId: string
  email: string
  joinedAt: number
}

// Global state (shared across modules)
export const activeGames = new Map<string, GameState>()
export const gameRooms = new Map<string, GameRoomData>()
export const matchmakingQueue: MatchmakingPlayer[] = []

// Helper functions
export function getPlayerData(user: any): PlayerData {
  return {
    id: user.id,
    username: user.username,
    login: user.login,
    avatar: user.avatar
  }
}

export function removeFromQueue(socketId: string) {
  const idx = matchmakingQueue.findIndex((p) => p.socketId === socketId);
  if (idx !== -1) matchmakingQueue.splice(idx, 1);
}

export function removeFromQueueByEmail(email: string) {
  const idx = matchmakingQueue.findIndex((p) => p.email === email);
  if (idx !== -1) matchmakingQueue.splice(idx, 1);
}

export function isInQueue(email: string): boolean {
  return matchmakingQueue.some(p => p.email === email);
}

// Socket handler type
export type GameSocketHandler = (socket: Socket, io: Server) => void

// Tournament types
export interface Tournament {
  tournamentId: string;
  name: string;
  hostEmail: string;
  size: number;
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  status: 'setup' | 'lobby' | 'in_progress' | 'completed' | 'canceled';
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  winner?: TournamentParticipant;
  currentRound?: number;
}

export interface TournamentParticipant {
  email: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  status: 'invited' | 'accepted' | 'declined' | 'playing' | 'eliminated' | 'winner';
}

export interface TournamentMatch {
  id: string;
  round: number;
  matchIndex: number;
  player1?: TournamentParticipant;
  player2?: TournamentParticipant;
  state: 'waiting' | 'in_progress' | 'player1_win' | 'player2_win' | 'completed';
  winner?: TournamentParticipant;
  loser?: TournamentParticipant;
  gameRoomId?: string;
} 