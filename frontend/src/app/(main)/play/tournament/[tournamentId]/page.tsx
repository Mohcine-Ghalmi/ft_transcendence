"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { useTournamentInvite } from '../TournamentInviteProvider'
import Image from 'next/image'
import TournamentBracket from '../TournamentBracket'
import { MATCH_STATES } from '../../../../../data/mockData'

export default function TournamentGamePage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.tournamentId as string
  const { user } = useAuthStore()
  const { socket } = useTournamentInvite()
  
  const [tournamentData, setTournamentData] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authorizationChecked, setAuthorizationChecked] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

  useEffect(() => {
    if (!socket || !tournamentId || !user?.email) return;

    // First, try to get tournament data to check if it's completed
    socket.emit('GetTournamentData', { 
      tournamentId, 
      playerEmail: user.email 
    })

    // Also emit JoinTournament for live tournaments
    socket.emit('JoinTournament', { 
      tournamentId, 
      playerEmail: user.email 
    })
    
    // Set a timeout for authorization check - increased for completed tournaments
    const authTimeout = setTimeout(() => {
      if (!authorizationChecked) {
        setIsAuthorized(false)
        setAuthorizationChecked(true)
        router.push('/play')
      }
    }, 8000) // Increased to 8 seconds for completed tournament data

    return () => {
      clearTimeout(authTimeout)
    }
  }, [socket, tournamentId, user?.email, authorizationChecked, router])

  // Add socket connection monitoring
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      if (tournamentId && user?.email) {
        socket.emit('JoinTournament', { 
          tournamentId, 
          playerEmail: user.email 
        });
      }
    };

    const handleReconnect = () => {
      if (tournamentId && user?.email) {
        socket.emit('JoinTournament', { 
          tournamentId, 
          playerEmail: user.email 
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('reconnect', handleReconnect);
    };
  }, [socket, tournamentId, user?.email]);

  useEffect(() => {
    if (!socket || !tournamentId) return

    const handleTournamentJoinResponse = (data: any) => {
      setAuthorizationChecked(true)
      if (data.status === 'success') {
        setIsAuthorized(true)
        setTournamentData(data.tournament)
        setIsHost(data.tournament.hostEmail === user?.email)
        
      } else {
        if (data.message && data.message.includes('completed')) {
          setIsAuthorized(true)
          if (data.tournament) {
            setTournamentData(data.tournament)
            setIsHost(data.tournament.hostEmail === user?.email)
          }
        } else {
          setIsAuthorized(false)
          router.push('/play')
        }
      }
    }

    // Handle tournament data response (for completed tournaments)
    const handleTournamentDataResponse = (data: any) => {
      setAuthorizationChecked(true)
      if (data.status === 'success' && data.tournament) {
        setIsAuthorized(true)
        setTournamentData(data.tournament)
        setIsHost(data.tournament.hostEmail === user?.email)
        
        // Show notification for completed tournaments
        if (data.tournament.status === 'completed') {
          setNotification({ 
            message: '🏆 This tournament has been completed. Viewing final results.', 
            type: 'info' 
          })
          setTimeout(() => setNotification(null), 5000)
        }
      } else if (!isAuthorized) {
        // Only redirect if we haven't been authorized yet
        setIsAuthorized(false)
        router.push('/play')
      }
    }

    const handleTournamentUpdated = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
      }
    }

    const handleTournamentPlayerJoined = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        // Show notification that someone joined the tournament room
        const playerName = data.joinedPlayer?.nickname || data.joinedPlayer?.login || 'A player'
        const joinMessage = `🎮 ${playerName} joined the tournament room!`
        
        setNotification({ 
          message: joinMessage, 
          type: 'success' 
        })
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentInviteAccepted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        // Immediately update host's lobby and bracket
        if (data.tournament.hostEmail === user?.email) {
          setIsHost(true)
        }
        // Show notification that someone accepted invitation
        const playerName = data.newParticipant?.nickname || data.newParticipant?.login || data.inviteeEmail
        const joinMessage = `🎮 ${playerName} accepted the invitation and joined!`
        setNotification({ 
          message: joinMessage, 
          type: 'success' 
        })
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentStarted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        // Show notification to all participants
        const notificationMessage = '🎯 Tournament has started! The bracket is now visible to all participants.'
        setNotification({
          type: 'success',
          message: notificationMessage
        });
        
        // Clear notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000)
        
      } else {
        // Tournament ID mismatch, ignoring event
      }
    }

    const handleTournamentMatchCompleted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        // Update tournament data
        if (data.tournament) {
          setTournamentData(data.tournament)
        }
        
        // Show notification about match result
        if (data.reason === 'player_disconnected') {
          setNotification({ 
            message: 'A player disconnected in the tournament match.', 
            type: 'info' 
          })
        } else {
          const winnerName = data.winnerEmail === user?.email ? 'You' : 
            (data.tournament?.participants.find((p: any) => p.email === data.winnerEmail)?.nickname || 'Unknown')
          const loserName = data.loserEmail === user?.email ? 'You' : 
            (data.tournament?.participants.find((p: any) => p.email === data.loserEmail)?.nickname || 'Unknown')
          
          if (data.winnerEmail === user?.email) {
            setNotification({ 
              message: `Congratulations! You won against ${loserName}!`, 
              type: 'success' 
            })
          } else if (data.loserEmail === user?.email) {
            setNotification({ 
              message: `You lost against ${winnerName}. Better luck next time!`, 
              type: 'info' 
            })
          } else {
            setNotification({ 
              message: `${winnerName} won against ${loserName}`, 
              type: 'info' 
            })
          }
        }
        
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000)
      }
    }

    const handleTournamentCompleted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        // Show notification about tournament completion
        if (data.winnerEmail === user?.email) {
          setNotification({ 
            message: '🎉 Congratulations! You won the tournament!', 
            type: 'success' 
          })
        } else {
          const winnerName = data.tournament?.participants.find((p: any) => p.email === data.winnerEmail)?.nickname || 'Unknown'
          setNotification({ 
            message: `Tournament completed! ${winnerName} is the winner!`, 
            type: 'info' 
          })
        }
        
        // Clear notification after 10 seconds
        setTimeout(() => setNotification(null), 10000)
      }
    }

    const handleTournamentParticipantLeft = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        // Show notification about participant leaving
        const participantName = data.participant?.nickname || data.participantEmail
        setNotification({ 
          message: `${participantName} left the tournament.`, 
          type: 'info' 
        })
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentCancelled = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setNotification({
          type: 'error',
          message: data.message || `Tournament "${data.tournamentName}" has been cancelled by the host.`
        });
        
        // Redirect to play page after a short delay
        setTimeout(() => {
          router.push('/play');
        }, 3000);
      }
    }

    const handleRedirectToPlay = (data: any) => {
      setNotification({
        type: 'error',
        message: data.message || 'Redirecting to play page...'
      });
      
      // Redirect to play page
      setTimeout(() => {
        router.push('/play');
      }, 2000);
    }

    const handleTournamentMatchGameStarted = (data: any) => {
      if (data.tournamentId === tournamentId && 
          (data.hostEmail === user?.email || data.guestEmail === user?.email)) {
        // Show notification that match is starting
        const opponentEmail = data.hostEmail === user?.email ? data.guestEmail : data.hostEmail;
        const opponentData = data.hostEmail === user?.email ? data.guestData : data.hostData;
        const opponentName = opponentData?.nickname || opponentData?.login || opponentEmail || 'your opponent';
        
        // Determine player position for tournament consistency
        const isPlayer1 = data.hostEmail === user?.email;
        const positionText = isPlayer1 ? 'Player 1 (Left)' : 'Player 2 (Right)';
        
        setNotification({ 
          message: `🎮 Your tournament match against ${opponentName} is starting! You are ${positionText}. Redirecting to game room...`, 
          type: 'success' 
        });

        // Redirect to the game room with position info
        setTimeout(() => {
          router.push(`/play/game/${data.gameId}?tournament=true&position=${isPlayer1 ? 'player1' : 'player2'}`);
        }, 1500);
      }
    }

    const handleTournamentNextMatchReady = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        // Show notification about next match
        if (data.nextMatch) {
          const isInNextMatch = data.nextMatch.player1?.email === user?.email || 
                               data.nextMatch.player2?.email === user?.email
          
          if (isInNextMatch) {
            const otherPlayer = data.nextMatch.player1?.email === user?.email ? 
              data.nextMatch.player2 : data.nextMatch.player1
            const opponentName = otherPlayer?.nickname || otherPlayer?.login || 'your opponent'
            setNotification({ 
              message: `🎯 Your next tournament match against ${opponentName} is ready!`, 
              type: 'success' 
            })
            setTimeout(() => setNotification(null), 5000)
          }
        }
      }
    }

    const handleStartCurrentRoundResponse = (data: any) => {
      if (data.status === 'success') {
        setNotification({
          type: 'success',
          message: data.message || '⚔️ Current round started! All matches are now active.'
        });
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to start current round.'
        });
      }
    };

    const handleTournamentStartResponse = (data: any) => {
      setIsStartingGame(false);
      
      if (data.status === 'success') {
        setNotification({
          type: 'success',
          message: '🎯 Tournament started successfully! The bracket is now visible to all participants.'
        });
      } else {
        setNotification({
          type: 'error',
          message: data.message
        });
      }
    };

    const handleTournamentCancelResponse = (data: any) => {
      if (data.status === 'success') {
        setNotification({ message: 'Tournament canceled successfully.', type: 'success' });
      } else {
        setNotification({ message: data.message || 'Failed to cancel tournament.', type: 'error' });
      }
    };

    const handleGameFound = (data: any) => {
      const gameId = data.gameId || data.gameRoomId; // Support both field names for compatibility
      if (gameId) {
        setNotification({
          type: 'success',
          message: `🎮 Your match is starting! Redirecting to game...`
        });
        
        // Redirect to the game room
        setTimeout(() => {
          router.push(`/play/game/${gameId}`);
        }, 1500);
      }
    };

    const handleGameStarting = (data: any) => {
      const gameId = data.gameId || data.gameRoomId; // Support both field names for compatibility
      if (gameId) {
        setNotification({
          type: 'success',
          message: `🎮 Your tournament match is starting! Redirecting to game...`
        });
        
        // Redirect to the game room immediately for tournament matches
        router.push(`/play/game/${gameId}`);
      }
    };

    const handleTournamentRoundStarted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        // Update tournament data
        if (data.tournament) {
          setTournamentData(data.tournament);
        }
        
        // Show notification about round start
        setNotification({
          type: 'success',
          message: data.message || `⚔️ Round ${data.round + 1} has started!`
        });
        
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }
    };

    const handleTournamentPlayerForfeited = (data: any) => {
      if (data.tournamentId === tournamentId) {
        // Update tournament data
        if (data.tournament) {
          setTournamentData(data.tournament)
        }
        
        // Show notification about the forfeit
        const forfeitedPlayerName = data.forfeitedPlayer?.nickname || 'A player'
        const advancingPlayerName = data.advancingPlayer?.nickname || 'opponent'
        
        if (data.forfeitedPlayer?.email === user?.email) {
          setNotification({
            message: '❌ You have forfeited the tournament match.',
            type: 'error'
          })
        } else if (data.advancingPlayer?.email === user?.email) {
          setNotification({
            message: `🎉 Your opponent ${forfeitedPlayerName} forfeited. You advance to the next round!`,
            type: 'success'
          })
        } else {
          setNotification({
            message: `⚠️ ${forfeitedPlayerName} forfeited. ${advancingPlayerName} advances to the next round.`,
            type: 'info'
          })
        }
        
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000)
      }
    }

    const handleTournamentLeaveResponse = (data: any) => {
      if (data.status === 'success') {
        setNotification({
          type: 'success',
          message: data.message || 'Left tournament successfully'
        });
        
        // Redirect to play page after leaving
        setTimeout(() => {
          router.push('/play');
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to leave tournament'
        });
      }
      
      setTimeout(() => setNotification(null), 2000);
    };

    // Register all event listeners
    socket.on('TournamentJoinResponse', handleTournamentJoinResponse)
    socket.on('TournamentDataResponse', handleTournamentDataResponse)
    socket.on('TournamentPlayerJoined', handleTournamentPlayerJoined)
    socket.on('TournamentUpdated', handleTournamentUpdated)
    socket.on('TournamentInviteAccepted', handleTournamentInviteAccepted)
    socket.on('TournamentStarted', handleTournamentStarted)
    socket.on('TournamentMatchCompleted', handleTournamentMatchCompleted)
    socket.on('TournamentCompleted', handleTournamentCompleted)
    socket.on('TournamentParticipantLeft', handleTournamentParticipantLeft)
    socket.on('TournamentCancelled', handleTournamentCancelled)
    socket.on('RedirectToPlay', handleRedirectToPlay)
    socket.on('TournamentNextMatchReady', handleTournamentNextMatchReady)
    socket.on('StartCurrentRoundResponse', handleStartCurrentRoundResponse)
    socket.on('TournamentStartResponse', handleTournamentStartResponse)
    socket.on('TournamentCancelResponse', handleTournamentCancelResponse)
    socket.on('GameFound', handleGameFound)
    socket.on('GameStarting', handleGameStarting)
    socket.on('TournamentRoundStarted', handleTournamentRoundStarted)
    socket.on('TournamentMatchGameStarted', handleTournamentMatchGameStarted)
    socket.on('TournamentPlayerForfeited', handleTournamentPlayerForfeited)
    socket.on('TournamentLeaveResponse', handleTournamentLeaveResponse)

    return () => {
      socket.off('TournamentJoinResponse', handleTournamentJoinResponse)
      socket.off('TournamentDataResponse', handleTournamentDataResponse)
      socket.off('TournamentPlayerJoined', handleTournamentPlayerJoined)
      socket.off('TournamentUpdated', handleTournamentUpdated)
      socket.off('TournamentInviteAccepted', handleTournamentInviteAccepted)
      socket.off('TournamentStarted', handleTournamentStarted)
      socket.off('TournamentMatchCompleted', handleTournamentMatchCompleted)
      socket.off('TournamentCompleted', handleTournamentCompleted)
      socket.off('TournamentParticipantLeft', handleTournamentParticipantLeft)
      socket.off('TournamentCancelled', handleTournamentCancelled)
      socket.off('RedirectToPlay', handleRedirectToPlay)
      socket.off('TournamentNextMatchReady', handleTournamentNextMatchReady)
      socket.off('StartCurrentRoundResponse', handleStartCurrentRoundResponse)
      socket.off('TournamentStartResponse', handleTournamentStartResponse)
      socket.off('TournamentCancelResponse', handleTournamentCancelResponse)
      socket.off('GameFound', handleGameFound)
      socket.off('GameStarting', handleGameStarting)
      socket.off('TournamentRoundStarted', handleTournamentRoundStarted)
      socket.off('TournamentMatchGameStarted', handleTournamentMatchGameStarted)
      socket.off('TournamentPlayerForfeited', handleTournamentPlayerForfeited)
      socket.off('TournamentLeaveResponse', handleTournamentLeaveResponse)
    }
  }, [socket, tournamentId, user?.email, router])

  const handleStartTournament = () => {
    if (!socket || !tournamentId || !user?.email) return;
    
    setIsStartingGame(true);
    
    const startData = { tournamentId, hostEmail: user.email };
    socket.emit('StartTournament', startData);
    
    // Add a timeout fallback in case the response doesn't come back
    setTimeout(() => {
      if (isStartingGame) {
        setIsStartingGame(false);
        setNotification({
          type: 'error',
          message: 'Tournament start timed out. Please try again.'
        });
      }
    }, 10000);
  };

  const handleStartCurrentRound = () => {
    if (!socket || !tournamentId || !user?.email) return;
    
    // Calculate the current round based on tournament data
    const currentRound = (() => {
      if (!tournamentData?.matches) return 0;
      
      // Find the current round based on matches that are waiting or in progress
      const waitingMatches = tournamentData.matches.filter((m: any) => 
        m.state === MATCH_STATES.WAITING || m.state === MATCH_STATES.IN_PROGRESS
      );
      
      if (waitingMatches.length > 0) {
        return Math.min(...waitingMatches.map((m: any) => m.round));
      }
      
      // If no waiting matches, find the highest round with completed matches + 1
      const completedMatches = tournamentData.matches.filter((m: any) => 
        m.state === MATCH_STATES.PLAYER1_WIN || m.state === MATCH_STATES.PLAYER2_WIN
      );
      
      if (completedMatches.length > 0) {
        return Math.max(...completedMatches.map((m: any) => m.round)) + 1;
      }
      
      return 0;
    })();
    
    socket.emit('StartCurrentRound', { 
      tournamentId, 
      hostEmail: user.email, 
      round: currentRound 
    });
  };

  // Add after main hooks
  useEffect(() => {
    if (!socket || !tournamentId || !user?.email || !tournamentData) return;

    let currentPath = window.location.pathname;

    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      if (currentPath && newPath !== currentPath) {
        
        // Only emit leave/cancel events if leaving to non-game/non-tournament pages
        const isLeavingToGame = newPath.includes('/play/game/');
        const isStayingInTournament = newPath.includes(`/play/tournament/${tournamentId}`);
        const isGoingToPlay = newPath === '/play';
        const isInternalRoute = newPath.startsWith('/play/') || newPath.startsWith('/another-internal-route/'); // Add your internal routes here
        
        // Only consider it "leaving" if going to non-tournament, non-game pages
        if (!isLeavingToGame && !isStayingInTournament && !isGoingToPlay && !isInternalRoute) {
          if (isHost) {
            // Host leaves lobby before tournament starts
            socket.emit('CancelTournament', { tournamentId, hostEmail: user.email });
          } else {
            // Player leaves lobby before tournament starts
            socket.emit('LeaveTournament', { tournamentId, playerEmail: user.email });
          }
        }
      }
      setTimeout(() => { currentPath = newPath; }, 0);
    };

    const handleBeforeUnload = () => {
      // Only emit leave events on actual page close/refresh, not navigation
      if (isHost) {
        socket.emit('CancelTournament', { tournamentId, hostEmail: user.email });
      } else {
        socket.emit('LeaveTournament', { tournamentId, playerEmail: user.email });
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen for pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleRouteChange();
    };
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [socket, tournamentId, user?.email, isHost, tournamentData]);

  // Add Cancel Tournament button for host in the lobby
  const handleCancelTournament = () => {
    if (!socket || !tournamentId || !isHost) return;
    
    socket.emit('CancelTournament', { tournamentId, hostEmail: user?.email });
    setNotification({ message: 'Canceling tournament...', type: 'info' });
  }

  // Loading state
  if (!authorizationChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1419]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining tournament...</p>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1419]">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">You are not authorized to join this tournament.</p>
          <button
            onClick={() => router.push('/play')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    )
  }

  // Tournament lobby or bracket view
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-7xl text-center">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-600 text-white' :
            notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="flex justify-center items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {tournamentData?.name || 'Tournament'}
            </h1>
            <p className="text-gray-400 text-lg mt-2">
              {tournamentData?.status === 'lobby' ? '🎮 Tournament Room - Waiting for players to join' : 
               tournamentData?.status === 'in_progress' ? '⚔️ Tournament in progress' : '🏆 Tournament completed'}
            </p>
          </div>
        </div>

        {/* Tournament Bracket - Show to all participants immediately */}
        <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-2xl font-semibold text-white mb-6">Tournament Bracket</h2>
          
          {/* Participants Info */}
          <div className="mb-6 p-4 bg-[#2a2f3a] rounded-lg border border-gray-600">
            <h3 className="text-white font-medium mb-3">Participants ({tournamentData?.participants?.length || 0}/{tournamentData?.size || 0})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {tournamentData?.participants?.map((participant: any, index: number) => (
                <div key={participant.email} className="bg-[#1a1d23] rounded-lg p-3 border border-gray-600">
                  <div className="w-12 h-12 rounded-full bg-[#3a3f4a] overflow-hidden mx-auto mb-2 border-2 border-green-500">
                    <Image 
                      src={`/images/${participant.avatar}`} 
                      alt={participant} 
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white text-center text-sm font-medium truncate">{participant.nickname}</p>
                  {participant.isHost && (
                    <p className="text-blue-400 text-xs text-center">Host</p>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: (tournamentData?.size || 0) - (tournamentData?.participants?.length || 0) }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-[#1a1d23] rounded-lg p-3 border border-gray-600 border-dashed flex items-center justify-center">
                  <p className="text-gray-400 text-center text-sm">Waiting...</p>
                </div>
              ))}
            </div>
            
            {/* Tournament Status and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                  tournamentData?.status === 'lobby' ? 'bg-yellow-600/70' :
                  tournamentData?.status === 'in_progress' ? 'bg-green-600/70' :
                  'bg-gray-600/70'
                }`}>
                  {tournamentData?.status === 'lobby' ? 'Waiting for Players' :
                   tournamentData?.status === 'in_progress' ? 'In Progress' :
                   'Completed'}
                </span>
                
                {/* Only show waiting message when tournament is in lobby and not full */}
                {tournamentData?.status === 'lobby' && tournamentData?.participants?.length < (tournamentData?.size || 0) && (
                  <span className="text-yellow-400 text-sm">
                    Waiting for {tournamentData?.size - tournamentData?.participants?.length} more players...
                  </span>
                )}
              </div>
              
              {/* Host Controls */}
              {isHost && tournamentData?.status === 'lobby' && tournamentData?.participants?.length === tournamentData?.size && (
                <button
                  onClick={handleStartTournament}
                  disabled={isStartingGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isStartingGame ? 'Starting Tournament...' : '🎯 Start Tournament'}
                </button>
            )}
            
              {isHost && tournamentData?.status === 'in_progress' && (
                <div className="flex gap-2">
                  <button
                    onClick={handleStartCurrentRound}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    ⚔️ Start Current Round
                  </button>
              </div>
            )}
            </div>

            {/* Guest Status Message */}
            {!isHost && tournamentData?.status === 'in_progress' && (
              <div className="mt-4 p-3 bg-[#1a1d23] rounded-lg border border-gray-600">
                <p className="text-gray-300 text-sm">
                  {tournamentData.participants.find(p => p.email === user?.email)?.status === 'eliminated' 
                    ? '❌ You have been eliminated from the tournament. You can still watch the bracket progress.'
                    : '⏳ You are in the tournament room. The host will start your round when ready. You will be automatically moved to your match when it begins.'
                  }
                </p>
              </div>
            )}

            {/* Lobby waiting message for non-hosts */}
            {!isHost && tournamentData?.status === 'lobby' && (
              <div className="mt-4 p-3 bg-[#1a1d23] rounded-lg border border-gray-600">
                <p className="text-gray-300 text-sm">
                  🎮 You are in the tournament room. The host will start the tournament when all players have joined.
                  {tournamentData?.participants?.length < tournamentData?.size && 
                    ` Waiting for ${tournamentData?.size - tournamentData?.participants?.length} more players...`
                  }
                </p>
              </div>
            )}
            
            {/* Cancel Tournament Button - Only show when tournament is in lobby */}
            {isHost && tournamentData?.status === 'lobby' && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleCancelTournament}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel Tournament
                </button>
              </div>
            )}
          </div>
            
            {/* Tournament Bracket Component */}
          {tournamentData?.status === 'in_progress' || tournamentData?.status === 'completed' ? (
            // Show bracket when tournament is in progress or completed
            tournamentData?.matches && tournamentData.matches.length > 0 ? (
              <div className="overflow-x-auto">
                <TournamentBracket
                  participants={tournamentData.participants}
                  tournamentSize={tournamentData.size}
                  matches={tournamentData.matches}
                  currentRound={(() => {
                    // Find the current round based on matches that are waiting or in progress
                    const waitingMatches = tournamentData.matches.filter((m: any) => 
                      m.state === MATCH_STATES.WAITING || m.state === MATCH_STATES.IN_PROGRESS
                    )
                    if (waitingMatches.length > 0) {
                      return Math.min(...waitingMatches.map((m: any) => m.round))
                    }
                    // If no waiting matches, find the highest round with completed matches
                    const completedMatches = tournamentData.matches.filter((m: any) => 
                      m.state === MATCH_STATES.PLAYER1_WIN || m.state === MATCH_STATES.PLAYER2_WIN
                    )
                    if (completedMatches.length > 0) {
                      return Math.max(...completedMatches.map((m: any) => m.round))
                    }
                    return 0
                  })()}
                  onMatchUpdate={() => {}}
                  onPlayMatch={null} // Disable match clicking for participants
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">
                  🎯 Tournament bracket is being prepared...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  The host will start the matches shortly.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">
                Tournament bracket will be generated when the tournament starts.
              </p>
            </div>
          )}
        </div>

        {/* Tournament Complete */}
        {tournamentData?.status === 'completed' && (
          <div className="rounded-lg p-6 border border-gray-700/50 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Tournament Complete!</h2>
            <p className="text-gray-300 mb-6">The tournament has finished.</p>
            <button
              onClick={() => router.push('/play')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Tournaments
            </button>
          </div>
        )}
      </div>
    </div>
  )
}