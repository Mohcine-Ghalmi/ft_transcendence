// modules/game/game.socket.disconnect.ts
import { Socket, Server } from 'socket.io'
import redis from '../../utils/redis'
import { 
  GameRoomData, 
  activeGames, 
  gameRooms,
  GameSocketHandler,
  Tournament
} from './game.socket.types'
import { cleanupGame, saveMatchHistory, emitToUsers } from './game.socket.utils'
import { getSocketIds } from '../../socket'
import { advanceTournamentRound } from './game.socket.tournament.events'

// Tournament prefix for Redis keys
const TOURNAMENT_PREFIX = 'tournament:'

// Track games that are currently being processed to prevent duplicate processing
const processingGames = new Set<string>();

export const handleGameDisconnect: GameSocketHandler = (socket, io) => {
  socket.on('disconnect', async () => {
    const userEmail = socket.data?.userEmail || (socket as any).userEmail
    if (!userEmail) return



    // Find all games this user is in
    const userGames = Array.from(activeGames.entries()).filter(([gameId, gameState]) => {
      // Check if user is in this game by looking at game room
      const gameRoom = gameRooms.get(gameId)
      return gameRoom && (gameRoom.hostEmail === userEmail || gameRoom.guestEmail === userEmail)
    })

    for (const [gameId, gameState] of userGames) {
      // Skip if already being processed
      if (processingGames.has(gameId)) continue

      const gameRoom = gameRooms.get(gameId)
      if (!gameRoom) continue

      const otherPlayerEmail = gameRoom.hostEmail === userEmail ? gameRoom.guestEmail : gameRoom.hostEmail
      
      // If game is in progress, mark the other player as winner and save to match history
      if (gameRoom.status === 'in_progress') {
        // Mark game as being processed
        processingGames.add(gameId)
        
        const winner = otherPlayerEmail
        const loser = userEmail
        
        // Get current game state for final score
        const currentGameState = activeGames.get(gameId)
        const finalScore = currentGameState?.scores || { p1: 0, p2: 0 }
        
        // Update game room with end time
        gameRoom.status = 'completed'
        gameRoom.endedAt = Date.now()
        gameRoom.winner = winner
        gameRoom.leaver = loser
        
        // Check if this is a tournament game (check for tournament properties)
        const tournamentId = (gameRoom as any).tournamentId
        const matchId = (gameRoom as any).matchId
        
        if (tournamentId && matchId) {
          try {
            // Get tournament data
            const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`)
            if (tournamentData) {
              const tournament: Tournament = JSON.parse(tournamentData)
              const match = tournament.matches.find((m: any) => m.id === matchId)
              
              if (match) {
                // Update match result - the remaining player wins
                if (match.player1?.email === winner) {
                  match.state = 'player1_win'
                  match.winner = match.player1
                } else if (match.player2?.email === winner) {
                  match.state = 'player2_win'
                  match.winner = match.player2
                }
                
                // Mark the disconnected player as eliminated
                const loserParticipant = tournament.participants.find((p: any) => p.email === loser)
                if (loserParticipant) {
                  loserParticipant.status = 'eliminated'
                }
                
                // Update winner status
                const winnerParticipant = tournament.participants.find((p: any) => p.email === winner)
                if (winnerParticipant) {
                  winnerParticipant.status = 'accepted'
                }
                
                // Check if all matches in current round are complete
                const currentRound = match.round
                const roundMatches = tournament.matches.filter((m: any) => m.round === currentRound)
                const allRoundComplete = roundMatches.every((m: any) => m.state !== 'waiting' && m.state !== 'in_progress')
                
                if (allRoundComplete) {
                  // Advance to next round
                  const updatedTournament = advanceTournamentRound(tournament)
                  await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(updatedTournament))
                  
                  // Notify all participants
                  const allParticipantEmails = updatedTournament.participants.map((p: any) => p.email)
                  const allSocketIds = []
                  
                  for (const email of allParticipantEmails) {
                    const socketIds = await getSocketIds(email, 'sockets') || []
                    allSocketIds.push(...socketIds)
                  }
                  
                  if (updatedTournament.status === 'completed') {
                    // Tournament is complete
                    const tournamentWinner = updatedTournament.participants.find((p: any) => p.status === 'winner')
                    
                    io.to(allSocketIds).emit('TournamentCompleted', {
                      tournamentId: tournamentId,
                      tournament: updatedTournament,
                      winner: tournamentWinner
                    })
                  } else {
                    // Next round started
                    io.to(allSocketIds).emit('TournamentRoundAdvanced', {
                      tournamentId: tournamentId,
                      tournament: updatedTournament,
                      nextRound: currentRound + 1
                    })
                  }
                } else {
                  // Just update the current match
                  await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament))
                }
                
                // Notify all participants about match result
                const allParticipantEmails = tournament.participants.map((p: any) => p.email)
                const allSocketIds = []
                
                for (const email of allParticipantEmails) {
                  const socketIds = await getSocketIds(email, 'sockets') || []
                  allSocketIds.push(...socketIds)
                }
                
                io.to(allSocketIds).emit('TournamentMatchCompleted', {
                  tournamentId: tournamentId,
                  matchId: matchId,
                  match,
                  tournament,
                  winnerEmail: winner,
                  loserEmail: loser,
                  reason: 'player_disconnected'
                })
              }
            }
          } catch (error) {
            console.error('[Tournament] Error handling tournament game disconnect:', error)
          }
        }
        
        // Save match history
        await saveMatchHistory(gameId, gameRoom, winner, loser, finalScore, 'player_left')
        
        // Clean up game immediately
        await cleanupGame(gameId, 'player_left')
        
        // Emit game end event to remaining player
        const otherPlayerSocketIds = await getSocketIds(otherPlayerEmail, 'sockets') || []
        io.to(otherPlayerSocketIds).emit('GameEnded', {
          gameId,
          winner,
          loser,
          finalScore,
          gameDuration: gameRoom.startedAt && gameRoom.endedAt 
            ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
            : 0,
          reason: 'player_left',
          message: 'Opponent disconnected. You win!'
        })
        
      } else if (gameRoom.status === 'accepted') {
        // Game was accepted but not started yet - mark as canceled
        // Mark game as being processed
        processingGames.add(gameId);
        
        // Update game room
        gameRoom.status = 'canceled'
        gameRoom.endedAt = Date.now()
        gameRoom.leaver = userEmail
        
        // Clean up game immediately
        await cleanupGame(gameId, 'timeout')
        
        // Notify other player
        const otherPlayerSocketIds = await getSocketIds(otherPlayerEmail, 'sockets') || []
        io.to(otherPlayerSocketIds).emit('GameEndedByOpponentLeave', {
          gameId,
          winner: otherPlayerEmail,
          leaver: userEmail,
          message: 'Opponent disconnected before the game started.'
        })
        
        // Remove from processing set after a delay
        setTimeout(() => {
          processingGames.delete(gameId);
        }, 5000);
      }
    }

    // Also check for active tournaments the user is in and handle forfeit
    try {
      const tournamentKeys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
      for (const key of tournamentKeys) {
        const tournamentData = await redis.get(key);
        if (!tournamentData) continue;
        
        const tournament = JSON.parse(tournamentData);
        
        // Check if disconnecting user is the host
        if (tournament.hostEmail === userEmail && tournament.status !== 'completed' && tournament.status !== 'canceled') {
          // Host disconnected - cancel tournament and kick all players
          tournament.status = 'canceled';
          tournament.endedAt = Date.now();
          
          const tournamentId = key.replace(TOURNAMENT_PREFIX, '');
          await redis.setex(key, 3600, JSON.stringify(tournament));
          
          // Notify all participants
          const allParticipantEmails = tournament.participants.map((p: any) => p.email);
          const allSocketIds: string[] = [];
          
          for (const email of allParticipantEmails) {
            const socketIds = await getSocketIds(email, 'sockets') || [];
            allSocketIds.push(...socketIds);
          }
          
          io.to(allSocketIds).emit('TournamentCanceled', {
            tournamentId,
            tournament,
            reason: 'Host disconnected'
          });
          
          io.to(allSocketIds).emit('RedirectToPlay', {
            message: 'Tournament canceled because host disconnected.',
            tournamentId
          });
          
          continue;
        }
        
        // Check if user is in this tournament and it's active
        const isParticipant = tournament.participants.some((p: any) => p.email === userEmail);
        
        if (isParticipant && tournament.status === 'in_progress') {
          // Handle disconnect as tournament forfeit
          const { handleTournamentPlayerForfeit } = await import('./game.socket.tournament.events');
          
          const { updatedTournament, affectedMatch, forfeitedPlayer, advancingPlayer, isAutoWin } = 
            handleTournamentPlayerForfeit(tournament, userEmail);
          
          // Save updated tournament
          const tournamentId = key.replace(TOURNAMENT_PREFIX, '');
          await redis.setex(key, 3600, JSON.stringify(updatedTournament));
          
          // Notify all tournament participants
          const allParticipantEmails = updatedTournament.participants.map((p: any) => p.email);
          const allSocketIds: string[] = [];
          
          for (const email of allParticipantEmails) {
            const socketIds = await getSocketIds(email, 'sockets') || [];
            allSocketIds.push(...socketIds);
          }
          
          if (isAutoWin) {
            // Tournament completed due to auto-win
            io.to(allSocketIds).emit('TournamentCompleted', {
              tournamentId,
              tournament: updatedTournament,
              winner: advancingPlayer,
              winnerEmail: advancingPlayer?.email,
              autoWin: true,
              message: `${advancingPlayer?.nickname} wins the tournament by default!`
            });
          } else {
            // Regular forfeit
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
    } catch (error) {
      console.error('Error handling tournament forfeit on disconnect:', error);
    }
  })
}
