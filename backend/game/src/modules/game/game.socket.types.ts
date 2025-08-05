// game.socket.types.ts - Add session conflict helpers to existing types

import { Socket, Server } from 'socket.io'

export const activeGameSessions = new Map<string, Set<string>>()
export const userGameSessions = new Map<string, string>()
export const socketToUser = new Map<string, string>()
export const userToSockets = new Map<string, Set<string>>()
export const gameSessionHeartbeat = new Map<string, number>()
export const tournamentActiveSessions = new Map<string, Map<string, string>>();

export function setActiveTournamentSession(tournamentId: string, userEmail: string, socketId: string) {
  if (!tournamentActiveSessions.has(tournamentId)) {
    tournamentActiveSessions.set(tournamentId, new Map());
  }
  tournamentActiveSessions.get(tournamentId)!.set(userEmail, socketId);
}

// Helper function to get active tournament session for a user
export function getActiveTournamentSession(tournamentId: string, userEmail: string): string | undefined {
  return tournamentActiveSessions.get(tournamentId)?.get(userEmail);
}

// Helper function to remove tournament session tracking
export function removeActiveTournamentSession(tournamentId: string, userEmail: string) {
  tournamentActiveSessions.get(tournamentId)?.delete(userEmail);
  if (tournamentActiveSessions.get(tournamentId)?.size === 0) {
    tournamentActiveSessions.delete(tournamentId);
  }
}

// Helper function to cleanup tournament sessions when tournament ends
export function cleanupTournamentSessions(tournamentId: string) {
  tournamentActiveSessions.delete(tournamentId);
}

// Enhanced function to emit to only active tournament sessions
export async function emitToActiveTournamentSessions(
  io: any, 
  tournamentId: string, 
  event: string, 
  data: any,
  userEmails?: string[] // Optional: specific users to target
) {
  const activeSessions = tournamentActiveSessions.get(tournamentId);
  if (!activeSessions) return;

  const targetUsers = userEmails || Array.from(activeSessions.keys());
  const activeSocketIds: string[] = [];

  const { getSocketIds } = await import('../../database/redis');
  
  for (const userEmail of targetUsers) {
    const activeSocketId = activeSessions.get(userEmail);
    if (activeSocketId) {
      // Verify the socket is still connected
      const userSockets = await getSocketIds(userEmail, 'sockets') || [];
      if (userSockets.includes(activeSocketId)) {
        activeSocketIds.push(activeSocketId);
      } else {
        // Clean up stale session
        activeSessions.delete(userEmail);
      }
    }
  }

  if (activeSocketIds.length > 0) {
    io.to(activeSocketIds).emit(event, data);
  }
}

// Enhanced function to emit tournament notifications to specific user's active session
export async function emitToActiveUserSession(
  io: any,
  tournamentId: string,
  userEmail: string,
  event: string,
  data: any
): Promise<boolean> {
  const activeSocketId = getActiveTournamentSession(tournamentId, userEmail);
  if (activeSocketId) {
    const { getSocketIds } = await import('../../database/redis');
    // Verify the socket is still connected
    const userSockets = await getSocketIds(userEmail, 'sockets') || [];
    if (userSockets.includes(activeSocketId)) {
      io.to(activeSocketId).emit(event, data);
      return true;
    } else {
      // Clean up stale session
      removeActiveTournamentSession(tournamentId, userEmail);
    }
  }
  return false;
}


export function checkGameSessionConflict(userEmail: string, gameId: string, socketId: string): {
  hasConflict: boolean;
  conflictType: 'same_game_different_session' | 'different_game' | 'none';
  conflictGameId?: string;
} {
  const currentGameId = userGameSessions.get(userEmail);
  
  if (!currentGameId) {
    return { hasConflict: false, conflictType: 'none' };
  }
  
  if (currentGameId === gameId) {
    // Check if there are other active sessions for the same game
    const gameSessions = activeGameSessions.get(gameId) || new Set();
    const otherSessions = new Set([...gameSessions].filter(sid => sid !== socketId));
    
    if (otherSessions.size > 0) {
      // Check if other sessions belong to the same user
      let hasOtherUserSessions = false;
      for (const sessionId of otherSessions) {
        const sessionUser = socketToUser.get(sessionId);
        if (sessionUser === userEmail) {
          hasOtherUserSessions = true;
          break;
        }
      }
      
      if (hasOtherUserSessions) {
        return { 
          hasConflict: true, 
          conflictType: 'same_game_different_session',
          conflictGameId: gameId
        };
      }
    }
    
    return { hasConflict: false, conflictType: 'none' };
  } else {
    // User is in a different game
    const existingSessions = activeGameSessions.get(currentGameId) || new Set();
    if (existingSessions.size > 0) {
      return { 
        hasConflict: true, 
        conflictType: 'different_game',
        conflictGameId: currentGameId
      };
    }
    
    return { hasConflict: false, conflictType: 'none' };
  }
}

// Clean up stale sessions for a specific game
export function cleanupStaleGameSessions(gameId: string): number {
  const gameSessions = activeGameSessions.get(gameId);
  if (!gameSessions) return 0;
  
  let cleanedCount = 0;
  const staleSessions = new Set<string>();
  
  // Find sessions that no longer have valid socket connections
  for (const sessionId of gameSessions) {
    const userEmail = socketToUser.get(sessionId);
    if (!userEmail) {
      staleSessions.add(sessionId);
      continue;
    }
    
    const userSockets = userToSockets.get(userEmail);
    if (!userSockets || !userSockets.has(sessionId)) {
      staleSessions.add(sessionId);
    }
  }
  
  // Remove stale sessions
  for (const staleSession of staleSessions) {
    gameSessions.delete(staleSession);
    cleanedCount++;
  }
  
  // If no sessions left, remove the game entry
  if (gameSessions.size === 0) {
    activeGameSessions.delete(gameId);
  }
  
  return cleanedCount;
}

// Get all active games for a user
export function getUserActiveGames(userEmail: string): string[] {
  const activeGames: string[] = [];
  
  for (const [gameId, sessions] of activeGameSessions.entries()) {
    for (const sessionId of sessions) {
      const sessionUser = socketToUser.get(sessionId);
      if (sessionUser === userEmail) {
        activeGames.push(gameId);
        break; // Don't add the same game multiple times
      }
    }
  }
  
  return activeGames;
}

// Force cleanup user from all games
export function forceCleanupUserFromAllGames(userEmail: string): string[] {
  const cleanedGames: string[] = [];
  
  // Remove user from all game sessions
  for (const [gameId, sessions] of activeGameSessions.entries()) {
    const userSessions = new Set<string>();
    
    for (const sessionId of sessions) {
      const sessionUser = socketToUser.get(sessionId);
      if (sessionUser === userEmail) {
        userSessions.add(sessionId);
      }
    }
    
    if (userSessions.size > 0) {
      for (const sessionId of userSessions) {
        sessions.delete(sessionId);
      }
      cleanedGames.push(gameId);
      
      // If no sessions left, remove the game entry
      if (sessions.size === 0) {
        activeGameSessions.delete(gameId);
      }
    }
  }
  
  // Remove user game session mapping
  userGameSessions.delete(userEmail);
  
  return cleanedGames;
}

// Check if a game session is still valid
export function isValidGameSession(gameId: string, userEmail: string): boolean {
  const currentGameId = userGameSessions.get(userEmail);
  if (currentGameId !== gameId) {
    return false;
  }
  
  const gameSessions = activeGameSessions.get(gameId);
  if (!gameSessions || gameSessions.size === 0) {
    return false;
  }
  
  // Check if user has any active sessions in this game
  for (const sessionId of gameSessions) {
    const sessionUser = socketToUser.get(sessionId);
    if (sessionUser === userEmail) {
      // Verify the socket still exists
      const userSockets = userToSockets.get(userEmail);
      if (userSockets && userSockets.has(sessionId)) {
        return true;
      }
    }
  }
  
  return false;
}

// Get session statistics for debugging
export function getSessionStats(): {
  totalActiveSessions: number;
  totalActiveGames: number;
  totalUsers: number;
  gamesWithMultipleSessions: number;
  usersWithMultipleSessions: number;
} {
  let totalActiveSessions = 0;
  let gamesWithMultipleSessions = 0;
  
  for (const [gameId, sessions] of activeGameSessions.entries()) {
    totalActiveSessions += sessions.size;
    if (sessions.size > 2) { // More than 2 sessions (1 per player)
      gamesWithMultipleSessions++;
    }
  }
  
  let usersWithMultipleSessions = 0;
  for (const [userEmail, sockets] of userToSockets.entries()) {
    if (sockets.size > 1) {
      usersWithMultipleSessions++;
    }
  }
  
  return {
    totalActiveSessions,
    totalActiveGames: activeGameSessions.size,
    totalUsers: userToSockets.size,
    gamesWithMultipleSessions,
    usersWithMultipleSessions
  };
}

// Enhanced session management functions
export function addUserToGameSession(userEmail: string, gameId: string, socketId: string) {
  // Clean up any existing sessions for this user in other games first
  const existingGameId = userGameSessions.get(userEmail);
  if (existingGameId && existingGameId !== gameId) {
    const existingSessions = activeGameSessions.get(existingGameId);
    if (existingSessions) {
      // Remove user's old sessions
      for (const sessionId of [...existingSessions]) {
        const sessionUser = socketToUser.get(sessionId);
        if (sessionUser === userEmail) {
          existingSessions.delete(sessionId);
        }
      }
      // Clean up empty game session
      if (existingSessions.size === 0) {
        activeGameSessions.delete(existingGameId);
      }
    }
  }

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
          // Clean up empty game session
          if (gameSessions.size === 0) {
            activeGameSessions.delete(gameId);
          }
        }
        userGameSessions.delete(userEmail);
      }
    }
  }
  
  // Also clean up from any game sessions
  for (const [gameId, sessions] of activeGameSessions.entries()) {
    if (sessions.has(socketId)) {
      sessions.delete(socketId);
      if (sessions.size === 0) {
        activeGameSessions.delete(gameId);
      }
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

// Existing interfaces and types
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