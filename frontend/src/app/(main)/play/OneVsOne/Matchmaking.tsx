"use client"
import React, { useState, useEffect } from 'react';
import { useAuthStore, getSocketInstance } from '@/(zustand)/useAuthStore';
import { PingPongGame } from '../game/PingPongGame';
import { PlayerCard } from './Locale';

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

const MatchFoundModal = ({ 
  gameId, 
  hostEmail, 
  guestEmail, 
  currentUserEmail, 
  onGameStart 
}: { 
  gameId: string; 
  hostEmail: string; 
  guestEmail: string; 
  currentUserEmail: string; 
  onGameStart: () => void; 
}) => {
  const [countdown, setCountdown] = useState(3);
  const isHost = hostEmail === currentUserEmail;
  const opponentEmail = isHost ? guestEmail : hostEmail;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onGameStart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onGameStart]);

  return (
  <div className="h-full text-white flex items-center justify-center min-h-[calc(100vh-80px)]">
    {/* Main Content */}
    <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white text-center">Match Found!</h1>
      
      <div className="mb-8 text-center">
        <p className="text-xl text-green-400 mb-4">🎮 Opponent found!</p>
        <p className="text-gray-300 mb-6">
          Game starting in {countdown} seconds...
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
        <PlayerCard 
          player={{
            name: isHost ? 'You (Host)' : 'You',
            avatar: '/avatar/Default.svg',
            GameStatus: 'Ready'
          }} 
          playerNumber={1} 
          onAddPlayer={() => {}} 
        />
        <PlayerCard 
          player={{
            name: `Opponent (${isHost ? 'Guest' : 'Host'})`,
            avatar: '/avatar/Default.svg',
            GameStatus: 'Ready'
          }} 
          playerNumber={2} 
          onAddPlayer={() => {}} 
        />
      </div>
    </div>
  </div>
  );
};

export default function Matchmaking({ onBack }: MatchmakingProps) {
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'searching' | 'found' | 'in_game'>('idle');
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
      setMatchData(data);
      setGameId(data.gameId);
      setIsHost(data.hostEmail === user.email);
      setOpponent({
        name: data.hostEmail === user.email ? data.guestEmail : data.hostEmail,
        email: data.hostEmail === user.email ? data.guestEmail : data.hostEmail,
        avatar: '/avatar/Default.svg'
      });
      setMatchmakingStatus('found');
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

    // Add event listeners
    socket.on('MatchmakingResponse', handleMatchmakingResponse);
    socket.on('QueueStatusResponse', handleQueueStatusResponse);
    socket.on('MatchFound', handleMatchFound);
    socket.on('GameStarting', handleGameStarting);
    socket.on('GameEnded', handleGameEnded);
    socket.on('CleanupResponse', handleCleanupResponse);

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
      
      // Leave matchmaking when component unmounts
      if (socket && user?.email) {
        socket.emit('LeaveMatchmaking', { email: user.email });
      }
    };
  }, [socket, user?.email]);

  const handleLeaveMatchmaking = () => {
    if (socket && user?.email) {
      socket.emit('LeaveMatchmaking', { email: user.email });
    }
    setMatchmakingStatus('idle');
    onBack();
  };

  const handleGameStart = () => {
    setMatchmakingStatus('in_game');
  };

  const handleGameEnd = () => {
    setMatchmakingStatus('idle');
    setGameId(null);
    setMatchData(null);
    setOpponent(null);
    setIsHost(false);
    onBack();
  };

  const handleCleanupGameData = () => {
    if (socket && user?.email) {
      socket.emit('CleanupGameData', { email: user.email });
    }
  };

  // If in game, show the game component
  if (matchmakingStatus === 'in_game' && gameId && opponent) {
    return (
       <div className="h-full text-white border">
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

  // If match found, show countdown
  if (matchmakingStatus === 'found' && matchData) {
    return (
      <MatchFoundModal
        gameId={matchData.gameId}
        hostEmail={matchData.hostEmail}
        guestEmail={matchData.guestEmail}
        currentUserEmail={user?.email || ''}
        onGameStart={handleGameStart}
      />
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
          
          {matchmakingStatus === 'idle' && (
            <div className="text-center flex flex-col items-center justify-center w-full">
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg w-full max-w-lg mx-auto">
                  <p className="text-red-400 text-lg mb-2">{errorMessage}</p>
                  {showCleanupOption && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-3">
                        This might be due to stale game data. You can try cleaning it up:
                      </p>
                      <button
                        onClick={handleCleanupGameData}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Clean Up Game Data
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-gray-400 text-lg mb-8">
                Click the button below to start searching for a random opponent.
              </p>
              <button
                onClick={() => {
                  if (socket && user?.email) {
                    socket.emit('JoinMatchmaking', { email: user.email });
                    setMatchmakingStatus('searching');
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-xl font-semibold transition-colors"
              >
                Start Matchmaking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 