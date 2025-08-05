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

export function getActiveTournamentSession(tournamentId: string, userEmail: string): string | undefined {
  return tournamentActiveSessions.get(tournamentId)?.get(userEmail);
}

export function removeActiveTournamentSession(tournamentId: string, userEmail: string) {
  tournamentActiveSessions.get(tournamentId)?.delete(userEmail);
  if (tournamentActiveSessions.get(tournamentId)?.size === 0) {
    tournamentActiveSessions.delete(tournamentId);
  }
}

export function cleanupTournamentSessions(tournamentId: string) {
  tournamentActiveSessions.delete(tournamentId);
}

export async function emitToActiveTournamentSessions(
  io: any, 
  tournamentId: string, 
  event: string, 
  data: any,
  userEmails?: string[]
) {
  const activeSessions = tournamentActiveSessions.get(tournamentId);
  if (!activeSessions) return;

  const targetUsers = userEmails || Array.from(activeSessions.keys());
  const activeSocketIds: string[] = [];

  const { getSocketIds } = await import('../../database/redis');
  
  for (const userEmail of targetUsers) {
    const activeSocketId = activeSessions.get(userEmail);
    if (activeSocketId) {
      const userSockets = await getSocketIds(userEmail, 'sockets') || [];
      if (userSockets.includes(activeSocketId)) {
        activeSocketIds.push(activeSocketId);
      } else {
        activeSessions.delete(userEmail);
      }
    }
  }

  if (activeSocketIds.length > 0) {
    io.to(activeSocketIds).emit(event, data);
  }
}

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
    const userSockets = await getSocketIds(userEmail, 'sockets') || [];
    if (userSockets.includes(activeSocketId)) {
      io.to(activeSocketId).emit(event, data);
      return true;
    } else {
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
    const gameSessions = activeGameSessions.get(gameId) || new Set();
    const otherSessions = new Set([...gameSessions].filter(sid => sid !== socketId));
    
    if (otherSessions.size > 0) {
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

export function cleanupStaleGameSessions(gameId: string): number {
  const gameSessions = activeGameSessions.get(gameId);
  if (!gameSessions) return 0;
  
  let cleanedCount = 0;
  const staleSessions = new Set<string>();
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
  
  for (const staleSession of staleSessions) {
    gameSessions.delete(staleSession);
    cleanedCount++;
  }
  if (gameSessions.size === 0) {
    activeGameSessions.delete(gameId);
  }
  
  return cleanedCount;
}

export function getUserActiveGames(userEmail: string): string[] {
  const activeGames: string[] = [];
  
  for (const [gameId, sessions] of activeGameSessions.entries()) {
    for (const sessionId of sessions) {
      const sessionUser = socketToUser.get(sessionId);
      if (sessionUser === userEmail) {
        activeGames.push(gameId);
        break; 
      }
    }
  }
  
  return activeGames;
}

export function forceCleanupUserFromAllGames(userEmail: string): string[] {
  const cleanedGames: string[] = [];
  
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
      
      if (sessions.size === 0) {
        activeGameSessions.delete(gameId);
      }
    }
  }
  
  userGameSessions.delete(userEmail);
  
  return cleanedGames;
}

export function isValidGameSession(gameId: string, userEmail: string): boolean {
  const currentGameId = userGameSessions.get(userEmail);
  if (currentGameId !== gameId) {
    return false;
  }
  
  const gameSessions = activeGameSessions.get(gameId);
  if (!gameSessions || gameSessions.size === 0) {
    return false;
  }
  
  for (const sessionId of gameSessions) {
    const sessionUser = socketToUser.get(sessionId);
    if (sessionUser === userEmail) {
      const userSockets = userToSockets.get(userEmail);
      if (userSockets && userSockets.has(sessionId)) {
        return true;
      }
    }
  }
  
  return false;
}

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
    if (sessions.size > 2) {
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

export function addUserToGameSession(userEmail: string, gameId: string, socketId: string) {
  const existingGameId = userGameSessions.get(userEmail);
  if (existingGameId && existingGameId !== gameId) {
    const existingSessions = activeGameSessions.get(existingGameId);
    if (existingSessions) {
      for (const sessionId of [...existingSessions]) {
        const sessionUser = socketToUser.get(sessionId);
        if (sessionUser === userEmail) {
          existingSessions.delete(sessionId);
        }
      }
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
          if (gameSessions.size === 0) {
            activeGameSessions.delete(gameId);
          }
        }
        userGameSessions.delete(userEmail);
      }
    }
  }
  
  for (const [gameId, sessions] of activeGameSessions.entries()) {
    if (sessions.has(socketId)) {
      sessions.delete(socketId);
      if (sessions.size === 0) {
        activeGameSessions.delete(gameId);
      }
    }
  }
}

export function reconnectUserToGameSession(userEmail: string, gameId: string, socketId: string): boolean {
  const existingGameId = userGameSessions.get(userEmail);
  if (existingGameId === gameId) {
    addUserToGameSession(userEmail, gameId, socketId);
    return true;
  }
  
  return false;
}

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

export const activeGames = new Map<string, GameState>()
export const gameRooms = new Map<string, GameRoomData>()
export const matchmakingQueue: MatchmakingPlayer[] = []

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

export type GameSocketHandler = (socket: Socket, io: Server) => void
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