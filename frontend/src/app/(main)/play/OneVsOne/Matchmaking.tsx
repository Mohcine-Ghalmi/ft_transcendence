"use client"
import React, { useState, useEffect } from 'react';
import { useAuthStore, getSocketInstance } from '@/(zustand)/useAuthStore';
import { PingPongGame } from '../game/PingPongGame';
import { useRouter } from 'next/navigation';

interface MatchmakingProps {
  onBack: () => void;
}

const MatchmakingStatus = ({ status, queuePosition, totalInQueue }: { 
  status: string; 
  queuePosition?: number; 
  totalInQueue?: number; 
}) => {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
      <h2 className="text-2xl font-semibold text-white mb-2">{status}</h2>
      {queuePosition && totalInQueue && (
        <p className="text-gray-400">
          Position: {queuePosition} of {totalInQueue} players
        </p>
      )}
    </div>
  );
};

export default function Matchmaking({ onBack }: MatchmakingProps) {
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'searching' | 'in_game'>('idle');
  const [queuePosition, setQueuePosition] = useState(0);
  const [totalInQueue, setTotalInQueue] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<{
    gameId: string;
    hostEmail: string;
    guestEmail: string;
  } | null>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCleanupOption, setShowCleanupOption] = useState(false);
  
  const { user } = useAuthStore();
  const socket = getSocketInstance();
  const router = useRouter();

  // Track current pathname to detect route changes
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Set initial path
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Handle route changes and page navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      // If the path has changed and we're in a game, trigger exit
      if (currentPath && newPath !== currentPath && matchmakingStatus === 'in_game' && gameId) {
        console.log('Route change detected, leaving game...');
        handleGameExit();
      }
      setTimeout(() => setCurrentPath(newPath), 0);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If we're in a game, trigger exit
      if (matchmakingStatus === 'in_game' && gameId) {
        handleGameExit();
      }
    };

    const handlePopState = () => {
      // Handle browser back/forward buttons
      handleRouteChange();
    };

    // Listen for route changes
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

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
      
      // Restore original methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [currentPath, matchmakingStatus, gameId]);

  // Function to handle game exit (triggered by route change or manual exit)
  const handleGameExit = () => {
    if (socket && gameId && user?.email) {
      // If in game, notify server that player left
      if (matchmakingStatus === 'in_game') {
        socket.emit('LeaveGame', { 
          gameId, 
          playerEmail: user.email 
        });
      } else if (matchmakingStatus === 'searching') {
        socket.emit('LeaveMatchmaking', { email: user.email });
      }
    }
    // Reset state
    // setMatchmakingStatus('idle');
    // setGameId(null);
    // setMatchData(null);
    // setOpponent(null);
    // setIsHost(false);
  };

   useEffect(() => {
      const handleBeforeUnload = () => {
        // If we're in a game, notify the server that we're leaving
        if (socket && gameId && user?.email) {
          socket.emit('LeaveGame', { 
            gameId, 
            playerEmail: user.email 
          });
        }
      };
  
      const handleVisibilityChange = () => {
        // If page becomes hidden (user switches tabs or minimizes), treat as leaving
        if (document.hidden && socket && gameId && user?.email) {
          socket.emit('LeaveGame', { 
            gameId, 
            playerEmail: user.email 
          });
        }
      };
  
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
  
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [socket, gameId, user?.email]);

  useEffect(() => {
    if (!socket || !user?.email) return;

    // Join matchmaking
    const joinMatchmaking = () => {
      socket.emit('JoinMatchmaking', { email: user.email });
      setMatchmakingStatus('searching');
    };

    // Socket event listeners
    const handleMatchmakingResponse = (data: any) => {
      if (data.status === 'success') {
        if (data.queuePosition) {
          setQueuePosition(data.queuePosition);
        }
        setErrorMessage('');
        setShowCleanupOption(false);
      } else {
        setMatchmakingStatus('idle');
        setErrorMessage(data.message || 'Failed to join matchmaking');
        
        // Show cleanup option if user is already in a game
        if (data.message && data.message.includes('already in a game')) {
          setShowCleanupOption(true);
          // Automatically try to clean up and retry
          setTimeout(() => {
            if (socket && user?.email) {
              socket.emit('CleanupGameData', { email: user.email });
            }
          }, 0);
        }
      }
    };

    const handleQueueStatusResponse = (data: any) => {
      if (data.status === 'success') {
        setQueuePosition(data.queuePosition || 0);
        setTotalInQueue(data.totalInQueue || 0);
      }
    };

    const handleMatchFound = (data: any) => {
      // Check if user is being matched with themselves
      if (data.hostEmail === data.guestEmail) {
        console.error('Self-match detected:', data);
        setErrorMessage('Matchmaking error: Cannot match with yourself. Please try again.');
        setMatchmakingStatus('idle');
        return;
      }

      setMatchData(data);
      setGameId(data.gameId);
      setIsHost(data.hostEmail === user.email);
      setOpponent({
        name: data.hostEmail === user.email ? data.guestEmail : data.hostEmail,
        email: data.hostEmail === user.email ? data.guestEmail : data.hostEmail,
        avatar: '/avatar/Default.svg'
      });
      
      // Directly go to game without showing modal
      setMatchmakingStatus('in_game');
    };

    const handleGameStarting = (data: any) => {
      setMatchmakingStatus('in_game');
    };

    const handleGameEnded = (data: any) => {
      setMatchmakingStatus('idle');
      setGameId(null);
      setMatchData(null);
      setOpponent(null);
      setIsHost(false);
      
      // Determine if current user won
      const isWinner = data.winner === user?.email;
      const winnerName = isWinner ? (user?.username || user?.name || 'You') : (data.winner || 'Opponent');
      const loserName = isWinner ? (data.loser || 'Opponent') : (user?.username || user?.name || 'You');
      
      // Show game result message
      if (data.message) {
        setErrorMessage(data.message);
        // Clear message after 5 seconds
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      }
      
      // Redirect to appropriate result page based on whether user won or lost
      if (isWinner) {
        router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      } else {
        router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      }
    };

    const handleCleanupResponse = (data: any) => {
      if (data.status === 'success') {
        setErrorMessage('');
        setShowCleanupOption(false);
        
        // Show cleanup details
        if (data.details && data.details.length > 0) {
          const details = data.details.map((d: any) => 
            `${d.roomKey}: ${d.status || d.error} (${d.age || 'unknown'} min old)`
          ).join('\n');
          
        }           
        // Automatically retry joining matchmaking after cleanup
        setTimeout(() => {
          if (socket && user?.email) {
            socket.emit('JoinMatchmaking', { email: user.email });
            setMatchmakingStatus('searching');
          }
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Failed to clean up game data');
      }
    };

    // Listen for game ended due to opponent leaving before game start
    socket.on('GameEndedByOpponentLeave', (data: any) => {
      if (data.winner === user.email) {
        setErrorMessage('You win! Opponent left before the game started.');
      } else if (data.leaver === user.email) {
        setErrorMessage('You are already in an active game. Please finish or leave your current game first.');
      }
      setMatchmakingStatus('idle');
      setGameId(null);
      setMatchData(null);
      setOpponent(null);
      setIsHost(false);
    });

    // Add event listeners
    socket.on('MatchmakingResponse', handleMatchmakingResponse);
    socket.on('QueueStatusResponse', handleQueueStatusResponse);
    socket.on('MatchFound', handleMatchFound);
    socket.on('GameStarting', handleGameStarting);
    socket.on('GameEnded', handleGameEnded);
    socket.on('CleanupResponse', handleCleanupResponse);
    // Listen for player leaving during countdown
    socket.on('MatchmakingPlayerLeft', (data: any) => {
      setMatchmakingStatus('idle');
      setGameId(null);
      setMatchData(null);
      setOpponent(null);
      setIsHost(false);
      setErrorMessage('The other player left before the game started.');
    });

    // Join matchmaking on mount
    joinMatchmaking();

    // Cleanup event listeners on unmount
    return () => {
      socket.off('MatchmakingResponse', handleMatchmakingResponse);
      socket.off('QueueStatusResponse', handleQueueStatusResponse);
      socket.off('MatchFound', handleMatchFound);
      socket.off('GameStarting', handleGameStarting);
      socket.off('GameEnded', handleGameEnded);
      socket.off('CleanupResponse', handleCleanupResponse);
      socket.off('MatchmakingPlayerLeft');
      socket.off('GameEndedByOpponentLeave');
      
      // Use the centralized exit function
      handleGameExit();
    };
  }, [socket, user?.email, router]);

  // Handle page refresh and disconnection
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If page becomes hidden (user switches tabs or minimizes), don't leave game immediately
      // Only leave if the page is being unloaded
      if (document.visibilityState === 'hidden') {
        // Don't automatically leave - let the user decide
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle automatic retry for matchmaking
  useEffect(() => {
    if (!socket || !user?.email) return;

    // Check if user was previously in matchmaking (from localStorage or session)
    const wasInMatchmaking = sessionStorage.getItem('wasInMatchmaking') === 'true';
    const lastMatchmakingTime = sessionStorage.getItem('lastMatchmakingTime');
    
    if (wasInMatchmaking && lastMatchmakingTime) {
      const timeSinceLastMatchmaking = Date.now() - parseInt(lastMatchmakingTime);
      
      // If it's been less than 5 minutes, automatically retry
      if (timeSinceLastMatchmaking < 5 * 60 * 1000) {
        console.log('User was previously in matchmaking, automatically retrying...');
        setMatchmakingStatus('searching');
        socket.emit('JoinMatchmaking', { email: user.email });
      } else {
        // Clear old session data
        sessionStorage.removeItem('wasInMatchmaking');
        sessionStorage.removeItem('lastMatchmakingTime');
      }
    }

    // Store matchmaking state when component mounts
    sessionStorage.setItem('wasInMatchmaking', 'true');
    sessionStorage.setItem('lastMatchmakingTime', Date.now().toString());

    return () => {
      // Clear session data when component unmounts
      sessionStorage.removeItem('wasInMatchmaking');
      sessionStorage.removeItem('lastMatchmakingTime');
    };
  }, [socket, user?.email]);

  // Handle socket reconnection
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Socket reconnected, checking matchmaking status...');
      
      // If user was in matchmaking, retry joining
      if (user?.email && matchmakingStatus === 'searching') {
        socket.emit('JoinMatchmaking', { email: user.email });
      }
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, user?.email, matchmakingStatus]);

  const handleLeaveMatchmaking = () => {
    if (socket && user?.email && matchmakingStatus === 'in_game' && gameId) {
      // Notify backend that player left before game started
      socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email });
    } else if (socket && user?.email) {
      socket.emit('LeaveMatchmaking', { email: user.email });
    }
    setMatchmakingStatus('idle');
    onBack();
  };

  const handleGameEnd = () => {
    setMatchmakingStatus('idle');
    setGameId(null);
    setMatchData(null);
    setOpponent(null);
    setIsHost(false);
    // Don't call onBack() here - let the socket events handle redirects to win/loss pages
  };

  const handleCleanupGameData = () => {
    if (socket && user?.email) {
      socket.emit('CleanupGameData', { email: user.email });
    }
  };

  // If in game, show the game component
  if (matchmakingStatus === 'in_game' && gameId && opponent) {
    return (
       <div className="h-full text-white">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        <PingPongGame
          player1={user}
          player2={opponent}
          onExit={handleGameEnd}
          gameId={gameId}
          socket={socket}
          isHost={isHost}
          opponent={opponent}
        />
        </div>
        </div>
        </div>
    );
  }

  return (
    <div className="h-full text-white flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      {/* Main Content */}
      <div className="flex items-center justify-center w-full h-full px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Random Matchmaking</h1>
          
          {matchmakingStatus === 'searching' && (
            <>
              <MatchmakingStatus 
                status="Searching for opponent..." 
                queuePosition={queuePosition}
                totalInQueue={totalInQueue}
              />
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLeaveMatchmaking}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Cancel Search
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}