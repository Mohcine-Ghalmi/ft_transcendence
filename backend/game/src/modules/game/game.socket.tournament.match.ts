import { Socket, Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { Tournament, TournamentMatch } from './game.socket.types'
import redis, { getSocketIds } from '../../database/redis'

const TOURNAMENT_PREFIX = 'tournament:'
const GAME_ROOM_PREFIX = 'game_room:'

interface TournamentGameRoomData {
  roomId: string
  tournamentId: string
  matchId: string
  player1: any
  player2: any
  gameType: string
  status: string
  createdAt: number
}

// Exported function to process tournament match results
export async function processTournamentMatchResult(
  io: Server,
  data: {
    tournamentId: string
    matchId: string
    winnerEmail: string
    loserEmail: string
    playerEmail: string
  }
) {
  try {
    const { tournamentId, matchId, winnerEmail, loserEmail } = data

    const tournamentData = await redis.get(
      `${TOURNAMENT_PREFIX}${tournamentId}`
    )
    if (!tournamentData) {
      return
    }

    const tournament: Tournament = JSON.parse(tournamentData)
    const match = tournament.matches.find((m) => m.id === matchId)

    if (!match) {
      return
    }

    // Update match result - set correct winner state instead of 'completed'
    if (match.player1?.email === winnerEmail) {
      match.state = 'player1_win'
      match.winner = match.player1
    } else if (match.player2?.email === winnerEmail) {
      match.state = 'player2_win'
      match.winner = match.player2
    } else {
      return
    }

    match.loser = tournament.participants.find((p) => p.email === loserEmail)

    // Mark loser as eliminated
    const loser = tournament.participants.find((p) => p.email === loserEmail)
    if (loser) {
      loser.status = 'eliminated'
    }

    // Advance winner to next round
    const nextRound = match.round + 1
    const nextMatchIndex = Math.floor(match.matchIndex / 2)
    const nextMatch = tournament.matches.find(
      (m) => m.round === nextRound && m.matchIndex === nextMatchIndex
    )

    if (nextMatch && match.winner) {
      // Determine if winner goes to player1 or player2 slot
      if (match.matchIndex % 2 === 0) {
        // Even match index -> winner goes to player1 slot
        nextMatch.player1 = match.winner
      } else {
        // Odd match index -> winner goes to player2 slot
        nextMatch.player2 = match.winner
      }

      // Check if next match is ready (both players assigned)
      if (nextMatch.player1 && nextMatch.player2) {
        nextMatch.state = 'waiting'
      }
    }

    // Update tournament in Redis
    await redis.setex(
      `${TOURNAMENT_PREFIX}${tournamentId}`,
      3600,
      JSON.stringify(tournament)
    )

    // Notify all participants
    const allParticipantEmails = tournament.participants.map(
      (p: any) => p.email
    )
    const allSocketIds: string[] = []

    for (const email of allParticipantEmails) {
      const socketIds = (await getSocketIds(email, 'sockets')) || []
      allSocketIds.push(...socketIds)
    }

    io.to(allSocketIds).emit('TournamentMatchCompleted', {
      tournamentId,
      match,
      tournament,
      winnerEmail,
      loserEmail,
      winner: match.winner,
      loser: match.loser,
      message: `${match.winner?.nickname} defeated ${match.loser?.nickname}`,
    })

    // Check if tournament is complete
    const totalRounds = Math.log2(tournament.size)
    const finalMatch = tournament.matches.find(
      (m) => m.round === totalRounds - 1
    )

    if (
      finalMatch &&
      (finalMatch.state === 'player1_win' ||
        finalMatch.state === 'player2_win') &&
      finalMatch.winner
    ) {
      // Tournament is complete
      tournament.status = 'completed'
      tournament.endedAt = Date.now()
      tournament.winner = finalMatch.winner

      await redis.setex(
        `${TOURNAMENT_PREFIX}${tournamentId}`,
        3600,
        JSON.stringify(tournament)
      )

      io.to(allSocketIds).emit('TournamentCompleted', {
        tournamentId,
        tournament,
        winnerEmail: finalMatch.winner.email,
        winner: finalMatch.winner,
        message: `Tournament completed! ${finalMatch.winner.nickname} is the champion!`,
      })
    }
  } catch (error) {
    console.error('[Tournament] Error processing match result:', error)
  }
}

export function registerTournamentMatchHandlers(socket: Socket, io: Server) {
  // Handle tournament match results (manual)
  socket.on(
    'TournamentMatchResult',
    async (data: {
      tournamentId: string
      matchId: string
      winnerEmail: string
      loserEmail: string
      playerEmail: string
    }) => {
      await processTournamentMatchResult(io, data)
    }
  )
}
