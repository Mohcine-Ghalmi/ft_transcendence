"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { PingPongGame } from "../game/PingPongGame";
import { PlayerCard } from './Locale';
import { useGameInvite } from './GameInviteProvider';
import CryptoJS from 'crypto-js';

const PlayerListItem = ({ player, onInvite, isInviting }) => {
  const isAvailable = player.GameStatus === 'Available';

  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#1a1d23] rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={player.avatar}
            alt={player.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-white font-medium text-lg">{player.name}</h3>
          <p className={`text-sm ${
            player.GameStatus === 'Available' ? 'text-green-400' : 
            player.GameStatus === 'In a match' ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {player.GameStatus}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => onInvite(player)}
        disabled={!isAvailable || isInviting}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isAvailable && !isInviting
            ? 'bg-[#4a5568] hover:bg-[#5a6578] text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isInviting ? 'Inviting...' : 'Invite'}
      </button>
    </div>
  );
};

const WaitingPage = ({ currentUser, opponent, onStartGame, onCancelGame, isHost }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">Game Ready!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
          <PlayerCard player={currentUser} playerNumber={1} />
          <PlayerCard player={opponent} playerNumber={2} />
        </div>
        
        <div className="mb-8">
          <p className="text-xl text-green-400 mb-4">🎮 Both players are ready!</p>
          <p className="text-gray-300">
            {isHost ? "You can start the game when ready." : "Waiting for host to start the game..."}
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          {isHost && (
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-colors"
            >
              Start Game
            </button>
          )}
          <button
            onClick={onCancelGame}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
};

const WaitingForResponseModal = ({ player, waitTime, onCancel }) => {
  return (
    <div className="flex flex-row items-center justify-center">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-white mb-12"></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12 md:mb-20">
          {/* Player 1 */}
          <PlayerCard player={player} playerNumber={1} />
          
          {/* Player 2 - Waiting for Response */}
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <p className="text-white text-lg mb-8">
                Waiting for {player?.name} to respond...
              </p>
              
              {/* Progress Bar */}
              <div className="w-full mb-4">
                <div className="bg-gray-700 rounded-full">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-1000 ease-linear"
                    style={{ width: `${((30 - waitTime) / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm">
                Estimated wait time: {waitTime} seconds
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OnlineMatch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [invitedPlayer, setInvitedPlayer] = useState(null);
  const [gameAccepted, setGameAccepted] = useState(false);
  const [waitTime, setWaitTime] = useState(30);
  const [showGame, setShowGame] = useState(false);
  const [friends, setFriends] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [isInviting, setIsInviting] = useState(false);
  const [gameState, setGameState] = useState('idle'); // 'idle', 'waiting_response', 'waiting_to_start', 'in_game'
  const [isHost, setIsHost] = useState(false);
  
  const { user } = useAuthStore();
  const { socket, receivedInvite, acceptInvite, declineInvite, clearInvite } = useGameInvite();
  
  const countdownIntervalRef = useRef(null);

  // Load game state from memory storage (not localStorage due to artifact restrictions)
  const [persistentGameState, setPersistentGameState] = useState({
    gameState: 'idle',
    gameId: null,
    opponent: null,
    isHost: false
  });

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleInviteResponse = (data) => {
      setIsInviting(false);
      
      if (data.status === 'success' && data.type === 'invite_sent') {
        setGameId(data.gameId);
        setInvitedPlayer({
          ...data.guestData,
          name: data.guestData.username,
          GameStatus: 'Available'
        });
        setGameState('waiting_response');
        setIsHost(true);
        setPersistentGameState({
          gameState: 'waiting_response',
          gameId: data.gameId,
          opponent: data.guestData,
          isHost: true
        });
        console.log('Invite sent successfully');
      } else if (data.status === 'error') {
        alert(data.message);
        resetGameState();
      }
    };

    const handleGameInviteAccepted = (data) => {
      if (data.status === 'ready_to_start') {
        setGameAccepted(true);
        setGameState('waiting_to_start');
        setIsWaitingForResponse(false);
        clearCountdown();
        
        const opponentData = data.guestData || data.hostData;
        if (opponentData) {
          const formattedOpponent = {
            ...opponentData,
            name: opponentData.username,
            GameStatus: 'Available'
          };
          setInvitedPlayer(formattedOpponent);
          setPersistentGameState(prev => ({
            ...prev,
            gameState: 'waiting_to_start',
            opponent: formattedOpponent
          }));
        }
      }
    };

    const handleGameInviteDeclined = (data) => {
      console.log('Game invite declined:', data);
      resetGameState();
    };

    const handleGameInviteTimeout = (data) => {
      if (data.gameId === gameId) {
        console.log('Game invitation expired');
        resetGameState();
      }
    };

    const handleGameStarted = (data) => {
      setShowGame(true);
      setGameState('in_game');
      setPersistentGameState(prev => ({
        ...prev,
        gameState: 'in_game'
      }));
    };

    const handleGameInviteCanceled = (data) => {
      console.log('Game invitation was canceled by host:', data);
      
      // Clear any received invite from the context
      if (clearInvite) {
        clearInvite();
      }
      
      resetGameState();
    };

    // Add event listeners
    socket.on('InviteToGameResponse', handleInviteResponse);
    socket.on('GameInviteAccepted', handleGameInviteAccepted);
    socket.on('GameInviteDeclined', handleGameInviteDeclined);
    socket.on('GameInviteTimeout', handleGameInviteTimeout);
    socket.on('GameStarted', handleGameStarted);
    socket.on('GameInviteCanceled', handleGameInviteCanceled);

    return () => {
      socket.off('InviteToGameResponse', handleInviteResponse);
      socket.off('GameInviteAccepted', handleGameInviteAccepted);
      socket.off('GameInviteDeclined', handleGameInviteDeclined);
      socket.off('GameInviteTimeout', handleGameInviteTimeout);
      socket.off('GameStarted', handleGameStarted);
      socket.off('GameInviteCanceled', handleGameInviteCanceled);
    };
  }, [socket, gameId, clearInvite]);

  // Handle accepting invite from context
  useEffect(() => {
    if (receivedInvite && gameState === 'idle') {
      setInvitedPlayer({
        ...receivedInvite.hostData,
        name: receivedInvite.hostData.username,
        GameStatus: 'Available'
      });
      setGameId(receivedInvite.gameId);
      setPersistentGameState({
        gameState: 'idle',
        gameId: receivedInvite.gameId,
        opponent: receivedInvite.hostData,
        isHost: false
      });
    }
  }, [receivedInvite, gameState]);
  
  // Fetch friends effect
  useEffect(() => {
    async function fetchFriends() {
      if (!user?.email) return;
      
      try {
        const res = await fetch(`http://localhost:5005/api/users/friends?email=${user.email}`);
        const data = await res.json();
        const formatted = data.friends.map(f => ({
          name: f.username,
          avatar: f.avatar,
          nickname: f.login,
          GameStatus: 'Available',
          ...f,
        }));
        setFriends(formatted);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setFriends([]);
      }
    }
    fetchFriends();
  }, [user]);

  const resetGameState = () => {
    setGameState('idle');
    setIsWaitingForResponse(false);
    setInvitedPlayer(null);
    setGameAccepted(false);
    setWaitTime(30);
    setGameId(null);
    setIsHost(false);
    setShowGame(false);
    setIsInviting(false);
    setPersistentGameState({
      gameState: 'idle',
      gameId: null,
      opponent: null,
      isHost: false
    });
    clearCountdown();
  };

  const clearCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const filteredPlayers = friends.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async (player) => {
    if (!socket) {
      alert('Not connected to server');
      return;
    }
    
    setIsInviting(true);
    console.log('Inviting player:', player);
    setInvitedPlayer(player);
    setIsWaitingForResponse(true);
    setGameAccepted(false);
    setWaitTime(30);
    
    clearCountdown();
    
    try {
      const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error('Encryption key not found');
      }

      const inviteData = {
        myEmail: user.email,
        hisEmail: player.email
      };
      
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(inviteData), encryptionKey).toString();
      
      socket.emit('InviteToGame', encrypted);
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setWaitTime(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Failed to send invitation');
      setIsInviting(false);
      resetGameState();
    }
  };

 const handleCancelInvite = () => {
  if (socket && gameId && user?.email) {
    socket.emit('CancelGameInvite', { 
      gameId,
      hostEmail: user.email  // Add the hostEmail
    });
  }
    resetGameState();
  };


  const handleStartGame = () => {
    if (socket && gameId) {
      socket.emit('StartGame', { gameId });
    }
  };

  const handleCancelGame = () => {
    if (socket && gameId) {
      socket.emit('CancelGame', { gameId });
    }
    resetGameState();
  };

  const handleGameEnd = () => {
    resetGameState();
  };

  // If game is active, show the game component
  if (showGame && gameState === 'in_game') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-7xl">
          <PingPongGame
            gameId={gameId}
            socket={socket}
            onExit={handleGameEnd}
            isHost={isHost}
            opponent={invitedPlayer}
          />
        </div>
      </div>
    );
  }

  // If waiting to start game, show waiting page
  if (gameState === 'waiting_to_start' && gameAccepted && invitedPlayer) {
    return (
      <WaitingPage
        currentUser={user}
        opponent={invitedPlayer}
        onStartGame={handleStartGame}
        onCancelGame={handleCancelGame}
        isHost={isHost}
      />
    );
  }

  return (
    <div className="h-full w-full text-white">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-7xl">
          {!gameAccepted && gameState === 'idle' && (
            <h1 className="text-center text-4xl md:text-5xl font-bold mb-8">1v1 Online Match</h1>
          )}
          
          {!showGame ? (
            gameState === 'idle' ? (
              <>
                {/* Search Bar */}
                <div className="relative mb-8">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for players"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#2a2f3a] text-white rounded-lg border-none outline-none focus:bg-[#3a3f4a] transition-colors text-lg"
                  />
                </div>
                
                {/* Online Players Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">Online Players</h2>
                  
                  <div className="space-y-2">
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player, index) => (
                        <PlayerListItem
                          key={`${player.name}-${index}`}
                          player={player}
                          onInvite={handleInvite}
                          isInviting={isInviting && invitedPlayer?.email === player.email}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                          {searchQuery ? 'No players found matching your search.' : 'No friends online right now.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Match Queue / Waiting for Response Interface
              <WaitingForResponseModal
                player={user}
                waitTime={waitTime}
                onCancel={handleCancelInvite}
              />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}