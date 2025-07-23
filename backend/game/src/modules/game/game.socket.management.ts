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
  addUserToGameSession,
  reconnectUserToGameSession,
  socketToUser,
  hasActiveSockets,
  getUserCurrentGame,
  checkGameSessionConflict,
  forceCleanupUserFromAllGames
} from './game.socket.types'

const processingGames = new Set<string>()

export const handleGameManagement: GameSocketHandler = (
  socket: Socket,
  io: Server
) => {
  socket.on('connect', async () => {
    const userEmail = (socket as any).userEmail;
    if (userEmail) {
      const currentGameId = getUserCurrentGame(userEmail);
      if (currentGameId) {
        const gameRoom = gameRooms.get(currentGameId);
        
        if (gameRoom && (gameRoom.status === 'in_progress' || gameRoom.status === 'accepted')) {
          // Check for session conflicts before reconnecting
          const conflict = checkGameSessionConflict(userEmail, currentGameId, socket.id);
          
          if (conflict.hasConflict && conflict.conflictType === 'same_game_different_session') {
            // User has another active session for the same game
            socket.emit('GameSessionConflict', {
              type: 'same_game_multiple_sessions',
              gameId: currentGameId,
              message: 'This game is already being played from another session.',
              action: 'redirect_to_play'
            });
            return;
          }
          
          if (reconnectUserToGameSession(userEmail, currentGameId, socket.id)) {
            const gameState = activeGames.get(currentGameId);
            if (gameState) {
              socket.emit('GameStateUpdate', {
                gameId: currentGameId,
                gameState: gameState
              });
            }
            
            const otherPlayerEmail = gameRoom.hostEmail === userEmail 
              ? gameRoom.guestEmail 
              : gameRoom.hostEmail;
            
            const otherPlayerSockets = await getSocketIds(otherPlayerEmail, 'sockets') || [];
            io.to(otherPlayerSockets).emit('PlayerReconnected', {
              gameId: currentGameId,
              reconnectedPlayer: userEmail,
              message: 'Your opponent has reconnected!'
            });
          }
        }
      }
    }
  });

  // Enhanced session checking with better conflict resolution
  socket.on('CheckGameSession', async (data: { gameId: string; playerEmail: string }) => {
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

      // Map socket to user for tracking
      socketToUser.set(socket.id, playerEmail);

      // Check for session conflicts
      const conflict = checkGameSessionConflict(playerEmail, gameId, socket.id);
      
      if (conflict.hasConflict) {
        if (conflict.conflictType === 'same_game_different_session') {
          return socket.emit('GameSessionResponse', {
            status: 'error',
            message: 'This game is already being played from another session.',
            canPlay: false,
            sessionConflict: true,
            conflictType: 'same_game_different_session'
          })
        } else if (conflict.conflictType === 'different_game') {
          // Force cleanup from other games
          const cleanedGames = forceCleanupUserFromAllGames(playerEmail);
          
          // Allow the session after cleanup
        }
      }
  
      socket.emit('GameSessionResponse', {
        status: 'success',
        message: 'Session available.',
        canPlay: true,
      })
    } catch (error) {
      socket.emit('GameSessionResponse', {
        status: 'error',
        message: 'Failed to check game session.',
        canPlay: false,
      })
    }
  })

  // Enhanced game authorization with better session handling
  socket.on('CheckGameAuthorization', async (data: { gameId: string; playerEmail: string }) => {
    try {
      const { gameId, playerEmail } = data
  
      if (!gameId || !playerEmail) {
        return socket.emit('GameAuthorizationResponse', {
          status: 'error',
          message: 'Missing required information.',
          authorized: false,
        })
      }
  
      const socketUserEmail = (socket as any).userEmail
  
      if (!socketUserEmail || socketUserEmail !== playerEmail) {
        return socket.emit('GameAuthorizationResponse', {
          status: 'error',
          message: 'User not authenticated or email mismatch.',
          authorized: false,
        })
      }

      // Map socket to user for tracking
      socketToUser.set(socket.id, playerEmail);

      // Check for session conflicts
      const conflict = checkGameSessionConflict(playerEmail, gameId, socket.id);
      
      if (conflict.hasConflict) {
        if (conflict.conflictType === 'same_game_different_session') {
          // Check if other sessions are still active
          const gameSessions = activeGameSessions.get(gameId) || new Set();
          const otherSessions = new Set([...gameSessions].filter(sid => sid !== socket.id));
          
          let hasActiveOtherSessions = false;
          for (const sessionId of otherSessions) {
            const sessionUser = socketToUser.get(sessionId);
            if (sessionUser === playerEmail) {
              const userSockets = await getSocketIds(playerEmail, 'sockets') || [];
              if (userSockets.includes(sessionId)) {
                hasActiveOtherSessions = true;
                break;
              }
            }
          }
          
          if (hasActiveOtherSessions) {
            return socket.emit('GameAuthorizationResponse', {
              status: 'error',
              message: 'This game is already being played from another session.',
              authorized: false,
              sessionConflict: true,
              conflictType: 'same_game_different_session'
            })
          }
        } else if (conflict.conflictType === 'different_game') {
          // Force cleanup from other games and allow this one
          const cleanedGames = forceCleanupUserFromAllGames(playerEmail);
        }
      }
  
      const gameRoom = gameRooms.get(gameId)
      if (!gameRoom) {
        return socket.emit('GameAuthorizationResponse', {
          status: 'error',
          message: 'Game room not found.',
          authorized: false,
        })
      }
  
      // Check if game is already in progress - support reconnection
      if (gameRoom.status === 'in_progress') {
        // Check if user is part of the game
        if (
          gameRoom.hostEmail !== playerEmail &&
          gameRoom.guestEmail !== playerEmail
        ) {
          return socket.emit('GameAuthorizationResponse', {
            status: 'error',
            message: 'You are not authorized for this game.',
            authorized: false,
          })
        }

        const gameState = activeGames.get(gameId)
        if (!gameState) {
          return socket.emit('GameAuthorizationResponse', {
            status: 'error',
            message: 'Game state not found.',
            authorized: false,
          })
        }

        // Add user to game session (reconnection)
        addUserToGameSession(playerEmail, gameId, socket.id)

        // Notify other player about reconnection
        const otherPlayerEmail = gameRoom.hostEmail === playerEmail 
          ? gameRoom.guestEmail 
          : gameRoom.hostEmail;
        
        const otherPlayerSockets = await getSocketIds(otherPlayerEmail, 'sockets') || [];
        if (otherPlayerSockets.length > 0) {
          io.to(otherPlayerSockets).emit('PlayerReconnected', {
            gameId: gameId,
            reconnectedPlayer: playerEmail,
            message: 'Your opponent has reconnected!'
          });
        }

        socket.emit('GameAuthorizationResponse', {
          status: 'success',
          authorized: true,
          isHost: gameRoom.hostEmail === playerEmail,
          gameRoom: gameRoom,
          gameStatus: gameState.gameStatus,
          gameState: gameState,
          isTournament: !!gameRoom.tournamentId,
          tournamentId: gameRoom.tournamentId,
          matchId: gameRoom.matchId,
          reconnected: true
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
        
        // Add user to game session
        addUserToGameSession(playerEmail, gameId, socket.id)
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
        isTournament: !!gameRoom.tournamentId,
        tournamentId: gameRoom.tournamentId,
        matchId: gameRoom.matchId,
      })
    } catch (error) {
      socket.emit('GameAuthorizationResponse', {
        status: 'error',
        message: 'Failed to check game authorization.',
        authorized: false,
      })
    }
  })

  // Game end handler
  socket.on('GameEnd', async (data: {
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
        const { processTournamentMatchResult } = await import(
          './game.socket.tournament.match'
        )
        await processTournamentMatchResult(io, {
          tournamentId: gameRoom.tournamentId,
          matchId: gameRoom.matchId,
          winnerEmail: winner,
          loserEmail: loser,
          playerEmail: winner,
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
          tournamentId: gameRoom.tournamentId,
          isTournament: !!gameRoom.tournamentId,
          tournamentHostEmail: gameRoom.tournamentId
            ? await getTournamentHostEmail(gameRoom.tournamentId)
            : null,
        }
      )

      // Remove from processing set after a delay
      setTimeout(() => {
        processingGames.delete(gameId)
      }, 5000)
    } catch (error) {
      processingGames.delete(data.gameId)
    }
  })

  // Handle player leaving game
  socket.on('LeaveGame', async (data: { gameId: string; playerEmail: string }) => {
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
        const { processTournamentMatchResult } = await import(
          './game.socket.tournament.match'
        )
        await processTournamentMatchResult(io, {
          tournamentId: gameRoom.tournamentId,
          matchId: gameRoom.matchId,
          winnerEmail: winner,
          loserEmail: loser,
          playerEmail: winner,
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
      socket.emit('GameResponse', {
        status: 'error',
        message: 'Failed to leave game.',
      })
      processingGames.delete(data.gameId)
    }
  })

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
      processingGames.delete(data.gameId)
    }
  })

  // Add heartbeat handler to keep sessions alive during gameplay
  socket.on('gameHeartbeat', (data: { gameId: string; playerEmail: string }) => {
    const { gameId, playerEmail } = data;
    
    if (gameId && playerEmail) {
      // Update session tracking
      const currentGameId = getUserCurrentGame(playerEmail);
      if (currentGameId === gameId) {
        addUserToGameSession(playerEmail, gameId, socket.id);
      }
    }
  });

  // Add session conflict notification handler
  socket.on('ResolveSessionConflict', async (data: { 
    action: 'force_takeover' | 'cancel' | 'cleanup_others';
    gameId: string;
    playerEmail: string;
  }) => {
    try {
      const { action, gameId, playerEmail } = data;
      
      if (action === 'force_takeover') {
        // Force cleanup other sessions and take over
        const cleanedGames = forceCleanupUserFromAllGames(playerEmail);
        addUserToGameSession(playerEmail, gameId, socket.id);
        
        socket.emit('SessionConflictResolved', {
          status: 'success',
          action: 'takeover_completed',
          message: 'Took over the game session.'
        });
      } else if (action === 'cleanup_others') {
        // Clean up other sessions but keep this one
        const gameSessions = activeGameSessions.get(gameId);
        if (gameSessions) {
          const userSocketIds = await getSocketIds(playerEmail, 'sockets') || [];
          for (const sessionId of [...gameSessions]) {
            const sessionUser = socketToUser.get(sessionId);
            if (sessionUser === playerEmail && sessionId !== socket.id) {
              gameSessions.delete(sessionId);
              socketToUser.delete(sessionId);
            }
          }
        }
        
        addUserToGameSession(playerEmail, gameId, socket.id);
        
        socket.emit('SessionConflictResolved', {
          status: 'success',
          action: 'cleanup_completed',
          message: 'Cleaned up other sessions.'
        });
      } else {
        // Cancel and redirect
        socket.emit('SessionConflictResolved', {
          status: 'cancelled',
          action: 'redirect_to_play',
          message: 'Session conflict cancelled.'
        });
      }
    } catch (error) {
      socket.emit('SessionConflictResolved', {
        status: 'error',
        message: 'Failed to resolve session conflict.'
      });
    }
  });
}