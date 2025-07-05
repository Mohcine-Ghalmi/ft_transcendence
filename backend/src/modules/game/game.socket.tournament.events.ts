// Utility/event helpers for tournament socket logic
// Export any helpers needed by lobby/match handlers

import { Tournament, TournamentParticipant, TournamentMatch } from './game.socket.types'; 

// Helper function to create tournament bracket
export function createTournamentBracket(participants: TournamentParticipant[], size: number): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  const totalRounds = Math.log2(size);
  
  // Shuffle participants for random seeding
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
  
  // Create first round matches
  for (let i = 0; i < size / 2; i++) {
    const player1 = shuffledParticipants[i * 2] || undefined;
    const player2 = shuffledParticipants[i * 2 + 1] || undefined;
    let state: 'waiting' | 'in_progress' | 'completed' | 'player1_win' | 'player2_win' = 'waiting';
    let winner: TournamentParticipant | undefined = undefined;
    
    // Handle byes (when there's no opponent)
    if (player1 && !player2) {
      state = 'player1_win';
      winner = player1;
    } else if (!player1 && player2) {
      state = 'player2_win';
      winner = player2;
    }
    
    matches.push({
      id: `match-${Date.now()}-${i}`,
      round: 0,
      matchIndex: i,
      player1,
      player2,
      state,
      winner
    });
  }
  
  // Create placeholder matches for future rounds
  for (let round = 1; round < totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round + 1);
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `match-${Date.now()}-${round}-${i}`,
        round: round,
        matchIndex: i,
        player1: undefined,
        player2: undefined,
        state: 'waiting'
      });
    }
  }
  
  return matches;
}

// Helper function to advance tournament round
export function advanceTournamentRound(tournament: Tournament): Tournament {
  const updatedTournament = { ...tournament };
  
  // Find the current round
  const currentRound = Math.max(...tournament.matches.map(m => m.round));
  const nextRound = currentRound + 1;
  const totalRounds = Math.log2(tournament.size);
  
  if (nextRound >= totalRounds) {
    // Tournament is complete
    updatedTournament.status = 'completed';
    updatedTournament.endedAt = Date.now();
    
    // Find the winner (last remaining player)
    const finalMatch = updatedTournament.matches.find(m => m.round === currentRound && m.state !== 'waiting');
    if (finalMatch && finalMatch.winner) {
      // Update winner status
      const winnerParticipant = updatedTournament.participants.find(p => p.email === finalMatch.winner!.email);
      if (winnerParticipant) {
        winnerParticipant.status = 'winner';
      }
      updatedTournament.winner = finalMatch.winner;
    }
    
    return updatedTournament;
  }
  
  // Get completed matches from current round
  const completedMatches = updatedTournament.matches.filter(m => 
    m.round === currentRound && (m.state === 'player1_win' || m.state === 'player2_win') && m.winner
  );
  
  // Create next round matches
  const nextRoundMatches = [];
  for (let i = 0; i < completedMatches.length; i += 2) {
    const match1 = completedMatches[i];
    const match2 = completedMatches[i + 1];
    
    if (match1 && match2 && match1.winner && match2.winner) {
      const player1 = match1.winner;
      const player2 = match2.winner;
      
      nextRoundMatches.push({
        id: `match-${Date.now()}-${nextRound}-${i/2}`,
        round: nextRound,
        matchIndex: i / 2,
        player1,
        player2,
        state: 'waiting' as const
      });
    }
  }
  
  // Add new matches to tournament
  updatedTournament.matches.push(...nextRoundMatches);
  
  return updatedTournament;
}

// Helper function to check if tournament is complete
export function isTournamentComplete(tournament: Tournament): boolean {
  const totalRounds = Math.log2(tournament.size);
  const finalRoundMatches = tournament.matches.filter(m => m.round === totalRounds - 1);
  
  return finalRoundMatches.length > 0 && 
         finalRoundMatches.every(m => m.state === 'completed' && m.winner);
}

// Helper function to get tournament winner
export function getTournamentWinner(tournament: Tournament): TournamentParticipant | null {
  if (!isTournamentComplete(tournament)) {
    return null;
  }
  
  const totalRounds = Math.log2(tournament.size);
  const finalMatch = tournament.matches.find(m => m.round === totalRounds - 1);
  
  return finalMatch?.winner || null;
}

// Helper function to get current round matches
export function getCurrentRoundMatches(tournament: Tournament): TournamentMatch[] {
  const currentRound = Math.max(...tournament.matches.map(m => m.round));
  return tournament.matches.filter(m => m.round === currentRound);
}

// Helper function to get next round matches
export function getNextRoundMatches(tournament: Tournament): TournamentMatch[] {
  const currentRound = Math.max(...tournament.matches.map(m => m.round));
  const nextRound = currentRound + 1;
  return tournament.matches.filter(m => m.round === nextRound);
}

// Helper function to check if all matches in a round are completed
export function isRoundComplete(tournament: Tournament, round: number): boolean {
  const roundMatches = tournament.matches.filter(m => m.round === round);
  return roundMatches.length > 0 && roundMatches.every(m => m.state === 'completed');
}

// Helper function to get tournament statistics
export function getTournamentStats(tournament: Tournament) {
  const totalMatches = tournament.matches.length;
  const completedMatches = tournament.matches.filter(m => m.state === 'completed').length;
  const inProgressMatches = tournament.matches.filter(m => m.state === 'in_progress').length;
  const waitingMatches = tournament.matches.filter(m => m.state === 'waiting').length;
  
  const totalRounds = Math.log2(tournament.size);
  const currentRound = Math.max(...tournament.matches.map(m => m.round));
  
  return {
    totalMatches,
    completedMatches,
    inProgressMatches,
    waitingMatches,
    totalRounds,
    currentRound,
    progress: (completedMatches / totalMatches) * 100
  };
}

// Helper function to validate tournament data
export function validateTournament(tournament: Tournament): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!tournament.tournamentId) {
    errors.push('Tournament ID is required');
  }
  
  if (!tournament.name) {
    errors.push('Tournament name is required');
  }
  
  if (!tournament.hostEmail) {
    errors.push('Host email is required');
  }
  
  if (!tournament.size || tournament.size < 2) {
    errors.push('Tournament size must be at least 2');
  }
  
  if (!Array.isArray(tournament.participants)) {
    errors.push('Participants must be an array');
  } else if (tournament.participants.length > tournament.size) {
    errors.push('Number of participants cannot exceed tournament size');
  }
  
  if (!Array.isArray(tournament.matches)) {
    errors.push('Matches must be an array');
  }
  
  if (!['lobby', 'in_progress', 'completed', 'canceled'].includes(tournament.status)) {
    errors.push('Invalid tournament status');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper function to get participant by email
export function getParticipantByEmail(tournament: Tournament, email: string): TournamentParticipant | undefined {
  return tournament.participants.find(p => p.email === email);
}

// Helper function to check if participant is host
export function isParticipantHost(tournament: Tournament, email: string): boolean {
  return tournament.hostEmail === email;
}

// Helper function to get match by ID
export function getMatchById(tournament: Tournament, matchId: string): TournamentMatch | undefined {
  return tournament.matches.find(m => m.id === matchId);
}

// Helper function to get matches by round
export function getMatchesByRound(tournament: Tournament, round: number): TournamentMatch[] {
  return tournament.matches.filter(m => m.round === round);
}

// Helper function to get player's current match
export function getPlayerCurrentMatch(tournament: Tournament, playerEmail: string): TournamentMatch | undefined {
  return tournament.matches.find(m => 
    (m.player1?.email === playerEmail || m.player2?.email === playerEmail) && 
    m.state === 'in_progress'
  );
}

// Helper function to check if player is in tournament
export function isPlayerInTournament(tournament: Tournament, playerEmail: string): boolean {
  return tournament.participants.some(p => p.email === playerEmail);
} 