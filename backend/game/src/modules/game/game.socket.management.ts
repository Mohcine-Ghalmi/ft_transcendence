import { Socket, Server } from 'socket.io'
import redis, { getSocketIds } from '../../database/redis'
import {
  activeGames,
  gameRooms,
  GameSocketHandler,
} from './game.socket.types'
import { cleanupGame, saveMatchHistory, emitToUsers } from './game.socket.utils'
import { getTournamentHostEmail } from './game.socket.tournament'
import { 
  activeGameSessions, 
  userGameSessions, 
  cleanupUserSession, 
  addUserToGameSession 
} from './game.socket.types'

const processingGames = new Set<string>()

export const handleGameManagement: GameSocketHandler = (
  socket: Socket,
  io: Server
) => {
  socket.on(
    'CheckGameSession',
    async (data: { gameId: string; playerEmail: string }) => {
      try {
        const { gameId, playerEmail } = data
  
        if (!gameId || !playerEmail) {
          return socket.emit('GameSessionResponse', {
            status: 'error',
            message: 'Missing required information.',
            canPlay: false,
          })
        }
        const socketUserEmail = (socket as any).userEmail
  
        if (!socketUserEmail || socketUserEmail !== playerEmail) {
          return socket.emit('GameSessionResponse', {
            status: 'error',
            message: 'User not authenticated.',
            canPlay: false,
          })
        }
  
        const currentGameId = userGameSessions.get(playerEmail)
        if (currentGameId && currentGameId === gameId) {
          const existingSessions = activeGameSessions.get(gameId) || new Set()
          const otherSessions = new Set([...existingSessions].filter(sid => sid !== socket.id))
          if (otherSessions.size > 0) {
            console.log(`[Session Check] User ${playerEmail} trying to join game ${gameId} but it's already being played from socket ${[...otherSessions][0]}`)
            return socket.emit('GameSessionResponse', {
              status: 'error',
              message: 'This game is already being played from another session.',
              canPlay: false,
              sessionConflict: true
            })
          }
        }
  
        if (currentGameId && currentGameId !== gameId) {
          const existingSessions = activeGameSessions.get(currentGameId) || new Set()
          if (existingSessions.size > 0) {
            console.log(`[Session Check] User ${playerEmail} trying to join game ${gameId} but already playing game ${currentGameId}`)
            return socket.emit('GameSessionResponse', {
              status: 'error',
              message: 'You are already playing another game.',
              canPlay: false,
              sessionConflict: true
            })
          }
        }
  
        console.log(`[Session Check] User ${playerEmail} can join game ${gameId} from socket ${socket.id}`)
        socket.emit('GameSessionResponse', {
          status: 'success',
          message: 'Session available.',
          canPlay: true,
        })
      } catch (error) {
        console.error('Error checking game session:', error)
        socket.emit('GameSessionResponse', {
          status: 'error',
          message: 'Failed to check game session.',
          canPlay: false,
        })
      }
    }
  )
  

  socket.on(
    'GameEnd',
    async (data: {
      gameId: string
      winner: string
      loser: string
      finalScore: { p1: number; p2: number }
      reason?: 'normal_end' | 'player_left' | 'timeout'
    }) => {
      try {
        const { gameId, finalScore, reason = 'normal_end' } = data
        const gameRoom = gameRooms.get(gameId)
        if (!gameRoom) {
          return
        }

        // Check if game is already being processed or completed
        if (processingGames.has(gameId) || gameRoom.status === 'completed') {
          return
        }

        // Additional check: verify game status in Redis
        const redisGameData = await redis.get(`game_room:${gameId}`)
        if (redisGameData) {
          const redisGameRoom = JSON.parse(redisGameData)
          if (redisGameRoom.status === 'completed') {
            return
          }
        }

        // Mark game as being processed
        processingGames.add(gameId)

        // Determine winner and loser based on score
        let winner, loser
        if (finalScore.p1 > finalScore.p2) {
          winner = gameRoom.hostEmail
          loser = gameRoom.guestEmail
        } else if (finalScore.p2 > finalScore.p1) {
          winner = gameRoom.guestEmail
          loser = gameRoom.hostEmail
        } else {
          // If tie, fallback to provided winner/loser or default to host as winner
          winner = data.winner || gameRoom.hostEmail
          loser = data.loser || gameRoom.guestEmail
        }

        // Update game room with end time
        gameRoom.status = 'completed'
        gameRoom.endedAt = Date.now()
        gameRoom.winner = winner
        gameRoom.loser = loser

        // Save match history
        await saveMatchHistory(
          gameId,
          gameRoom,
          winner,
          loser,
          finalScore,
          reason
        )

        // Handle tournament match result automatically if this is a tournament game
        if (gameRoom.tournamentId && gameRoom.matchId) {
          // Import and call tournament match handler
          const { processTournamentMatchResult } = await import(
            './game.socket.tournament.match'
          )
          await processTournamentMatchResult(io, {
            tournamentId: gameRoom.tournamentId,
            matchId: gameRoom.matchId,
            winnerEmail: winner,
            loserEmail: loser,
            playerEmail: winner, // Could be either player
          })
        }

        // Clean up game
        await cleanupGame(gameId, reason)

        // Emit game end event to both players
        await emitToUsers(
          io,
          [gameRoom.hostEmail, gameRoom.guestEmail],
          'GameEnded',
          {
            gameId,
            winner,
            loser,
            finalScore,
            gameDuration:
              gameRoom.startedAt && gameRoom.endedAt
                ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
                : 0,
            reason,
            message:
              reason === 'normal_end'
                ? 'Game completed!'
                : 'Game ended due to player leaving.',
            // Add tournament information if this is a tournament game
            tournamentId: gameRoom.tournamentId,
            isTournament: !!gameRoom.tournamentId,
            tournamentHostEmail: gameRoom.tournamentId
              ? await getTournamentHostEmail(gameRoom.tournamentId)
              : null,
          }
        )

        // Remove from processing set after a delay to ensure cleanup is complete
        setTimeout(() => {
          processingGames.delete(gameId)
        }, 5000)
      } catch (error) {
        console.error('Error in GameEnd handler:', error)
        // Remove from processing set on error
        processingGames.delete(data.gameId)
      }
    }
  )

  // Handle player leaving game
  socket.on(
    'LeaveGame',
    async (data: { gameId: string; playerEmail: string }) => {
      try {
        const { gameId, playerEmail } = data
        if (!gameId || !playerEmail) {
          return socket.emit('GameResponse', {
            status: 'error',
            message: 'Missing required information.',
          })
        }

        const gameRoom = gameRooms.get(gameId)
        if (!gameRoom) {
          return socket.emit('GameResponse', {
            status: 'error',
            message: 'Game room not found.',
          })
        }

        // Check if game is already being processed or completed
        if (processingGames.has(gameId) || gameRoom.status === 'completed') {
          return socket.emit('GameResponse', {
            status: 'success',
            message: 'Game already ended.',
          })
        }

        // Additional check: verify game status in Redis
        const redisGameData = await redis.get(`game_room:${gameId}`)
        if (redisGameData) {
          const redisGameRoom = JSON.parse(redisGameData)
          if (redisGameRoom.status === 'completed') {
            return socket.emit('GameResponse', {
              status: 'success',
              message: 'Game already ended.',
            })
          }
        }

        // Mark game as being processed
        processingGames.add(gameId)

        // Get current game state for final score
        const currentGameState = activeGames.get(gameId)
        const finalScore = currentGameState?.scores || { p1: 0, p2: 0 }

        // Determine winner and loser
        const otherPlayerEmail =
          gameRoom.hostEmail === playerEmail
            ? gameRoom.guestEmail
            : gameRoom.hostEmail
        const winner = otherPlayerEmail
        const loser = playerEmail

        // Update game room with end time
        gameRoom.status = 'completed'
        gameRoom.endedAt = Date.now()
        gameRoom.winner = winner
        gameRoom.leaver = loser

        // Save match history
        await saveMatchHistory(
          gameId,
          gameRoom,
          winner,
          loser,
          finalScore,
          'player_left'
        )

        // Handle tournament match result automatically if this is a tournament game
        if (gameRoom.tournamentId && gameRoom.matchId) {
          // Import and call tournament match handler
          const { processTournamentMatchResult } = await import(
            './game.socket.tournament.match'
          )
          await processTournamentMatchResult(io, {
            tournamentId: gameRoom.tournamentId,
            matchId: gameRoom.matchId,
            winnerEmail: winner,
            loserEmail: loser,
            playerEmail: winner, // Could be either player
          })

          // Also handle forfeit logic specifically for tournaments
          const { handleTournamentPlayerForfeit } = await import(
            './game.socket.tournament.events'
          )

          try {
            const tournamentData = await redis.get(
              `tournament:${gameRoom.tournamentId}`
            )
            if (tournamentData) {
              const tournament = JSON.parse(tournamentData)
              const {
                updatedTournament,
                affectedMatch,
                forfeitedPlayer,
                advancingPlayer,
              } = handleTournamentPlayerForfeit(tournament, loser)

              // Save updated tournament
              await redis.setex(
                `tournament:${gameRoom.tournamentId}`,
                3600,
                JSON.stringify(updatedTournament)
              )

              // Notify all tournament participants about the forfeit
              const allParticipantEmails = updatedTournament.participants.map(
                (p: any) => p.email
              )
              const allSocketIds: string[] = []

              for (const email of allParticipantEmails) {
                const socketIds = (await getSocketIds(email, 'sockets')) || []
                allSocketIds.push(...socketIds)
              }

              io.to(allSocketIds).emit('TournamentPlayerForfeited', {
                tournamentId: gameRoom.tournamentId,
                forfeitedPlayer,
                advancingPlayer,
                affectedMatch,
                tournament: updatedTournament,
                message: `${forfeitedPlayer?.nickname} has forfeited. ${advancingPlayer?.nickname} advances to the next round.`,
              })
            }
          } catch (error) {
            console.error('Error handling tournament forfeit:', error)
          }
        }

        // Clean up game
        await cleanupGame(gameId, 'player_left')

        // Emit game end event to both players
        await emitToUsers(
          io,
          [gameRoom.hostEmail, gameRoom.guestEmail],
          'GameEnded',
          {
            gameId,
            winner,
            loser,
            finalScore,
            gameDuration:
              gameRoom.startedAt && gameRoom.endedAt
                ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
                : 0,
            reason: 'player_left',
            message: 'Opponent left the game. You win!',
            // Add tournament information if this is a tournament game
            tournamentId: gameRoom.tournamentId,
            isTournament: !!gameRoom.tournamentId,
            tournamentHostEmail: gameRoom.tournamentId
              ? await getTournamentHostEmail(gameRoom.tournamentId)
              : null,
          }
        )

        // Notify the other player specifically
        const otherPlayerSocketIds =
          (await getSocketIds(otherPlayerEmail, 'sockets')) || []
        io.to(otherPlayerSocketIds).emit('PlayerLeft', {
          gameId,
          playerWhoLeft: playerEmail,
          reason: 'player_left',
          // Add tournament information if this is a tournament game
          tournamentId: gameRoom.tournamentId,
          isTournamentMatch: !!gameRoom.tournamentId,
          tournamentHostEmail: gameRoom.tournamentId
            ? await getTournamentHostEmail(gameRoom.tournamentId)
            : null,
        })

        socket.emit('GameResponse', {
          status: 'success',
          message: 'Left game successfully.',
        })

        // Remove from processing set after a delay
        setTimeout(() => {
          processingGames.delete(gameId)
        }, 5000)
      } catch (error) {
        console.error('Error in LeaveGame handler:', error)
        socket.emit('GameResponse', {
          status: 'error',
          message: 'Failed to leave game.',
        })
        // Remove from processing set on error
        processingGames.delete(data.gameId)
      }
    }
  )

  // Handle canceling accepted games
  socket.on('CancelGame', async (data: { gameId: string }) => {
    try {
      const { gameId } = data

      if (!gameId) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Missing game ID.',
        })
      }

      const gameRoom = gameRooms.get(gameId)
      if (!gameRoom) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Game room not found.',
        })
      }

      // Check if game is already being processed
      if (processingGames.has(gameId)) {
        return socket.emit('GameResponse', {
          status: 'success',
          message: 'Game already being canceled.',
        })
      }

      // Mark game as being processed
      processingGames.add(gameId)

      // Clean up game
      await cleanupGame(gameId, 'timeout')

      // Notify both players
      await emitToUsers(
        io,
        [gameRoom.hostEmail, gameRoom.guestEmail],
        'GameCanceled',
        {
          gameId,
          canceledBy: socket.id,
        }
      )

      socket.emit('GameResponse', {
        status: 'success',
        message: 'Game canceled successfully.',
      })

      // Remove from processing set after a delay
      setTimeout(() => {
        processingGames.delete(gameId)
      }, 5000)
    } catch (error) {
      socket.emit('GameResponse', {
        status: 'error',
        message: 'Failed to cancel game.',
      })
      // Remove from processing set on error
      processingGames.delete(data.gameId)
    }
  })

  // Handle checking game authorization
  socket.on(
    'CheckGameAuthorization',
    async (data: { gameId: string; playerEmail: string }) => {
      try {
        const { gameId, playerEmail } = data
  
        if (!gameId || !playerEmail) {
          return socket.emit('GameAuthorizationResponse', {
            status: 'error',
            message: 'Missing required information.',
            authorized: false,
          })
        }
  
        // Get user email from socket data to verify
        const socketUserEmail = (socket as any).userEmail
  
        if (!socketUserEmail || socketUserEmail !== playerEmail) {
          return socket.emit('GameAuthorizationResponse', {
            status: 'error',
            message: 'User not authenticated or email mismatch.',
            authorized: false,
          })
        }
  
        // FIXED: Check for existing sessions more carefully
        const currentGameId = userGameSessions.get(playerEmail)
        if (currentGameId && currentGameId === gameId) {
          const existingSessions = activeGameSessions.get(gameId) || new Set()
          // Only block if there are OTHER sessions (not this one)
          const otherSessions = new Set([...existingSessions].filter(sid => sid !== socket.id))
          if (otherSessions.size > 0) {
            console.log(`[Authorization] User ${playerEmail} blocked - game ${gameId} already being played from socket ${[...otherSessions][0]}`)
            return socket.emit('GameAuthorizationResponse', {
              status: 'error',
              message: 'This game is already being played from another session.',
              authorized: false,
              sessionConflict: true,
            })
          }
        }
  
        // Check if user is already in a DIFFERENT active game
        if (currentGameId && currentGameId !== gameId) {
          const existingSessions = activeGameSessions.get(currentGameId) || new Set()
          if (existingSessions.size > 0) {
            console.log(`[Authorization] User ${playerEmail} blocked - already playing game ${currentGameId}`)
            return socket.emit('GameAuthorizationResponse', {
              status: 'error',
              message: 'You are already playing another game.',
              authorized: false,
              sessionConflict: true,
            })
          }
        }
  
        // Continue with rest of authorization logic...
        const gameRoom = gameRooms.get(gameId)
        if (!gameRoom) {
          return socket.emit('GameAuthorizationResponse', {
            status: 'error',
            message: 'Game room not found.',
            authorized: false,
          })
        }
  
        // Check if game is already in progress
        if (gameRoom.status === 'in_progress') {
          // For tournament games, automatically accept if in progress
          if (gameRoom.tournamentId) {
            const gameState = activeGames.get(gameId)
            if (!gameState) {
              console.error(`No game state found for tournament game ${gameId}`)
              return socket.emit('GameAuthorizationResponse', {
                status: 'error',
                message: 'Game state not found.',
                authorized: false,
              })
            }
  
            // ADD USER TO GAME SESSION
            addUserToGameSession(playerEmail, gameId, socket.id)
            console.log(`[Authorization] Added user ${playerEmail} to tournament game ${gameId} from socket ${socket.id}`)
  
            socket.emit('GameAuthorizationResponse', {
              status: 'success',
              authorized: true,
              isHost: gameRoom.hostEmail === playerEmail,
              gameRoom: gameRoom,
              gameStatus: gameState.gameStatus,
              gameState: gameState,
              isTournament: true,
              tournamentId: gameRoom.tournamentId,
              matchId: gameRoom.matchId,
            })
  
            socket.join(`game:${gameId}`)
            return
          }
  
          // For regular games, check if user is part of the game
          if (
            gameRoom.hostEmail !== playerEmail &&
            gameRoom.guestEmail !== playerEmail
          ) {
            console.error(`User ${playerEmail} not authorized for game ${gameId}`)
            return socket.emit('GameAuthorizationResponse', {
              status: 'error',
              message: 'You are not authorized for this game.',
              authorized: false,
            })
          }
  
          const gameState = activeGames.get(gameId)
          if (!gameState) {
            console.error(`No game state found for game ${gameId}`)
            return socket.emit('GameAuthorizationResponse', {
              status: 'error',
              message: 'Game state not found.',
              authorized: false,
            })
          }
  
          // ADD USER TO GAME SESSION
          addUserToGameSession(playerEmail, gameId, socket.id)
          console.log(`[Authorization] Added user ${playerEmail} to regular game ${gameId} from socket ${socket.id}`)
  
          socket.emit('GameAuthorizationResponse', {
            status: 'success',
            authorized: true,
            isHost: gameRoom.hostEmail === playerEmail,
            gameRoom: gameRoom,
            gameStatus: gameState.gameStatus,
            gameState: gameState,
          })
  
          socket.join(`game:${gameId}`)
          return
        }
  
        // Check if game room is in a valid state
        if (gameRoom.status === 'canceled' || gameRoom.status === 'completed') {
          return socket.emit('GameAuthorizationResponse', {
            status: 'error',
            message: 'Game is no longer active.',
            authorized: false,
          })
        }
  
        // Check if user is part of this game (host or guest)
        const isAuthorized =
          gameRoom.hostEmail === playerEmail ||
          gameRoom.guestEmail === playerEmail
  
        if (isAuthorized) {
          // For tournament games, automatically accept and start the game
          if (gameRoom.tournamentId) {
            if (gameRoom.status === 'waiting') {
              gameRoom.status = 'accepted'
              await redis.setex(
                `game_room:${gameId}`,
                3600,
                JSON.stringify(gameRoom)
              )
              gameRooms.set(gameId, gameRoom)
            }
          }
          
          // ADD USER TO GAME SESSION
          addUserToGameSession(playerEmail, gameId, socket.id)
          console.log(`[Authorization] Added authorized user ${playerEmail} to game ${gameId} from socket ${socket.id}`)
        }
  
        socket.emit('GameAuthorizationResponse', {
          status: 'success',
          message: isAuthorized
            ? 'User authorized for this game.'
            : 'User not authorized for this game.',
          authorized: isAuthorized,
          gameStatus: gameRoom.status,
          isHost: gameRoom.hostEmail === playerEmail,
          gameRoom: gameRoom,
        })
      } catch (error) {
        console.error('Error checking game authorization:', error)
        socket.emit('GameAuthorizationResponse', {
          status: 'error',
          message: 'Failed to check game authorization.',
          authorized: false,
        })
      }
    }
  ) 
}
