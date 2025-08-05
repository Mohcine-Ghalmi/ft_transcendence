import {
  Tournament,
  TournamentParticipant,
  TournamentMatch,
} from './game.socket.types'

export function createTournamentBracket(
  participants: TournamentParticipant[],
  size: number
): TournamentMatch[] {
  const matches: TournamentMatch[] = []
  const totalRounds = Math.log2(size)
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5)
  for (let i = 0; i < size / 2; i++) {
    const player1 = shuffledParticipants[i * 2] || undefined
    const player2 = shuffledParticipants[i * 2 + 1] || undefined
    let state:
      | 'waiting'
      | 'in_progress'
      | 'completed'
      | 'player1_win'
      | 'player2_win' = 'waiting'
    let winner: TournamentParticipant | undefined = undefined
    if (player1 && !player2) {
      state = 'player1_win'
      winner = player1
    } else if (!player1 && player2) {
      state = 'player2_win'
      winner = player2
    }

    matches.push({
      id: `match-${Date.now()}-${i}`,
      round: 0,
      matchIndex: i,
      player1,
      player2,
      state,
      winner,
    })
  }
  for (let round = 1; round < totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round + 1)
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `match-${Date.now()}-${round}-${i}`,
        round: round,
        matchIndex: i,
        player1: undefined,
        player2: undefined,
        state: 'waiting',
      })
    }
  }

  return matches
}
export function advanceTournamentRound(tournament: Tournament): Tournament {
  const updatedTournament = { ...tournament }
  const currentRound = Math.max(...tournament.matches.map((m) => m.round))
  const nextRound = currentRound + 1
  const totalRounds = Math.log2(tournament.size)

  if (nextRound >= totalRounds) {
    updatedTournament.status = 'completed'
    updatedTournament.endedAt = Date.now()

    const finalMatch = updatedTournament.matches.find(
      (m) => m.round === currentRound && m.state !== 'waiting'
    )
    if (finalMatch && finalMatch.winner) {
      const winnerParticipant = updatedTournament.participants.find(
        (p) => p.email === finalMatch.winner!.email
      )
      if (winnerParticipant) {
        winnerParticipant.status = 'winner'
      }
      updatedTournament.winner = finalMatch.winner
    }

    return updatedTournament
  }
  const completedMatches = updatedTournament.matches.filter(
    (m) =>
      m.round === currentRound &&
      (m.state === 'player1_win' || m.state === 'player2_win') &&
      m.winner
  )
  const nextRoundMatches: any = []
  for (let i = 0; i < completedMatches.length; i += 2) {
    const match1 = completedMatches[i]
    const match2 = completedMatches[i + 1]

    if (match1 && match2 && match1.winner && match2.winner) {
      const player1 = match1.winner
      const player2 = match2.winner

      nextRoundMatches.push({
        id: `match-${Date.now()}-${nextRound}-${i / 2}`,
        round: nextRound,
        matchIndex: i / 2,
        player1,
        player2,
        state: 'waiting' as const,
      })
    }
  }
  updatedTournament.matches.push(...nextRoundMatches)

  return updatedTournament
}

export function isTournamentComplete(tournament: Tournament): boolean {
  const totalRounds = Math.log2(tournament.size)
  const finalRoundMatches = tournament.matches.filter(
    (m) => m.round === totalRounds - 1
  )

  return (
    finalRoundMatches.length > 0 &&
    finalRoundMatches.every(
      (m) =>
        (m.state === 'player1_win' || m.state === 'player2_win') && m.winner
    )
  )
}
export function getTournamentWinner(
  tournament: Tournament
): TournamentParticipant | null {
  if (!isTournamentComplete(tournament)) {
    return null
  }

  const totalRounds = Math.log2(tournament.size)
  const finalMatch = tournament.matches.find((m) => m.round === totalRounds - 1)

  return finalMatch?.winner || null
}

export function getCurrentRoundMatches(
  tournament: Tournament
): TournamentMatch[] {
  const currentRound = Math.max(...tournament.matches.map((m) => m.round))
  return tournament.matches.filter((m) => m.round === currentRound)
}

export function getNextRoundMatches(tournament: Tournament): TournamentMatch[] {
  const currentRound = Math.max(...tournament.matches.map((m) => m.round))
  const nextRound = currentRound + 1
  return tournament.matches.filter((m) => m.round === nextRound)
}

export function isRoundComplete(
  tournament: Tournament,
  round: number
): boolean {
  const roundMatches = tournament.matches.filter((m) => m.round === round)
  return (
    roundMatches.length > 0 &&
    roundMatches.every(
      (m) => m.state === 'player1_win' || m.state === 'player2_win'
    )
  )
}

export function getTournamentStats(tournament: Tournament) {
  const totalMatches = tournament.matches.length
  const completedMatches = tournament.matches.filter(
    (m) => m.state === 'player1_win' || m.state === 'player2_win'
  ).length
  const inProgressMatches = tournament.matches.filter(
    (m) => m.state === 'in_progress'
  ).length
  const waitingMatches = tournament.matches.filter(
    (m) => m.state === 'waiting'
  ).length

  const totalRounds = Math.log2(tournament.size)
  const currentRound = Math.max(...tournament.matches.map((m) => m.round))

  return {
    totalMatches,
    completedMatches,
    inProgressMatches,
    waitingMatches,
    totalRounds,
    currentRound,
    progress: (completedMatches / totalMatches) * 100,
  }
}

export function validateTournament(tournament: Tournament): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!tournament.tournamentId) {
    errors.push('Tournament ID is required')
  }

  if (!tournament.name) {
    errors.push('Tournament name is required')
  }

  if (!tournament.hostEmail) {
    errors.push('Host email is required')
  }

  if (!tournament.size || tournament.size < 2) {
    errors.push('Tournament size must be at least 2')
  }

  if (!Array.isArray(tournament.participants)) {
    errors.push('Participants must be an array')
  } else if (tournament.participants.length > tournament.size) {
    errors.push('Number of participants cannot exceed tournament size')
  }

  if (!Array.isArray(tournament.matches)) {
    errors.push('Matches must be an array')
  }

  if (
    !['lobby', 'in_progress', 'completed', 'canceled'].includes(
      tournament.status
    )
  ) {
    errors.push('Invalid tournament status')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function getParticipantByEmail(
  tournament: Tournament,
  email: string
): TournamentParticipant | undefined {
  return tournament.participants.find((p) => p.email === email)
}

export function isParticipantHost(
  tournament: Tournament,
  email: string
): boolean {
  return tournament.hostEmail === email
}

export function getMatchById(
  tournament: Tournament,
  matchId: string
): TournamentMatch | undefined {
  return tournament.matches.find((m) => m.id === matchId)
}

export function getMatchesByRound(
  tournament: Tournament,
  round: number
): TournamentMatch[] {
  return tournament.matches.filter((m) => m.round === round)
}

export function getPlayerCurrentMatch(
  tournament: Tournament,
  playerEmail: string
): TournamentMatch | undefined {
  return tournament.matches.find(
    (m) =>
      (m.player1?.email === playerEmail || m.player2?.email === playerEmail) &&
      m.state === 'in_progress'
  )
}

export function isPlayerInTournament(
  tournament: Tournament,
  playerEmail: string
): boolean {
  return tournament.participants.some((p) => p.email === playerEmail)
}

export function handleTournamentPlayerForfeit(
  tournament: Tournament,
  playerEmail: string
): {
  updatedTournament: Tournament
  affectedMatch: TournamentMatch | null
  forfeitedPlayer: TournamentParticipant | null
  advancingPlayer: TournamentParticipant | null
  isAutoWin: boolean
} {
  const forfeitedPlayer = tournament.participants.find(
    (p) => p.email === playerEmail
  )
  if (!forfeitedPlayer) {
    return {
      updatedTournament: tournament,
      affectedMatch: null,
      forfeitedPlayer: null,
      advancingPlayer: null,
      isAutoWin: false,
    }
  }
  forfeitedPlayer.status = 'eliminated'
  const activeParticipants = tournament.participants.filter(
    (p) => p.status !== 'eliminated'
  )

  if (activeParticipants.length === 1) {
    const winner = activeParticipants[0]
    tournament.status = 'completed'
    tournament.endedAt = Date.now()
    tournament.winner = winner
    winner.status = 'winner'

    return {
      updatedTournament: tournament,
      affectedMatch: null,
      forfeitedPlayer,
      advancingPlayer: winner,
      isAutoWin: true,
    }
  }

  const currentMatch = tournament.matches.find(
    (m) =>
      (m.player1?.email === playerEmail || m.player2?.email === playerEmail) &&
      (m.state === 'waiting' || m.state === 'in_progress')
  )

  if (!currentMatch) {
    return {
      updatedTournament: tournament,
      affectedMatch: null,
      forfeitedPlayer,
      advancingPlayer: null,
      isAutoWin: false,
    }
  }

  const advancingPlayer =
    currentMatch.player1?.email === playerEmail
      ? currentMatch.player2
      : currentMatch.player1

  if (!advancingPlayer) {
    if (currentMatch.player1?.email === playerEmail) {
      currentMatch.state = 'player2_win'
      currentMatch.winner = currentMatch.player2
    } else {
      currentMatch.state = 'player1_win'
      currentMatch.winner = currentMatch.player1
    }
    return {
      updatedTournament: tournament,
      affectedMatch: currentMatch,
      forfeitedPlayer,
      advancingPlayer: null,
      isAutoWin: false,
    }
  }

  if (currentMatch.player1?.email === advancingPlayer.email) {
    currentMatch.state = 'player1_win'
    currentMatch.winner = currentMatch.player1
  } else if (currentMatch.player2?.email === advancingPlayer.email) {
    currentMatch.state = 'player2_win'
    currentMatch.winner = currentMatch.player2
  }

  if (advancingPlayer) {
    const advancingParticipant = tournament.participants.find(
      (p) => p.email === advancingPlayer.email
    )
    if (advancingParticipant) {
      advancingParticipant.status = 'accepted'
    }
  }

  const nextRound = currentMatch.round + 1
  const nextMatchIndex = Math.floor(currentMatch.matchIndex / 2)
  const nextMatch = tournament.matches.find(
    (m) => m.round === nextRound && m.matchIndex === nextMatchIndex
  )

  if (nextMatch && currentMatch.winner) {
    if (currentMatch.matchIndex % 2 === 0) {
      nextMatch.player1 = currentMatch.winner
    } else {
      nextMatch.player2 = currentMatch.winner
    }

    if (nextMatch.player1 && nextMatch.player2) {
      nextMatch.state = 'waiting'
    }
  }

  return {
    updatedTournament: tournament,
    affectedMatch: currentMatch,
    forfeitedPlayer,
    advancingPlayer,
    isAutoWin: false,
  }
}
