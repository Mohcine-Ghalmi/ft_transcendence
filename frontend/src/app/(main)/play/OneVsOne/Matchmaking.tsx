"use client"
import React, { useState, useEffect } from 'react';
import { useAuthStore } from "@/(zustand)/useAuthStore";
import { getSocketInstance } from "@/(zustand)/useAuthStore";
import { PingPongGame } from '../game/PingPongGame';
import { useRouter } from 'next/navigation';

interface MatchmakingProps {
  onBack: () => void;
}

// Game Result Popup Component
const GameResultPopup = ({ isVisible, onComplete }: { isVisible: boolean; onComplete: () => void }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isVisible) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-[#2a2f3a] flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Calculating Match Result</h2>
          <p className="text-gray-300 mb-4">Please wait while we process your game data...</p>
        </div>
      </div>
    </div>
  );
};

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
      <p className="text-white text-lg">{status}</p>
      {/* {queuePosition !== undefined && totalInQueue !== undefined && (
        <p className="text-gray-400 text-sm mt-2">
          Position: {queuePosition} / {totalInQueue}
        </p>
      )} */}
    </div>
  );
};

export default function Matchmaking({ onBack }: MatchmakingProps) {
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'preparing' | 'searching' | 'in_game' | 'waiting_to_start'>('idle');
  const [queuePosition, setQueuePosition] = useState(0);
  const [totalInQueue, setTotalInQueue] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [showCleanupOption, setShowCleanupOption] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<{ isWinner: boolean; winnerName: string; loserName: string } | null>(null);
  const [roomPreparationCountdown, setRoomPreparationCountdown] = useState(5);
  
  const { user } = useAuthStore();
  const socket = getSocketInstance();
  const router = useRouter();
  
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
      
      // Handle different matchmaking states when player leaves
      if (currentPath && newPath !== currentPath) {
        if (matchmakingStatus === 'preparing') {
          // Player left during room preparation - cancel matchmaking
          if (socket && user?.email) {
            socket.emit('LeaveMatchmaking', { email: user.email });
          }
        } else if (matchmakingStatus === 'searching') {
          // Player left during searching - cancel matchmaking
          if (socket && user?.email) {
            socket.emit('LeaveMatchmaking', { email: user.email });
          }
        } else if (matchmakingStatus === 'in_game' && gameId) {
          // Player left during game - handle game exit
          handleGameExit();
          handleLeaveMatchmaking();
        }
      }
      
      setTimeout(() => setCurrentPath(newPath), 0);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Handle page refresh/close for different matchmaking states
      if (matchmakingStatus === 'preparing') {
        // Player leaving during room preparation - cancel matchmaking
        if (socket && user?.email) {
          socket.emit('LeaveMatchmaking', { email: user.email });
        }
      } else if (matchmakingStatus === 'searching') {
        // Player leaving during searching - cancel matchmaking
        if (socket && user?.email) {
          socket.emit('LeaveMatchmaking', { email: user.email });
        }
      } else if (matchmakingStatus === 'in_game' && gameId) {
        // Show confirmation dialog for active games
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the game? This will result in a loss.';
        
        // Emit leave event
        handleGameExit();
        handleLeaveMatchmaking();
        
        return 'Are you sure you want to leave the game? This will result in a loss.';
      }
    };

    const handlePopState = () => {
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
  }, [currentPath, matchmakingStatus, gameId, isHost, socket, user]);

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

  // Handle result popup completion
  const handleResultPopupComplete = () => {
    setTimeout(() => setShowResultPopup(false), 0);
    if (pendingRedirect) {
      const { isWinner, winnerName, loserName } = pendingRedirect;
      if (isWinner) {
        router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      } else {
        router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      }
      setPendingRedirect(null);
    }
  };

  // Room preparation countdown effect
  useEffect(() => {
    if (matchmakingStatus === 'preparing') {
      const timer = setInterval(() => {
        setRoomPreparationCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Start actual matchmaking after countdown
            if (socket && user?.email) {
              socket.emit('JoinMatchmaking', { email: user.email });
              setMatchmakingStatus('searching');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [matchmakingStatus, socket, user?.email]);

  useEffect(() => {
    if (!socket || !user?.email) return;

    // Start with room preparation phase (5-second delay)
    const startMatchmaking = () => {
      setMatchmakingStatus('preparing');
      setRoomPreparationCountdown(5);
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
      
      // Use real player data with login and avatar
      const opponentData = data.hostEmail === user.email ? data.guestData : data.hostData;
      setOpponent({
        name: opponentData?.username || opponentData?.login || 'Opponent',
        login: opponentData?.login || 'opponent',
        email: data.hostEmail === user.email ? data.guestEmail : data.hostEmail,
        avatar: opponentData?.avatar || '/avatar/Default.svg'
      });
      
      // Set status to waiting for game to start
      setMatchmakingStatus('waiting_to_start');
    };

    const handleGameStarting = (data: any) => {
      setGameId(data.gameId);
      setMatchmakingStatus('in_game');
    };

    const handleGameEnded = (data: any) => {
      console.log('Game ended:', data);
      setShowResultPopup(true);
      
      // Set pending redirect data
      setPendingRedirect({
        isWinner: data.winner === user?.email,
        winnerName: data.winnerName || 'Winner',
        loserName: data.loserName || 'Loser'
      });
    };

    const handleMatchmakingPlayerLeft = (data: any) => {
      console.log('Opponent left during matchmaking:', data);
      setErrorMessage('Opponent disconnected before the game started.');
      setMatchmakingStatus('idle');
      setGameId(null);
      setMatchData(null);
      setOpponent(null);
      setIsHost(false);
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
            startMatchmaking();
          }
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Failed to clean up game data');
      }
    };

    // Listen for player leaving during countdown
    socket.on('MatchmakingPlayerLeft', handleMatchmakingPlayerLeft);

    // Listen for match expired
    socket.on('MatchExpired', (data: any) => {
      setMatchmakingStatus('idle');
      setGameId(null);
      setMatchData(null);
      setOpponent(null);
      setIsHost(false);
      setErrorMessage('Match expired. Please try again.');
      
      // Navigate back to play page after a short delay
      setTimeout(() => {
        onBack();
      }, 2000);
    });

    // Listen for match declined
    socket.on('MatchDeclined', (data: any) => {
      setMatchmakingStatus('idle');
      setGameId(null);
      setMatchData(null);
      setOpponent(null);
      setIsHost(false);
      setErrorMessage('Opponent declined the match.');
      
      // Navigate back to play page after a short delay
      setTimeout(() => {
        onBack();
      }, 2000);
    });

    // Listen for player ready notification
    socket.on('PlayerReady', (data: any) => {
      setErrorMessage('Opponent is ready! Waiting for you to confirm...');
    });

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
      
      // Navigate back to play page after a short delay
      setTimeout(() => {
        onBack();
      }, 2000);
    });

    // Add event listeners
    socket.on('MatchmakingResponse', handleMatchmakingResponse);
    socket.on('QueueStatusResponse', handleQueueStatusResponse);
    socket.on('MatchFound', handleMatchFound);
    socket.on('GameStarting', handleGameStarting);
    socket.on('GameEnded', handleGameEnded);
    socket.on('CleanupResponse', handleCleanupResponse);
    socket.on('MatchmakingPlayerLeft', handleMatchmakingPlayerLeft);

    // Start matchmaking on mount with room preparation
    startMatchmaking();

    // Cleanup event listeners on unmount
    return () => {
      socket.off('MatchmakingResponse', handleMatchmakingResponse);
      socket.off('QueueStatusResponse', handleQueueStatusResponse);
      socket.off('MatchFound', handleMatchFound);
      socket.off('GameStarting', handleGameStarting);
      socket.off('GameEnded', handleGameEnded);
      socket.off('CleanupResponse', handleCleanupResponse);
      socket.off('MatchmakingPlayerLeft', handleMatchmakingPlayerLeft);
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
        setMatchmakingStatus('preparing');
        setRoomPreparationCountdown(5);
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
    setTimeout(() => {
      onBack();
    }, 0);
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
          onExit={handleLeaveMatchmaking}
          gameId={gameId}
          socket={socket}
          isHost={isHost}
          opponent={opponent}
        />
        </div>
        </div>
        
        {/* Game Result Popup */}
        <GameResultPopup 
          isVisible={showResultPopup} 
          onComplete={handleResultPopupComplete} 
        />
        </div>
    );
  }

  return (
    <div className="h-full text-white flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      {/* Main Content */}
      <div className="flex items-center justify-center w-full h-full px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Random Matchmaking</h1>
          
          {matchmakingStatus === 'preparing' && (
            <>
              <MatchmakingStatus 
                status={`Preparing room... (${roomPreparationCountdown}s)`}
                queuePosition={queuePosition}
                totalInQueue={totalInQueue}
              />
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLeaveMatchmaking}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          
          {matchmakingStatus === 'searching' && (
            <>
              <MatchmakingStatus status="Searching for opponent..." />
              
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

          {matchmakingStatus === 'waiting_to_start' && opponent && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Match Found!</h2>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="text-center">
                    <img
                      src={`/images/${user?.avatar}`}
                      alt={user?.username || user?.login || 'You'}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                    />
                    <p className="text-white font-medium">{user?.username || user?.login || 'You'}</p>
                  </div>
                  <div className="text-2xl text-white">VS</div>
                  <div className="text-center">
                    <img
                      src={`/images/${opponent?.avatar}`}
                      alt={opponent.name || opponent.login || 'Opponent'}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                    />
                    <p className="text-white font-medium">{opponent.name || opponent.login || 'Opponent'}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">Game starting in 2 seconds...</p>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleLeaveMatchmaking}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {matchmakingStatus === 'in_game' && gameId && (
            <PingPongGame
              player1={user}
              player2={opponent}
              onExit={handleLeaveMatchmaking}
              gameId={gameId}
              socket={socket}
            />
          )}
        </div>
      </div>
    </div>
  );
}

