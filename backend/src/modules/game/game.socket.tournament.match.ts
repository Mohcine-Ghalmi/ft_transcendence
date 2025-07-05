import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import redis from '../../utils/redis';
import { Tournament, TournamentMatch } from './game.socket.types';
import { getSocketIds } from '../../socket';

const TOURNAMENT_PREFIX = 'tournament:';
const GAME_ROOM_PREFIX = 'game_room:';

interface TournamentGameRoomData {
  roomId: string;
  tournamentId: string;
  matchId: string;
  player1: any;
  player2: any;
  gameType: string;
  status: string;
  createdAt: number;
}

export function registerTournamentMatchHandlers(socket: Socket, io: Server) {
  // Handle tournament match results
  socket.on('TournamentMatchResult', async (data: {
    tournamentId: string;
    matchId: string;
    winnerEmail: string;
    loserEmail: string;
    playerEmail: string;
  }) => {
    try {
      const { tournamentId, matchId, winnerEmail, loserEmail, playerEmail } = data;
      
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return;
      
      const tournament: Tournament = JSON.parse(tournamentData);
      const match = tournament.matches.find(m => m.id === matchId);
      
      if (!match) return;
      
      // Update match result
      match.state = 'completed';
      match.winner = tournament.participants.find(p => p.email === winnerEmail);
      match.loser = tournament.participants.find(p => p.email === loserEmail);
      
      // Mark loser as eliminated
      const loser = tournament.participants.find(p => p.email === loserEmail);
      if (loser) {
        loser.status = 'eliminated';
      }
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify all participants
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds: string[] = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      io.to(allSocketIds).emit('TournamentMatchCompleted', {
        tournamentId,
        match,
        tournament,
        winner: match.winner,
        loser: match.loser,
        message: `${match.winner?.nickname} defeated ${match.loser?.nickname}`
      });
      
      // Check if tournament is complete
      const totalRounds = Math.log2(tournament.size);
      const finalMatch = tournament.matches.find(m => m.round === totalRounds - 1);
      
      if (finalMatch && finalMatch.state === 'completed' && finalMatch.winner) {
        // Tournament is complete
        tournament.status = 'completed';
        tournament.endedAt = Date.now();
        tournament.winner = finalMatch.winner;
        
        await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
        
        io.to(allSocketIds).emit('TournamentCompleted', {
          tournamentId,
          tournament,
          winner: finalMatch.winner,
          message: `Tournament completed! ${finalMatch.winner.nickname} is the champion!`
        });
      }
      
    } catch (error) {
      console.error('[Tournament] Error handling match result:', error);
    }
  });
} 