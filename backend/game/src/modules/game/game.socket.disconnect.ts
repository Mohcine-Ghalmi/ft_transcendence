import redis from '../../database/redis'
import { getSocketIds } from '../../database/redis'
import { Socket, Server } from 'socket.io'
import { 
  GameRoomData, 
  activeGames, 
  gameRooms,
  GameSocketHandler,
  Tournament
} from './game.socket.types'
import { cleanupGame, saveMatchHistory, emitToUsers } from './game.socket.utils'
import { advanceTournamentRound } from './game.socket.tournament.events'
import { 
  cleanupUserSession, 
  socketToUser, 
  userToSockets,
  hasActiveSockets,
  getUserCurrentGame,
  isGameSessionActive,
  updateGameHeartbeat
} from './game.socket.types'

const TOURNAMENT_PREFIX = 'tournament:'

async function getAllActiveTournaments(): Promise<any[]> {
  try {
    const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
    const tournaments: any[] = [];
    for (const key of keys) {
      const t = await redis.get(key);
      if (t) {
        const parsed = JSON.parse(t);
        if (parsed.status === 'lobby' || parsed.status === 'in_progress') {
          tournaments.push(parsed);
        }
      }
    }
    return tournaments;
  } catch (err) {
    return [];
  }
}

const processingGames = new Set<string>();

export const handleGameDisconnect: GameSocketHandler = (socket, io) => {
  socket.on('disconnect', async () => {
    const userEmail = socketToUser.get(socket.id);
    if (!userEmail) {
      return;
    }
    cleanupUserSession(userEmail, socket.id);
    if (hasActiveSockets(userEmail)) {
      return;
    }

    setTimeout(async () => {
      if (hasActiveSockets(userEmail)) {
        return;
      }

      await processGameDisconnect(userEmail, io);
    }, 5000); 
  });

  socket.on('gameHeartbeat', (data: { gameId: string }) => {
    if (data.gameId) {
      updateGameHeartbeat(data.gameId);
    }
  });
};

async function processGameDisconnect(userEmail: string, io: Server) {
  const currentGameId = getUserCurrentGame(userEmail);
  if (!currentGameId)
    return;
  if (processingGames.has(currentGameId))
    return;

  const gameRoom = gameRooms.get(currentGameId);
  if (!gameRoom)
    return;
  if (gameRoom.hostEmail !== userEmail && gameRoom.guestEmail !== userEmail)
    return;
  const otherPlayerEmail = gameRoom.hostEmail === userEmail ? gameRoom.guestEmail : gameRoom.hostEmail;
  const otherPlayerSockets = await getSocketIds(otherPlayerEmail, 'sockets') || [];
  if (otherPlayerSockets.length === 0) {
    await cleanupGame(currentGameId, 'timeout');
    return;
  }

  if (gameRoom.status === 'in_progress') {
    
    processingGames.add(currentGameId);
    const winner = otherPlayerEmail;
    const loser = userEmail;
    const currentGameState = activeGames.get(currentGameId);
    const finalScore = currentGameState?.scores || { p1: 0, p2: 0 };
    gameRoom.status = 'completed';
    gameRoom.endedAt = Date.now();
    gameRoom.winner = winner;
    gameRoom.leaver = loser;
    
    const tournamentId = (gameRoom as any).tournamentId;
    const matchId = (gameRoom as any).matchId;
    if (tournamentId && matchId) {
      try {
        await handleTournamentGameDisconnect(tournamentId, matchId, winner, loser, io);
      } catch (error) {
        console.error('[Tournament] Error handling tournament game disconnect:', error);
      }
    }
    
    await saveMatchHistory(currentGameId, gameRoom, winner, loser, finalScore, 'player_left');
    await cleanupGame(currentGameId, 'player_left');
    const otherPlayerSocketIds = await getSocketIds(otherPlayerEmail, 'sockets') || [];
    io.to(otherPlayerSocketIds).emit('GameEnded', {
      gameId: currentGameId,
      winner,
      loser,
      finalScore,
      gameDuration: gameRoom.startedAt && gameRoom.endedAt 
        ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
        : 0,
      reason: 'player_left',
      message: 'Opponent disconnected. You win!'
    });
    setTimeout(() => {
      processingGames.delete(currentGameId);
    }, 5000);
    
  } else if (gameRoom.status === 'accepted') {
    processingGames.add(currentGameId);
    gameRoom.status = 'canceled';
    gameRoom.endedAt = Date.now();
    gameRoom.leaver = userEmail;
    await cleanupGame(currentGameId, 'timeout');
    const otherPlayerSocketIds = await getSocketIds(otherPlayerEmail, 'sockets') || [];
    io.to(otherPlayerSocketIds).emit('GameEndedByOpponentLeave', {
      gameId: currentGameId,
      winner: otherPlayerEmail,
      leaver: userEmail,
      message: 'Opponent disconnected before the game started.'
    });
    
    setTimeout(() => {
      processingGames.delete(currentGameId);
    }, 5000);
  }

  await handleTournamentPlayerDisconnect(userEmail, io);
}

async function handleTournamentGameDisconnect(
  tournamentId: string, 
  matchId: string, 
  winner: string, 
  loser: string, 
  io: Server
) {
  try {
    const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
    if (!tournamentData) return;
    
    const tournament: Tournament = JSON.parse(tournamentData);
    const match = tournament.matches.find((m: any) => m.id === matchId);
    
    if (!match) return;
    if (match.player1?.email === winner) {
      match.state = 'player1_win';
      match.winner = match.player1;
    } else if (match.player2?.email === winner) {
      match.state = 'player2_win';  
      match.winner = match.player2;
    }
    const loserParticipant = tournament.participants.find((p: any) => p.email === loser);
    if (loserParticipant) {
      loserParticipant.status = 'eliminated';
    }
    const winnerParticipant = tournament.participants.find((p: any) => p.email === winner);
    if (winnerParticipant) {
      winnerParticipant.status = 'accepted';
    }
    const currentRound = match.round;
    const roundMatches = tournament.matches.filter((m: any) => m.round === currentRound);
    const allRoundComplete = roundMatches.every((m: any) => m.state !== 'waiting' && m.state !== 'in_progress');
    
    if (allRoundComplete) {
      const updatedTournament = advanceTournamentRound(tournament);
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(updatedTournament));
      const allParticipantEmails = updatedTournament.participants.map((p: any) => p.email);
      const allSocketIds = [];
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      if (updatedTournament.status === 'completed') {
        const tournamentWinner = updatedTournament.participants.find((p: any) => p.status === 'winner');
        
        io.to(allSocketIds).emit('TournamentCompleted', {
          tournamentId: tournamentId,
          tournament: updatedTournament,
          winner: tournamentWinner
        });
      } else {
        io.to(allSocketIds).emit('TournamentRoundAdvanced', {
          tournamentId: tournamentId,
          tournament: updatedTournament,
          nextRound: currentRound + 1
        });
      }
    } else {
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
    }
    const allParticipantEmails = tournament.participants.map((p: any) => p.email);
    const allSocketIds = [];
    
    for (const email of allParticipantEmails) {
      const socketIds = await getSocketIds(email, 'sockets') || [];
      allSocketIds.push(...socketIds);
    }
    
    io.to(allSocketIds).emit('TournamentMatchCompleted', {
      tournamentId: tournamentId,
      matchId: matchId,
      match,
      tournament,
      winnerEmail: winner,
      loserEmail: loser,
      reason: 'player_disconnected'
    });
    
  } catch (error) {
    console.error('[Tournament] Error handling tournament game disconnect:', error);
  }
}

async function handleTournamentPlayerDisconnect(userEmail: string, io: Server) {
  try {
    const tournamentKeys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
    
    for (const key of tournamentKeys) {
      const tournamentData = await redis.get(key);
      if (!tournamentData) continue;
      const tournament = JSON.parse(tournamentData);
      if (tournament.hostEmail === userEmail && tournament.status !== 'completed' && tournament.status !== 'canceled') {
        const tournamentId = key.replace(TOURNAMENT_PREFIX, '');
        const allParticipantEmails = tournament.participants.map((p: any) => p.email);
        const allSocketIds: string[] = [];
        
        for (const email of allParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allSocketIds.push(...socketIds);
        }
        
        await redis.del(key);
        
        io.to(allSocketIds).emit('TournamentCanceled', {
          tournamentId,
          tournament: { ...tournament, status: 'canceled', endedAt: Date.now() },
          reason: 'Host disconnected'
        });
        
        io.to(allSocketIds).emit('RedirectToPlay', {
          message: 'Tournament canceled because host disconnected.',
          tournamentId
        });
        const remainingTournaments = await getAllActiveTournaments();
        io.emit('TournamentList', remainingTournaments);
        continue;
      }
      
      const isParticipant = tournament.participants.some((p: any) => p.email === userEmail);
      if (isParticipant && tournament.status === 'in_progress') {
        const activeMatch = tournament.matches.find((match: any) => 
          match.state === 'in_progress' && 
          (match.player1?.email === userEmail || match.player2?.email === userEmail)
        );
        
        if (activeMatch) {
          const { handleTournamentPlayerForfeit } = await import('./game.socket.tournament.events');
          const { updatedTournament, affectedMatch, forfeitedPlayer, advancingPlayer, isAutoWin } = 
            handleTournamentPlayerForfeit(tournament, userEmail);
          const tournamentId = key.replace(TOURNAMENT_PREFIX, '');
          await redis.setex(key, 3600, JSON.stringify(updatedTournament));
          
          const allParticipantEmails = updatedTournament.participants.map((p: any) => p.email);
          const allSocketIds: string[] = [];
          
          for (const email of allParticipantEmails) {
            const socketIds = await getSocketIds(email, 'sockets') || [];
            allSocketIds.push(...socketIds);
          }
          if (isAutoWin) {
            io.to(allSocketIds).emit('TournamentCompleted', {
              tournamentId,
              tournament: updatedTournament,
              winner: advancingPlayer,
              winnerEmail: advancingPlayer?.email,
              autoWin: true,
              message: `${advancingPlayer?.nickname} wins the tournament by default!`
            });
          } else {
            io.to(allSocketIds).emit('TournamentPlayerForfeited', {
              tournamentId,
              forfeitedPlayer,
              advancingPlayer,
              affectedMatch,
              tournament: updatedTournament,
              message: `${forfeitedPlayer?.nickname} has disconnected and forfeited the tournament. ${advancingPlayer?.nickname} advances to the next round.`
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling tournament forfeit on disconnect:', error);
  }
}