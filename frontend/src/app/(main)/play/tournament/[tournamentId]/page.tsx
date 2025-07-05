"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { useTournamentInvite } from '../TournamentInviteProvider'
import { PingPongGame } from '../../game/PingPongGame'
import Image from 'next/image'
import TournamentBracket from '../TournamentBracket'

export default function TournamentGamePage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.tournamentId as string
  const { user } = useAuthStore()
  const { socket } = useTournamentInvite()
  
  const [tournamentData, setTournamentData] = useState<any>(null)
  const [currentMatch, setCurrentMatch] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authorizationChecked, setAuthorizationChecked] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [opponent, setOpponent] = useState<any>(null)
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
  
  // Use refs to track the latest state in event handlers
  const gameStartedRef = useRef(gameStarted)
  const isLeavingGameRef = useRef(false)
  
  useEffect(() => {
    gameStartedRef.current = gameStarted
  }, [gameStarted])

  // Debug useEffect to track isStartingGame changes
  useEffect(() => {
    console.log('[Tournament] isStartingGame changed to:', isStartingGame);
  }, [isStartingGame]);

  // Join tournament on mount
  useEffect(() => {
    if (!socket || !tournamentId || !user?.email) return

    socket.emit('JoinTournament', { 
      tournamentId, 
      playerEmail: user.email 
    })
    
    // Set a timeout for authorization check
    const authTimeout = setTimeout(() => {
      if (!authorizationChecked) {
        setIsAuthorized(false)
        setAuthorizationChecked(true)
        router.push('/play')
      }
    }, 5000) // 5 second timeout

    return () => {
      clearTimeout(authTimeout)
    }
  }, [socket, tournamentId, user?.email, authorizationChecked, router])

  useEffect(() => {
    if (!socket || !tournamentId) return

    const handleTournamentJoinResponse = (data: any) => {
      setAuthorizationChecked(true)
      if (data.status === 'success') {
        setIsAuthorized(true)
        setTournamentData(data.tournament)
        setIsHost(data.tournament.hostEmail === user?.email)
        
        // Check if there's a current match for this player
        if (data.currentMatch) {
          setCurrentMatch(data.currentMatch)
          const otherPlayer = data.currentMatch.player1?.email === user?.email ? 
            data.currentMatch.player2 : data.currentMatch.player1
          if (otherPlayer) {
            setOpponent(otherPlayer)
            setWaitingForOpponent(true)
          }
        }
      } else {
        setIsAuthorized(false)
        router.push('/play')
      }
    }

    const handleTournamentUpdated = (data: any) => {
      console.log('[Tournament] TournamentUpdated event received:', data);
      if (data.tournamentId === tournamentId) {
        console.log('[Tournament] Updating tournament data from TournamentUpdated:', data.tournament);
        setTournamentData(data.tournament)
      }
    }

    const handleTournamentInviteAccepted = (data: any) => {
      console.log('[Tournament] TournamentInviteAccepted event received:', data);
      console.log('[Tournament] Current tournamentId:', tournamentId);
      console.log('[Tournament] Event tournamentId:', data.tournamentId);
      console.log('[Tournament] Current tournamentData:', tournamentData);
      console.log('[Tournament] New tournament data:', data.tournament);
      
      if (data.tournamentId === tournamentId) {
        console.log('[Tournament] Updating tournament data with:', data.tournament);
        setTournamentData(data.tournament)
        // Show a brief notification that someone joined
        const playerName = data.newParticipant?.nickname || data.inviteeEmail
        setNotification({ message: `${playerName} joined the tournament!`, type: 'success' })
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000)
      } else {
        console.log('[Tournament] Tournament ID mismatch, ignoring event');
      }
    }

    const handleTournamentReady = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        // Tournament is full and ready to start
        if (data.tournament.hostEmail === user?.email) {
          // Host can start the tournament
          setIsHost(true)
        }
      }
    }

    const handleTournamentStarted = (data: any) => {
      console.log('[Tournament] TournamentStarted event received:', data);
      if (data.tournamentId === tournamentId) {
        console.log('[Tournament] Updating tournament data from TournamentStarted');
        setTournamentData(data.tournament)
        
        // Show notification to participants
        if (data.tournament.hostEmail !== user?.email) {
          console.log('[Tournament] Setting notification for participant');
          setNotification({
            type: 'success',
            message: '🎯 Tournament has started! The bracket is now visible. Only the host can start matches.'
          });
          console.log('[Tournament] Participant notification set');
        }
        
        // Check if current user is in the first match
        if (data.firstMatch) {
          const isInFirstMatch = data.firstMatch.player1?.email === user?.email || 
                                data.firstMatch.player2?.email === user?.email
          
          if (isInFirstMatch) {
            setCurrentMatch(data.firstMatch)
            const otherPlayer = data.firstMatch.player1?.email === user?.email ? 
              data.firstMatch.player2 : data.firstMatch.player1
            if (otherPlayer) {
              setOpponent(otherPlayer)
              setWaitingForOpponent(true)
            }
          }
        }
      }
    }

    const handleTournamentMatchStarted = (data: any) => {
      if (data.tournamentId === tournamentId && data.matchId === currentMatch?.id) {
        setWaitingForOpponent(false)
        setGameStarted(true)
      }
    }

    const handleTournamentMatchCompleted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setGameStarted(false)
        setCurrentMatch(null)
        setOpponent(null)
        setWaitingForOpponent(false)
        
        // Update tournament data
        if (data.tournament) {
          setTournamentData(data.tournament)
          
          // Check if there's a next match for this player
          const nextMatch = data.tournament.matches.find((m: any) => 
            (m.player1?.email === user?.email || m.player2?.email === user?.email) && 
            m.state === 'waiting'
          )
          
          if (nextMatch) {
            setCurrentMatch(nextMatch)
            const otherPlayer = nextMatch.player1?.email === user?.email ? 
              nextMatch.player2 : nextMatch.player1
            if (otherPlayer) {
              setOpponent(otherPlayer)
              setWaitingForOpponent(true)
            }
          }
        }
        
        // Show notification about match result
        if (data.reason === 'player_disconnected') {
          setNotification({ 
            message: 'Opponent disconnected. You win this match!', 
            type: 'success' 
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
          } else {
            setNotification({ 
              message: `You lost against ${winnerName}. Better luck next time!`, 
              type: 'info' 
            })
          }
        }
        
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000)
      }
    }

    const handleTournamentRoundAdvanced = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        // Check if there's a next match for this player
        if (data.nextMatch) {
          const isInNextMatch = data.nextMatch.player1?.email === user?.email || 
                               data.nextMatch.player2?.email === user?.email
          
          if (isInNextMatch) {
            setCurrentMatch(data.nextMatch)
            const otherPlayer = data.nextMatch.player1?.email === user?.email ? 
              data.nextMatch.player2 : data.nextMatch.player1
            if (otherPlayer) {
              setOpponent(otherPlayer)
              setWaitingForOpponent(true)
            }
          }
        }
        
        // Show notification about round advancement
        setNotification({ 
          message: 'Tournament round advanced!', 
          type: 'info' 
        })
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000)
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

    const handleTournamentCanceled = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setNotification({ 
          message: 'Tournament was canceled by the host.', 
          type: 'error' 
        })
        
        // Redirect to play page after 3 seconds
        setTimeout(() => {
          router.push('/play')
        }, 3000)
      }
    }

    const handleRedirectToPlay = (data: any) => {
      if (data.tournamentId === tournamentId) {
        router.push('/play')
      }
    }

    const handleTournamentMatchGameStarted = (data: any) => {
      console.log('[Tournament] TournamentMatchGameStarted event received:', data);
      console.log('[Tournament] Current tournamentId:', tournamentId);
      console.log('[Tournament] Event tournamentId:', data.tournamentId);
      console.log('[Tournament] Current user email:', user?.email);
      console.log('[Tournament] Match host email:', data.hostEmail);
      console.log('[Tournament] Match guest email:', data.guestEmail);
      
      if (data.tournamentId === tournamentId && 
          (data.hostEmail === user?.email || data.guestEmail === user?.email)) {
        console.log('[Tournament] User is in this match, setting up game...');
        
        // Find the match in tournament data
        const match = tournamentData?.matches?.find((m: any) => m.id === data.matchId);
        if (match) {
          console.log('[Tournament] Found match:', match);
          setCurrentMatch(match);
          
          // Set opponent
          const otherPlayer = data.hostEmail === user?.email ? 
            { email: data.guestEmail, ...data.guestData } : 
            { email: data.hostEmail, ...data.hostData };
          setOpponent(otherPlayer);
          
          console.log('[Tournament] Set opponent:', otherPlayer);
          console.log('[Tournament] Starting game...');
          setGameStarted(true);
          setWaitingForOpponent(false);
        } else {
          console.log('[Tournament] Match not found in tournament data');
        }
      } else {
        console.log('[Tournament] User not in this match or tournament ID mismatch');
      }
    }

    const handleTournamentMatchesStarted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        setNotification({ 
          message: 'Tournament matches have started!', 
          type: 'success' 
        })
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentNextMatchReady = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        // Check if this is the current user's next match
        if (data.nextMatch) {
          const isInNextMatch = data.nextMatch.player1?.email === user?.email || 
                               data.nextMatch.player2?.email === user?.email
          
          if (isInNextMatch) {
            setCurrentMatch(data.nextMatch)
            const otherPlayer = data.nextMatch.player1?.email === user?.email ? 
              data.nextMatch.player2 : data.nextMatch.player1
            if (otherPlayer) {
              setOpponent(otherPlayer)
              setWaitingForOpponent(true)
            }
            
            setNotification({ 
              message: 'Your next match is ready!', 
              type: 'success' 
            })
            setTimeout(() => setNotification(null), 5000)
          }
        }
      }
    }

    const handleJoinTournamentGame = (data: any) => {
      console.log('[Tournament] JoinTournamentGame event received:', data);
      if (data.tournamentId === tournamentId && 
          (data.hostEmail === user?.email || data.guestEmail === user?.email)) {
        console.log('[Tournament] Joining tournament game...');
        
        // Find the match in tournament data
        const match = tournamentData?.matches?.find((m: any) => m.id === data.matchId);
        if (match) {
          setCurrentMatch(match);
          
          // Set opponent
          const otherPlayer = data.hostEmail === user?.email ? 
            { email: data.guestEmail, ...data.guestData } : 
            { email: data.hostEmail, ...data.hostData };
          setOpponent(otherPlayer);
          
          setGameStarted(true);
          setWaitingForOpponent(false);
        }
      }
    }

    const handleTournamentMatchInvitation = (data: any) => {
      if (data.tournamentId === tournamentId && 
          (data.player1Email === user?.email || data.player2Email === user?.email)) {
        setNotification({ 
          message: 'You have a tournament match invitation!', 
          type: 'info' 
        })
        setTimeout(() => setNotification(null), 5000)
      }
    }

    const handleTournamentMatchInvitationResponse = (data: any) => {
      if (data.tournamentId === tournamentId) {
        if (data.status === 'accepted') {
          setNotification({ 
            message: 'Match invitation accepted!', 
            type: 'success' 
          })
        } else {
          setNotification({ 
            message: 'Match invitation declined.', 
            type: 'info' 
          })
        }
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentMatchDeclined = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setNotification({ 
          message: 'Match was declined by opponent.', 
          type: 'info' 
        })
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentMatchAutoDeclined = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setNotification({ 
          message: 'Match was automatically declined due to timeout.', 
          type: 'info' 
        })
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentMatchInvitationUpdate = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
      }
    }

    const handleStartNextRoundMatchesResponse = (data: any) => {
      console.log('[Tournament] Start next round matches response:', data);
      
      if (data.status === 'success') {
        setNotification({
          type: 'success',
          message: data.message
        });
      } else {
        setNotification({
          type: 'error',
          message: data.message
        });
      }
    }

    const handleStartTournamentMatchesResponse = (data: any) => {
      console.log('[Tournament] Start tournament matches response:', data);
      
      if (data.status === 'success') {
        setNotification({
          type: 'success',
          message: data.message
        });
      } else {
        setNotification({
          type: 'error',
          message: data.message
        });
      }
    }

    const handleTournamentPlayerEliminated = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        if (data.eliminatedEmail === user?.email) {
          setNotification({ 
            message: 'You have been eliminated from the tournament.', 
            type: 'info' 
          })
        } else {
          const eliminatedName = data.tournament?.participants.find((p: any) => p.email === data.eliminatedEmail)?.nickname || 'Unknown'
          setNotification({ 
            message: `${eliminatedName} has been eliminated from the tournament.`, 
            type: 'info' 
          })
        }
        
        setTimeout(() => setNotification(null), 5000)
      }
    }

    const handleTestSocketResponse = (data: any) => {
      console.log('[Tournament] Test socket response:', data);
      setNotification({ 
        message: `Socket test response: ${data.message}`, 
        type: 'info' 
      })
      setTimeout(() => setNotification(null), 3000)
    }

    // Add the new event handlers for tournament start and cancel responses
    const handleTournamentStartResponse = (data: any) => {
      console.log('[Tournament] Tournament start response received:', data);
      console.log('[Tournament] Socket connected:', !!socket);
      console.log('[Tournament] Current notification state:', notification);
      console.log('[Tournament] Setting isStartingGame to false');
      setIsStartingGame(false);
      
      if (data.status === 'success') {
        console.log('[Tournament] Setting success notification for host');
        setNotification({
          type: 'success',
          message: '🎯 Tournament started successfully! The bracket is now visible to all participants. Only you (the host) can start matches.'
        });
        console.log('[Tournament] Success notification set');
      } else {
        console.log('[Tournament] Setting error notification for host');
        setNotification({
          type: 'error',
          message: data.message
        });
        console.log('[Tournament] Error notification set');
      }
    };

    const handleTournamentCancelResponse = (data: any) => {
      console.log('[Tournament] Tournament cancel response received:', data);
      
      if (data.status === 'success') {
        setNotification({ message: 'Tournament canceled successfully.', type: 'success' });
      } else {
        setNotification({ message: data.message || 'Failed to cancel tournament.', type: 'error' });
      }
    };

    // Register all event listeners
    console.log('[Tournament] Registering event listeners');
    socket.on('TournamentJoinResponse', handleTournamentJoinResponse)
    socket.on('TournamentUpdated', handleTournamentUpdated)
    socket.on('TournamentInviteAccepted', handleTournamentInviteAccepted)
    socket.on('TournamentReady', handleTournamentReady)
    socket.on('TournamentStarted', handleTournamentStarted)
    socket.on('TournamentMatchStarted', handleTournamentMatchStarted)
    socket.on('TournamentMatchCompleted', handleTournamentMatchCompleted)
    socket.on('TournamentRoundAdvanced', handleTournamentRoundAdvanced)
    socket.on('TournamentCompleted', handleTournamentCompleted)
    socket.on('TournamentParticipantLeft', handleTournamentParticipantLeft)
    socket.on('TournamentCanceled', handleTournamentCanceled)
    socket.on('RedirectToPlay', handleRedirectToPlay)
    socket.on('TournamentMatchGameStarted', handleTournamentMatchGameStarted)
    socket.on('TournamentMatchesStarted', handleTournamentMatchesStarted)
    socket.on('TournamentNextMatchReady', handleTournamentNextMatchReady)
    socket.on('JoinTournamentGame', handleJoinTournamentGame)
    socket.on('TournamentMatchInvitation', handleTournamentMatchInvitation)
    socket.on('TournamentMatchInvitationResponse', handleTournamentMatchInvitationResponse)
    socket.on('TournamentMatchDeclined', handleTournamentMatchDeclined)
    socket.on('TournamentMatchAutoDeclined', handleTournamentMatchAutoDeclined)
    socket.on('TournamentMatchInvitationUpdate', handleTournamentMatchInvitationUpdate)
    socket.on('StartNextRoundMatchesResponse', handleStartNextRoundMatchesResponse)
    socket.on('StartTournamentMatchesResponse', handleStartTournamentMatchesResponse)
    socket.on('TournamentPlayerEliminated', handleTournamentPlayerEliminated)
    socket.on('TestTournamentSocketResponse', handleTestSocketResponse)
    socket.on('TournamentStartResponse', handleTournamentStartResponse)
    socket.on('TournamentCancelResponse', handleTournamentCancelResponse)
    console.log('[Tournament] All event listeners registered');

    return () => {
      socket.off('TournamentJoinResponse', handleTournamentJoinResponse)
      socket.off('TournamentUpdated', handleTournamentUpdated)
      socket.off('TournamentInviteAccepted', handleTournamentInviteAccepted)
      socket.off('TournamentReady', handleTournamentReady)
      socket.off('TournamentStarted', handleTournamentStarted)
      socket.off('TournamentMatchStarted', handleTournamentMatchStarted)
      socket.off('TournamentMatchCompleted', handleTournamentMatchCompleted)
      socket.off('TournamentRoundAdvanced', handleTournamentRoundAdvanced)
      socket.off('TournamentCompleted', handleTournamentCompleted)
      socket.off('TournamentParticipantLeft', handleTournamentParticipantLeft)
      socket.off('TournamentCanceled', handleTournamentCanceled)
      socket.off('RedirectToPlay', handleRedirectToPlay)
      socket.off('TournamentMatchGameStarted', handleTournamentMatchGameStarted)
      socket.off('TournamentMatchesStarted', handleTournamentMatchesStarted)
      socket.off('TournamentNextMatchReady', handleTournamentNextMatchReady)
      socket.off('JoinTournamentGame', handleJoinTournamentGame)
      socket.off('TournamentMatchInvitation', handleTournamentMatchInvitation)
      socket.off('TournamentMatchInvitationResponse', handleTournamentMatchInvitationResponse)
      socket.off('TournamentMatchDeclined', handleTournamentMatchDeclined)
      socket.off('TournamentMatchAutoDeclined', handleTournamentMatchAutoDeclined)
      socket.off('TournamentMatchInvitationUpdate', handleTournamentMatchInvitationUpdate)
      socket.off('StartNextRoundMatchesResponse', handleStartNextRoundMatchesResponse)
      socket.off('StartTournamentMatchesResponse', handleStartTournamentMatchesResponse)
      socket.off('TournamentPlayerEliminated', handleTournamentPlayerEliminated)
      socket.off('TestTournamentSocketResponse', handleTestSocketResponse)
      socket.off('TournamentStartResponse', handleTournamentStartResponse)
      socket.off('TournamentCancelResponse', handleTournamentCancelResponse)
    }
  }, [socket, tournamentId, user?.email, router, currentMatch])

  const handleStartTournament = () => {
    if (!socket || !tournamentId || !user?.email) return;
    
    console.log('[Tournament] Starting tournament:', { tournamentId, hostEmail: user.email });
    console.log('[Tournament] Setting isStartingGame to true');
    setIsStartingGame(true);
    console.log('[Tournament] Emitting StartTournament event');
    socket.emit('StartTournament', { tournamentId, hostEmail: user.email });
    
    // Add a timeout fallback in case the response doesn't come back
    setTimeout(() => {
      console.log('[Tournament] Timeout fallback - checking if still starting');
      if (isStartingGame) {
        console.log('[Tournament] Still starting after timeout, resetting state');
        setIsStartingGame(false);
        setNotification({
          type: 'error',
          message: 'Tournament start timed out. Please try again.'
        });
      }
    }, 10000); // 10 second timeout
  };

  const handleStartNextRoundMatches = () => {
    if (!socket || !tournamentId || !user?.email) return;
    
    console.log('[Tournament] Starting next round matches:', { tournamentId, hostEmail: user.email });
    socket.emit('StartNextRoundMatches', { tournamentId, hostEmail: user.email });
  };

  const handleStartTournamentMatches = () => {
    if (!socket || !tournamentId || !user?.email) return;
    
    console.log('[Tournament] Starting tournament matches:', { tournamentId, hostEmail: user.email });
    socket.emit('StartTournamentMatches', { tournamentId, hostEmail: user.email });
  };

  const handleLeaveTournament = () => {
    if (!socket || !tournamentId) return

    isLeavingGameRef.current = true
    socket.emit('LeaveTournament', { tournamentId, playerEmail: user?.email })
    router.push('/play')
  }

  const handleStartMatch = () => {
    if (socket && currentMatch && user?.email) {
      socket.emit('StartTournamentMatchGame', {
        tournamentId,
        matchId: currentMatch.id,
        playerEmail: user.email
      });
    }
  };

  const handleGameEnd = (winner: any, loser: any) => {
    if (socket && currentMatch && user?.email) {
      // Determine winner and loser emails
      let winnerEmail: string
      let loserEmail: string
      
      if (typeof winner === 'string') {
        winnerEmail = winner
        loserEmail = loser
      } else if (winner?.email) {
        winnerEmail = winner.email
        loserEmail = loser?.email || (winner.email === currentMatch.player1?.email ? currentMatch.player2?.email : currentMatch.player1?.email) || ''
      } else {
        // Fallback: determine based on current match
        winnerEmail = currentMatch.player1?.email === user?.email ? currentMatch.player1?.email : currentMatch.player2?.email || ''
        loserEmail = currentMatch.player1?.email === user?.email ? currentMatch.player2?.email : currentMatch.player1?.email || ''
      }
      
      console.log('Game ended:', { winner, loser, winnerEmail, loserEmail })
      
      // Report the tournament match result
      socket.emit('TournamentMatchResult', {
        tournamentId,
        matchId: currentMatch.id,
        winnerEmail,
        loserEmail,
        playerEmail: user.email
      })
      
      // Reset game state
      setGameStarted(false)
      setCurrentMatch(null)
      setOpponent(null)
      setWaitingForOpponent(false)
    }
  }

  // Add after main hooks
  useEffect(() => {
    if (!socket || !tournamentId || !user?.email || !tournamentData) return;

    let currentPath = window.location.pathname;

    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      if (currentPath && newPath !== currentPath) {
        if (isHost) {
          // Host leaves lobby before tournament starts
          socket.emit('CancelTournament', { tournamentId, hostEmail: user.email });
        } else {
          // Player leaves lobby before tournament starts
          socket.emit('LeaveTournament', { tournamentId, playerEmail: user.email });
        }
      }
      setTimeout(() => { currentPath = newPath; }, 0);
    };

    const handleBeforeUnload = () => {
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
    
    console.log('[Tournament] Canceling tournament:', { tournamentId, hostEmail: user?.email });
    socket.emit('CancelTournament', { tournamentId, hostEmail: user?.email });
    setNotification({ message: 'Canceling tournament...', type: 'info' });
  };

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

  // If in game, show the game component
  if (gameStarted && currentMatch && opponent) {
    return (
      <div className="h-full text-white">
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <PingPongGame
              player1={user}
              player2={opponent}
              onExit={(winner) => handleGameEnd(winner, opponent)}
              gameId={currentMatch.gameId}
              socket={socket}
              isHost={currentMatch.player1?.email === user?.email}
              opponent={opponent}
            />
          </div>
        </div>
      </div>
    );
  }

  // Waiting for opponent in current match
  if (waitingForOpponent && currentMatch && opponent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1419] px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">Match Ready!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
            {/* Current User */}
            <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
              <div className="w-24 h-24 rounded-full bg-[#2a2f3a] overflow-hidden mx-auto mb-4 border-2 border-blue-500">
                <Image 
                  src={`/images/${user?.avatar}` || '/avatar/Default.svg'} 
                  alt={user?.name || 'You'} 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">You</h3>
              <p className="text-blue-400 text-lg">{user?.name || 'Player'}</p>
            </div>
            
            {/* Opponent */}
            <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
              <div className="w-24 h-24 rounded-full bg-[#2a2f3a] overflow-hidden mx-auto mb-4 border-2 border-green-500">
                <Image 
                  src={`/images/${opponent?.avatar}` || '/avatar/Default.svg'} 
                  alt={opponent?.nickname || 'Opponent'} 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Opponent</h3>
              <p className="text-green-400 text-lg">{opponent?.nickname || opponent?.login || 'Waiting...'}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-xl text-green-400 mb-4">🎮 Match ready!</p>
            <p className="text-gray-300">
              Waiting for both players to be ready...
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleLeaveTournament}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Leave Tournament
            </button>
          </div>
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

        {/* Debug Tools */}
        <div className="fixed top-4 left-4 z-50 space-y-2">
          <button
            onClick={() => {
              console.log('[Tournament] Testing notification system');
              setNotification({
                type: 'success',
                message: '🧪 Test notification - notification system is working!'
              });
              setTimeout(() => setNotification(null), 3000);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🧪 Test Notification
          </button>
          
          <button
            onClick={() => {
              console.log('[Tournament] Manual start test');
              console.log('[Tournament] Socket connected:', !!socket);
              console.log('[Tournament] Current notification state:', notification);
              if (socket && user?.email) {
                console.log('[Tournament] Emitting manual test event');
                socket.emit('StartTournament', { tournamentId, hostEmail: user.email });
              }
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🔧 Manual Start Test
          </button>
          
          <button
            onClick={() => {
              console.log('[Tournament] Testing TournamentStartResponse event');
              if (socket) {
                console.log('[Tournament] Emitting test TournamentStartResponse');
                socket.emit('TournamentStartResponse', { 
                  status: 'success', 
                  message: 'Test response from manual trigger' 
                });
              }
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🎯 Test Response Event
          </button>
          
          <div className="bg-red-900/80 text-white p-3 rounded-lg text-xs max-w-xs">
            <div><strong>Debug Info:</strong></div>
            <div>Socket: {socket ? '✅' : '❌'}</div>
            <div>User: {user?.email || 'None'}</div>
            <div>Host: {isHost ? 'Yes' : 'No'}</div>
            <div>Starting: {isStartingGame ? 'Yes' : 'No'}</div>
            <div>Notification: {notification ? 'Active' : 'None'}</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            {tournamentData?.name || 'Tournament'}
          </h1>
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
            <button
              onClick={handleLeaveTournament}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Leave Tournament
            </button>
          </div>
        </div>

        {/* Tournament Status */}
        {tournamentData?.status === 'lobby' && (
          <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Tournament Lobby</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {tournamentData.participants.map((participant: any, index: number) => (
                <div key={participant.email} className="bg-[#2a2f3a] rounded-lg p-4 border border-gray-600">
                  <div className="w-16 h-16 rounded-full bg-[#3a3f4a] overflow-hidden mx-auto mb-3 border-2 border-green-500">
                    <Image 
                      src={`/images/${participant.avatar}`} 
                      alt={participant.nickname} 
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white text-center font-medium truncate">{participant.nickname}</p>
                  {participant.isHost && (
                    <p className="text-blue-400 text-xs text-center">Host</p>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: tournamentData.size - tournamentData.participants.length }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-[#2a2f3a] rounded-lg p-4 border border-gray-600 border-dashed flex items-center justify-center">
                  <p className="text-gray-400 text-center">Waiting...</p>
                </div>
              ))}
            </div>
            
            {isHost && tournamentData.participants.length === tournamentData.size && (
              <div className="text-center">
                <button
                  onClick={handleStartTournament}
                  disabled={isStartingGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isStartingGame ? 'Starting Tournament...' : 'Start Tournament'}
                </button>
              </div>
            )}
            
            {!isHost && tournamentData.participants.length === tournamentData.size && (
              <p className="text-center text-gray-300">
                Waiting for host to start the tournament...
              </p>
            )}
            
            {tournamentData.participants.length < tournamentData.size && (
              <p className="text-center text-yellow-400">
                Waiting for {tournamentData.size - tournamentData.participants.length} more players...
              </p>
            )}

            {tournamentData?.status === 'lobby' && isHost && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleCancelTournament}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Cancel Tournament
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tournament Bracket - Show to all participants after tournament starts */}
        {tournamentData?.status === 'in_progress' && tournamentData.matches && (
          <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-2xl font-semibold text-white mb-6">Tournament Bracket</h2>
            
            {/* Host controls for starting matches */}
            {isHost && (
              <div className="mb-6 p-4 bg-[#2a2f3a] rounded-lg border border-gray-600">
                <h3 className="text-white font-medium mb-3">Host Controls</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleStartTournamentMatches}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Start All Current Round Matches
                  </button>
                  <button
                    onClick={handleStartNextRoundMatches}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Start Next Round Matches
                  </button>
                  <button
                    onClick={() => {
                      console.log('Current tournament data:', tournamentData);
                      console.log('Current user:', user);
                      console.log('Socket connected:', !!socket);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Debug Info
                  </button>
                  <button
                    onClick={() => {
                      if (socket && user?.email) {
                        console.log('[Tournament] Testing socket connection for user:', user.email);
                        socket.emit('TestTournamentSocket', { 
                          tournamentId, 
                          playerEmail: user.email 
                        });
                      }
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Test Socket
                  </button>
                </div>
                <p className="text-gray-300 text-sm mt-2">
                  "Start All Current Round Matches" will start all waiting matches in the current round and send players directly to their ping pong games.
                </p>
              </div>
            )}

            {/* Participant status message */}
            {!isHost && (
              <div className="mb-6 p-4 bg-[#2a2f3a] rounded-lg border border-gray-600">
                <h3 className="text-white font-medium mb-2">Tournament Status</h3>
                <p className="text-gray-300 text-sm">
                  {tournamentData.participants.find(p => p.email === user?.email)?.status === 'eliminated' 
                    ? 'You have been eliminated from the tournament. You can still view the bracket.'
                    : 'Waiting for the host to start matches. You will be automatically redirected to your game when it starts.'
                  }
                </p>
                <button
                  onClick={() => {
                    if (socket && user?.email) {
                      console.log('[Tournament] Participant testing socket connection for user:', user.email);
                      socket.emit('TestTournamentSocket', { 
                        tournamentId, 
                        playerEmail: user.email 
                      });
                    }
                  }}
                  className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 rounded text-sm transition-colors"
                >
                  Test My Socket
                </button>
              </div>
            )}
            
            {/* Tournament Bracket Component */}
            <div className="overflow-x-auto">
              <TournamentBracket
                participants={tournamentData.participants}
                tournamentSize={tournamentData.size}
                matches={tournamentData.matches}
                currentRound={(() => {
                  // Find the current round based on matches that are waiting or in progress
                  const waitingMatches = tournamentData.matches.filter((m: any) => 
                    m.state === 'waiting' || m.state === 'in_progress'
                  )
                  if (waitingMatches.length > 0) {
                    return Math.min(...waitingMatches.map((m: any) => m.round))
                  }
                  // If no waiting matches, find the highest round with completed matches
                  const completedMatches = tournamentData.matches.filter((m: any) => 
                    m.state === 'player1_win' || m.state === 'player2_win'
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
          </div>
        )}

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