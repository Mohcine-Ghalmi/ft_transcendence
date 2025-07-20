"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { useGameInvite } from '../../OneVsOne/GameInviteProvider'
import { PingPongGame } from '../PingPongGame'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.gameId as string
  const { user } = useAuthStore()
  const { socket } = useGameInvite()
  
  const [gameData, setGameData] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [opponent, setOpponent] = useState<any>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameAccepted, setGameAccepted] = useState(false)
  const [startGameTimeout, setStartGameTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isLeavingGame, setIsLeavingGame] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authorizationChecked, setAuthorizationChecked] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [currentPath, setCurrentPath] = useState('');
  const [isTournamentMatch, setIsTournamentMatch] = useState(false);
  
  // Use refs to track the latest state in event handlers
  const gameStartedRef = useRef(gameStarted)
  const isLeavingGameRef = useRef(isLeavingGame)
  const isStartingGameRef = useRef(isStartingGame)
  
  useEffect(() => {
    gameStartedRef.current = gameStarted
  }, [gameStarted])
  
  useEffect(() => {
    isLeavingGameRef.current = isLeavingGame
  }, [isLeavingGame])

  useEffect(() => {
    isStartingGameRef.current = isStartingGame
  }, [isStartingGame])

  // Check game authorization on mount
  useEffect(() => {
    if (!socket || !gameId || !user?.email) return

    // Emit a check to see if user is authorized for this game
    socket.emit('CheckGameAuthorization', { 
      gameId, 
      playerEmail: user.email 
    })
    
    // Set a timeout for authorization check - extended for tournament matches
    const authTimeout = setTimeout(() => {
      if (!authorizationChecked && !isStartingGameRef.current) {
        setIsAuthorized(false)
        setAuthorizationChecked(true)
        setTimeout(() => {router.push("/play")}, 0);
      }
    }, 3000) // 3 second timeout - increased for tournament redirects

    return () => {
      clearTimeout(authTimeout)
    }
  }, [socket, gameId, user?.email, authorizationChecked])

  useEffect(() => {
    if (!socket || !gameId) return

    // Handle MatchFound event (for tournament and regular matches)
    const handleMatchFound = (data: any) => {
      if (data.gameId === gameId || data.gameRoomId === gameId) {
        // Match found - set up the game
        setIsAuthorized(true);
        setAuthorizationChecked(true);
        setGameAccepted(true);
        
        // Check if this is a tournament match
        if (data.isTournament || data.tournamentId) {
          setIsTournamentMatch(true);
        }
        
        // Set opponent data
        if (data.hostData && data.guestData) {
          const isCurrentUserHost = data.hostEmail === user?.email;
          const opponentData = isCurrentUserHost ? data.guestData : data.hostData;
          
          setOpponent({
            email: opponentData.email,
            username: opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar,
            login: opponentData.login || opponentData.nickname || opponentData.username || opponentData.email
          });
          
          setIsHost(isCurrentUserHost);
        }
      }
    };

    // Handle game found event (for tournament matches)
    const handleGameFound = (data: any) => {
      if (data.gameId === gameId || data.gameRoomId === gameId) {
        // Tournament match found - set up the game
        setIsAuthorized(true);
        setAuthorizationChecked(true);
        setGameAccepted(true);
        
        // Set opponent data
        if (data.opponent) {
          setOpponent({
            email: data.opponent.email,
            username: data.opponent.username || data.opponent.login || data.opponent.email,
            avatar: data.opponent.avatar,
            login: data.opponent.login || data.opponent.nickname || data.opponent.username || data.opponent.email
          });
        }
        
        // Set host status based on game room
        if (data.gameRoom) {
          setIsHost(data.gameRoom.hostEmail === user?.email);
        }
      }
    };

    // Handle GameStarting event (for immediate game start - tournament matches)
    const handleGameStarting = (data: any) => {
      if (data.gameId === gameId) {
        // Set up the game immediately for tournament matches
        setIsAuthorized(true);
        setAuthorizationChecked(true);
        setGameAccepted(true);
        setGameStarted(true);
        setGameData(data);
        
        // Check if this is a tournament match
        if (data.isTournament || data.tournamentId) {
          setIsTournamentMatch(true);
        }
        
        // Set opponent data using the hostData and guestData from the event
        if (data.hostData && data.guestData) {
          const isCurrentUserHost = data.hostEmail === user?.email;
          const opponentData = isCurrentUserHost ? data.guestData : data.hostData;
          
          setOpponent({
            email: opponentData.email,
            username: opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar,
            login: opponentData.login || opponentData.nickname || opponentData.username || opponentData.email
          });
          
          setIsHost(isCurrentUserHost);
        }
        
        // Clear any starting game timeouts
        if (startGameTimeout) {
          clearTimeout(startGameTimeout);
          setStartGameTimeout(null);
        }
        setIsStartingGame(false);
      }
    };

    const handleGameInviteAccepted = (data: any) => {
      if (data.gameId === gameId && data.status === 'ready_to_start') {
        setGameAccepted(true)
        
        // FIXED: Correct host detection logic
        // The guest receives hostData, the host receives guestData
        let isCurrentUserHost = false;
        let opponentData = null;
        
        if (data.hostData && data.hostData.email !== user?.email) {
          // We received hostData but it's not our email, so we are the guest
          isCurrentUserHost = false;
          opponentData = data.hostData;
        } else if (data.guestData && data.guestData.email !== user?.email) {
          // We received guestData but it's not our email, so we are the host
          isCurrentUserHost = true;
          opponentData = data.guestData;
        } else {
          // Fallback: check if we have any data and determine based on what we received
          if (data.hostData && !data.guestData) {
            // We received hostData, so we must be the guest
            isCurrentUserHost = false;
            opponentData = data.hostData;
          } else if (data.guestData && !data.hostData) {
            // We received guestData, so we must be the host
            isCurrentUserHost = true;
            opponentData = data.guestData;
          } else {
            return;
          }
        }
        
        setIsHost(isCurrentUserHost)
        
        // Set opponent data with null checks and fallbacks
        if (opponentData && (opponentData.username || opponentData.login || opponentData.email)) {
          setOpponent({
            email: opponentData.email,
            username: opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar ,
            login: opponentData.login || opponentData.nickname || opponentData.username || opponentData.email
          })
        }
      }
    }

    const handleGameStarted = (data: any) => {
      if (data.gameId === gameId) {
        setGameStarted(true)
        setGameData(data)
        
        // Check if this is a tournament match
        if (data.isTournament || data.tournamentId) {
          setIsTournamentMatch(true);
        }
        
        // Clear the starting game flag
        setIsStartingGame(false)
        
        // Clear the timeout since game started successfully
        if (startGameTimeout) {
          clearTimeout(startGameTimeout)
          setStartGameTimeout(null)
        }
        
        // Set opponent data using the hostData and guestData from the event
        if (data.hostData && data.guestData) {
          const isCurrentUserHost = data.players?.host === user?.email || data.hostEmail === user?.email;
          const opponentData = isCurrentUserHost ? data.guestData : data.hostData
          
          setOpponent({
            email: opponentData.email,
            username: opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar,
            login: opponentData.login || opponentData.nickname || opponentData.username || opponentData.email
          })
          
          // Set host status
          setIsHost(isCurrentUserHost)
        } else if (!opponent && data.players) {
          // Fallback if hostData/guestData not available
          const isCurrentUserHost = data.players.host === user?.email
          const opponentEmail = isCurrentUserHost ? data.players.guest : data.players.host
          setOpponent({
            email: opponentEmail,
            username: opponentEmail, // This should be fetched from user data
            avatar: user?.avatar,
            login: opponentEmail
          })
          
          // Also set host status if not already set
          if (!isHost && isCurrentUserHost) {
            setIsHost(true)
          }
        }
      }
    }

    const handleGameStateUpdate = (data: any) => {
      if (data.gameId === gameId) {
        setGameData(data)
      }
    }

    // Add listener for GameStartResponse to debug
    const handleGameStartResponse = (data: any) => {
      if (data.status !== 'success') {
        if (startGameTimeout) {
          clearTimeout(startGameTimeout)
          setStartGameTimeout(null)
        }
        setIsStartingGame(false)
      }
    }

    const handlePlayerLeft = (data: any) => {
      if (data.gameId === gameId) {
        
        if (!isLeavingGameRef.current) {
          if (data.isTournament || data.isTournamentMatch || isTournamentMatch) {
            router.push(`/play/tournament/${data.tournamentId}`);
          } else {
            const winnerName = user?.username || user?.login || 'You';
            const loserName = data.playerWhoLeft || 'Opponent';
            router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
          }
        }
      }
    }

    // Handle game ended - FIXED
    const handleGameEnded = (data: any) => {
      if (data.gameId === gameId) {
        
        // For tournament matches, handle differently
        if (data.isTournament || data.isTournamentMatch || isTournamentMatch) {
          setTimeout(() => {
            router.push(`/play/tournament/${data.tournamentId}`);
          }, 1000); // Small delay to allow any final state updates
          
        } else {
          const isWinner = data.winner === user?.email;
          const winnerName = isWinner ? (user?.username || user?.login || 'You') : (data.winner || 'Opponent');
          const loserName = isWinner ? (data.loser || 'Opponent') : (user?.username || user?.login || 'You');
          
          if (isWinner) {
            router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
          } else {
            router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
          }
        }
      }
    }

    // Handle game canceled - FIXED
    const handleGameCanceled = (data: any) => {
      if (data.gameId === gameId) {
        // Only redirect if we're not the one canceling
        if (!isLeavingGameRef.current) {
          setIsLeavingGame(true)
          setTimeout(() => {router.push("/play")}, 0);
        }
      }
    }

    // Handle game authorization response
    const handleGameAuthorizationResponse = (data: any) => {
      setAuthorizationChecked(true)
      
      if (data.status === 'success' && data.authorized) {
        setIsAuthorized(true)
        
        // Check if game is in a valid state
        if (data.gameStatus === 'canceled' || data.gameStatus === 'completed') {
          setTimeout(() => {router.push("/play")}, 0);
          return
        }
        
        // Handle ongoing tournament match - set up game immediately
        if ((data.gameStatus === 'playing' || data.gameStatus === 'accepted' || data.gameStatus === 'waiting') && 
            (data.isTournament || data.tournamentId) && data.gameRoom) {
          
          // Set tournament match flag
          setIsTournamentMatch(true);
          
          // Set game as accepted
          setGameAccepted(true);
          
          // If game has already started or has game state, set it as started
          if (data.gameStatus === 'playing' || data.gameState) {
            setGameStarted(true);
          }
          
          // Set host status
          setIsHost(data.isHost || data.gameRoom.hostEmail === user?.email);
          
          // Set opponent data
          const opponentEmail = data.isHost 
            ? data.gameRoom.guestEmail 
            : data.gameRoom.hostEmail;
          
          // Try to get opponent data from response or use email as fallback
          const opponentData = data.opponent || {};
          setOpponent({
            email: opponentEmail,
            username: opponentData.username || opponentData.login || opponentEmail.split('@')[0],
            avatar: opponentData.avatar,
            login: opponentData.login || opponentData.username || opponentEmail.split('@')[0]
          });
          
          // Set the game data if we have state or create basic data
          if (data.gameState || data.gameStatus === 'playing') {
            setGameData({
              gameId: data.gameRoom.gameId || gameId,
              isTournament: data.isTournament || !!data.tournamentId,
              tournamentId: data.tournamentId,
              matchId: data.matchId,
              gameState: data.gameState,
              players: {
                host: data.gameRoom.hostEmail,
                guest: data.gameRoom.guestEmail
              },
              hostData: {
                email: data.gameRoom.hostEmail,
                username: data.gameRoom.hostEmail.split('@')[0],
                avatar: user?.avatar,
                login: data.gameRoom.hostEmail.split('@')[0]
              },
              guestData: {
                email: data.gameRoom.guestEmail,
                username: data.gameRoom.guestEmail.split('@')[0],
                avatar: user?.avatar,
                login: data.gameRoom.guestEmail.split('@')[0]
              }
            });
          }
          
          return;
        }
        
      } else {
        setIsAuthorized(false)
        // Don't redirect if we're in the process of starting the game or if this might be a tournament match
        if (!isStartingGameRef.current) {
          // Give more time for tournament matches to set up
          setTimeout(() => {
            if (!gameAccepted && !gameStarted) {
              router.push("/play");
            }
          }, 2000);
        }
      }
    }

    // Handle tournament player forfeit
    const handleTournamentPlayerForfeited = (data: any) => {
      if (data.tournamentId && (isTournamentMatch || gameData?.tournamentId === data.tournamentId)) {
        // If the current user was in this match, redirect to tournament
        const userWasInMatch = data.affectedMatch && 
          (data.affectedMatch.player1?.email === user?.email || 
           data.affectedMatch.player2?.email === user?.email);
        
        if (userWasInMatch) {
          // Small delay to allow for any state updates
          setTimeout(() => {
            router.push(`/play/tournament/${data.tournamentId}`);
          }, 1000);
        }
      }
    };

    socket.on('MatchFound', handleMatchFound)
    socket.on('GameFound', handleGameFound)
    socket.on('GameStarting', handleGameStarting)
    socket.on('GameInviteAccepted', handleGameInviteAccepted)
    socket.on('GameStarted', handleGameStarted)
    socket.on('GameStateUpdate', handleGameStateUpdate)
    socket.on('GameStartResponse', handleGameStartResponse)
    socket.on('PlayerLeft', handlePlayerLeft)
    socket.on('GameEnded', handleGameEnded)
    socket.on('GameCanceled', handleGameCanceled)
    socket.on('GameAuthorizationResponse', handleGameAuthorizationResponse)
    socket.on('TournamentPlayerForfeited', handleTournamentPlayerForfeited)

    return () => {
      socket.off('MatchFound', handleMatchFound)
      socket.off('GameFound', handleGameFound)
      socket.off('GameStarting', handleGameStarting)
      socket.off('GameInviteAccepted', handleGameInviteAccepted)
      socket.off('GameStarted', handleGameStarted)
      socket.off('GameStateUpdate', handleGameStateUpdate)
      socket.off('GameStartResponse', handleGameStartResponse)
      socket.off('PlayerLeft', handlePlayerLeft)
      socket.off('GameEnded', handleGameEnded)
      socket.off('GameCanceled', handleGameCanceled)
      socket.off('GameAuthorizationResponse', handleGameAuthorizationResponse)
      socket.off('TournamentPlayerForfeited', handleTournamentPlayerForfeited)
      
      // Clean up timeout
      if (startGameTimeout) {
        clearTimeout(startGameTimeout)
      }
    }
  }, [socket, gameId, user?.email])

  useEffect(() => {
    let hasUnloaded = false

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (socket && gameId && user?.email && !isLeavingGameRef.current && !hasUnloaded) {
        hasUnloaded = true
        setIsLeavingGame(true)
        
        const leaveData = {
          gameId, 
          playerEmail: user.email,
          reason: 'page_refresh'
        };
        
        if (isTournamentMatch && gameData?.tournamentId) {
          (leaveData as any).tournamentId = gameData.tournamentId;
          (leaveData as any).isTournamentMatch = true;
        }
        
        socket.emit('LeaveGame', leaveData)
        
        if (gameStartedRef.current) {
          e.preventDefault()
          const message = isTournamentMatch 
            ? 'Are you sure you want to leave the tournament match? You will be eliminated and your opponent will advance.'
            : 'Are you sure you want to leave the game? This will result in a loss.';
          e.returnValue = message
          return message
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnloaded) {
        if (socket && gameId && user?.email && !isLeavingGameRef.current) {
          setIsLeavingGame(true)
          
          const leaveData = {
            gameId, 
            playerEmail: user.email,
            reason: 'tab_change'
          };
          
          if (isTournamentMatch && gameData?.tournamentId) {
            (leaveData as any).tournamentId = gameData.tournamentId;
            (leaveData as any).isTournamentMatch = true;
          }
          
          socket.emit('LeaveGame', leaveData)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [socket, gameId, user?.email])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (startGameTimeout) {
        clearTimeout(startGameTimeout)
      }
    }
  }, [startGameTimeout])

  const handleStartGame = () => {
    if (socket && gameId && !isLeavingGame) {
      // Set starting game flag to prevent redirects
      setIsStartingGame(true)
      
      socket.emit('StartGame', { gameId })
      
      // Don't set gameStarted immediately - wait for GameStarted event from server
      // setGameStarted(true); // REMOVED - wait for server confirmation
      
      // Set a timeout in case the GameStarted event doesn't arrive
      const timeout = setTimeout(() => {
        if (!isLeavingGame) {
          setGameStarted(true)
          setIsStartingGame(false) // Clear the flag
        }
        setStartGameTimeout(null)
      }, 1000) // 5 second timeout
      
      setStartGameTimeout(timeout)
    }
  }

  const handleCancelGame = () => {
    if (socket && gameId && !isLeavingGame) {
      setTimeout(() => {setIsLeavingGame(true), 0});
      
      // Include tournament information if this is a tournament match
      const leaveData = {
        gameId, 
        playerEmail: user?.email,
        reason: 'player_cancelled_game'
      };
      
      if (isTournamentMatch && gameData?.tournamentId) {
        (leaveData as any).tournamentId = gameData.tournamentId;
        (leaveData as any).isTournamentMatch = true;
      }
      
      socket.emit('LeaveGame', leaveData)
    }
  }

  const handleGameEnd = () => {
    setIsLeavingGame(true)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      
      // Handle route changes when player leaves the game page
      if (currentPath && newPath !== currentPath) {
        if (gameId && socket && user?.email) {
          handleCancelGame();
          
          // Player left during active game - mark as lost
          const leaveData = {
            gameId, 
            playerEmail: user.email,
            reason: 'player_left_page'
          };
          
          if (isTournamentMatch && gameData?.tournamentId) {
            (leaveData as any).tournamentId = gameData.tournamentId;
            (leaveData as any).isTournamentMatch = true;
          }
          
          socket.emit('LeaveGame', leaveData);
        } else if (gameAccepted && gameId && socket && user?.email) {
          // Player left while waiting to start - emit appropriate event for both host and guest
          const leaveData = {
            gameId, 
            playerEmail: user.email,
            reason: 'player_left_waiting_page'
          };
          
          if (isTournamentMatch && gameData?.tournamentId) {
            (leaveData as any).tournamentId = gameData.tournamentId;
            (leaveData as any).isTournamentMatch = true;
          }
          
          if (isHost) {
            // Host leaving - emit both events to ensure guest gets notified
            socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email });
            socket.emit('LeaveGame', leaveData);
          } else {
            socket.emit('LeaveGame', leaveData);
          }
        }
      }
      
      setTimeout(() => setCurrentPath(newPath), 0);
    };

    const handleBeforeUnload = (e) => {
      // Handle page refresh/close for different game states
      if (gameId && socket && user?.email) {
        // Show confirmation dialog for active games
        e.preventDefault();
        const message = isTournamentMatch 
          ? 'Are you sure you want to leave the tournament match? You will be eliminated and your opponent will advance.'
          : 'Are you sure you want to leave the game? This will result in a loss.';
        e.returnValue = message;
        
        // Emit leave event with tournament info
        const leaveData = {
          gameId, 
          playerEmail: user.email,
          reason: 'player_closed_page'
        };
        
        if (isTournamentMatch && gameData?.tournamentId) {
          (leaveData as any).tournamentId = gameData.tournamentId;
          (leaveData as any).isTournamentMatch = true;
        }
        
        socket.emit('LeaveGame', leaveData);
        
        return message;
      } else if (gameAccepted && gameId && socket && user?.email) {
        // Both host and guest should emit appropriate events when leaving waiting room
        const leaveData = {
          gameId, 
          playerEmail: user.email,
          reason: 'player_closed_waiting_room'
        };
        
        if (isTournamentMatch && gameData?.tournamentId) {
          (leaveData as any).tournamentId = gameData.tournamentId;
          (leaveData as any).isTournamentMatch = true;
        }
        
        if (isHost) {
          // Host leaving - emit both events to ensure guest gets notified
          socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email });
          socket.emit('LeaveGame', leaveData);
        } else {
          socket.emit('LeaveGame', leaveData);
        }
      }
    };

    const handleVisibilityChange = () => {
      // Handle when user navigates to another tab or minimizes browser
      if (document.visibilityState === 'hidden') {
        if (gameId && socket && user?.email) {
          // Player left during active game - mark as lost
          handleCancelGame();
          
          const leaveData = {
            gameId, 
            playerEmail: user.email,
            reason: 'player_changed_tab'
          };
          
          if (isTournamentMatch && gameData?.tournamentId) {
            (leaveData as any).tournamentId = gameData.tournamentId;
            (leaveData as any).isTournamentMatch = true;
          }
          
          socket.emit('LeaveGame', leaveData);
        } else if (gameAccepted && gameId && socket && user?.email) {
          // Both host and guest should emit appropriate events when leaving waiting room
          handleCancelGame();
          
          const leaveData = {
            gameId, 
            playerEmail: user.email,
            reason: 'player_changed_tab_waiting'
          };
          
          if (isTournamentMatch && gameData?.tournamentId) {
            (leaveData as any).tournamentId = gameData.tournamentId;
            (leaveData as any).isTournamentMatch = true;
          }
          
          if (isHost) {
            // Host leaving - emit both events to ensure guest gets notified
            socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email });
            socket.emit('LeaveGame', leaveData);
          } else {
            socket.emit('LeaveGame', leaveData);
          }
        }
      }
    };

    const handlePopState = () => {
      handleRouteChange();
    };

    // Listen for route changes
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen for pushState and replaceState (for programmatic navigation)
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
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [currentPath, gameAccepted, gameId, isHost, socket, user]);

  // Check authorization first - redirect unauthorized users
  if (authorizationChecked && !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access this game.</p>
          <button 
            onClick={() => window.location.href = '/play'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Play
          </button>
        </div>
      </div>
    )
  }

  // Show loading while checking authorization
  if (!authorizationChecked) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Checking Game Access...</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4">Verifying your access to this game...</p>
        </div>
      </div>
    )
  }

  // If game is started, show the game
  if (gameStarted && opponent && !isLeavingGame) {
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Game not found or you don't have permission to join</h1>
            <button 
              onClick={() => setTimeout(() => router.push("/play"), 0)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Back to Play
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-7xl">
          <PingPongGame
            player1={user}
            player2={opponent}
            onExit={handleGameEnd}
            gameId={gameId}
            socket={socket}
            isHost={isHost}
            opponent={opponent}
            isTournamentMode={isTournamentMatch || gameData?.isTournament || gameData?.tournamentId ? true : false}
          />
        </div>
      </div>
    )
  }

  // If game is accepted but not started, show waiting room
  if (gameAccepted && opponent && !isLeavingGame) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">
            {isTournamentMatch ? "Tournament Match Ready!" : "Game Ready!"}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
            {/* Player 1 - Current User */}
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
                {isHost ? "Host (You)" : "Player 1"}
              </h3>
              <div className="mb-8">
                <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-6">
                  <img
                    src={`/images/${user?.avatar}`}
                    alt={user?.username}
                    className="w-full h-full rounded-full object-cover border-4 border-[#4a5568]"
                  />
                </div>
                <h4 className="text-white font-semibold text-2xl md:text-3xl">
                  {user?.username}
                </h4>
                <p className="text-gray-400 text-lg md:text-xl">@{user?.login}</p>
              </div>
            </div>

            {/* Player 2 - Opponent */}
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
                {!isHost ? "Host" : "Player 2"}
              </h3>
              <div className="mb-8">
                <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-6">
                  <img
                    src={`/images/${opponent.avatar}`}
                    alt={opponent.username}
                    className="w-full h-full rounded-full object-cover border-4 border-[#4a5568]"
                  />
                </div>
                <h4 className="text-white font-semibold text-2xl md:text-3xl">
                  {opponent.username}
                </h4>
                <p className="text-gray-400 text-lg md:text-xl">@{opponent.login}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-xl text-green-400 mb-4">🎮 Both players are ready!</p>
            <p className="text-gray-300">
              {isTournamentMatch 
                ? "Tournament match starting automatically..."
                : isHost 
                ? "You are the host. You can start the game when ready." 
                : "Waiting for host to start the game..."
              }
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            {!isTournamentMatch && isHost && (
              <button
                onClick={handleStartGame}
                disabled={isLeavingGame}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-colors"
              >
                Start Game
              </button>
            )}
            {!isTournamentMatch && (
              <button
                onClick={handleCancelGame}
                disabled={isLeavingGame}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors"
              >
                Leave Game
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // If game is started but no opponent data, show a fallback
  if (gameStarted && !opponent && !isLeavingGame) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Game Starting...</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4">Setting up the game...</p>
        </div>
      </div>
    )
  }

  // If we're in the process of leaving, show a leaving message
  if (isLeavingGame) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Leaving game...</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  // If still waiting for game to be accepted
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Waiting for game to start...</h1>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
        <p className="text-gray-400 mt-4">Please wait while the game is being set up...</p>
      </div>
    </div>
  )
}