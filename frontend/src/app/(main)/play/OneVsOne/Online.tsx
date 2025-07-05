"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { PlayerCard } from './Locale';
import { useGameInvite } from './GameInviteProvider';
import { PingPongGame } from '../game/PingPongGame';
import CryptoJS from 'crypto-js';
import Image from 'next/image';

export const PlayerListItem = ({ player, onInvite, isInviting }) => {
  const isAvailable = player.GameStatus === 'Available';

  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#1a1d23] rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Image
            src={`/images/${player.avatar}`}
            alt={player.name}
            className="w-12 h-12 rounded-full object-cover"
            width={48}
            height={48}
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

const WaitingPage = ({ currentUser, opponent, onStartGame, onCancelGame, isHost, gameId }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">Game Ready!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
          <PlayerCard player={currentUser} playerNumber={1} onAddPlayer={() => {}} />
          <PlayerCard player={opponent} playerNumber={2} onAddPlayer={() => {}} />
        </div>
        
        <div className="mb-8">
          <p className="text-xl text-green-400 mb-4">🎮 Both players are ready!</p>
          <p className="text-gray-300">
            {isHost ? "You are the host. Click 'Start Game' to begin!" : "Waiting for host to start the game..."}
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
          <PlayerCard player={player} playerNumber={1} onAddPlayer={() => {}} />
          
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

function handleHostLeaveBeforeStart({ isHost, gameId, gameState, socket, user }) {
  if (isHost && gameId && gameState === 'waiting_to_start' && socket && user?.email) {
    socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email });
  }
}

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
  const [notification, setNotification] = useState({ message: '', type: 'info' });
  
  const { user } = useAuthStore();
  const { socket, receivedInvite, acceptInvite, declineInvite, clearInvite } = useGameInvite();
  const router = useRouter();
  
  const countdownIntervalRef = useRef(null);
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
      
      // Handle different game states when player leaves
      if (currentPath && newPath !== currentPath) {
        if (gameState === 'waiting_to_start' && gameId && socket && user?.email) {
          // Player left while waiting to start - emit appropriate event for both host and guest
          if (isHost) {
            // Host leaving - emit both events to ensure guest gets notified
            socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email });
            socket.emit('LeaveGame', { gameId, playerEmail: user.email });
          } else {
            socket.emit('LeaveGame', { gameId, playerEmail: user.email });
          }
        } else if (gameState === 'in_game' && gameId && socket && user?.email) {
          // Player left during active game - mark as lost
          socket.emit('LeaveGame', { 
            gameId, 
            playerEmail: user.email,
            reason: 'player_left_page'
          });
        } else if (gameState === 'waiting_response' && gameId && socket && user?.email) {
          // Player left while waiting for response - cancel invite
          socket.emit('CancelGameInvite', { 
            gameId,
            hostEmail: user.email
          });
        }
      }
      
      setTimeout(() => setCurrentPath(newPath), 0);
    };

    const handleBeforeUnload = (e) => {
      // Handle page refresh/close for different game states
      if (gameState === 'waiting_to_start' && gameId && socket && user?.email) {
        // Both host and guest should emit appropriate events when leaving waiting room
        if (isHost) {
          // Host leaving - emit both events to ensure guest gets notified
          socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email });
          socket.emit('LeaveGame', { gameId, playerEmail: user.email });
        } else {
          socket.emit('LeaveGame', { gameId, playerEmail: user.email });
        }
      } else if (gameState === 'in_game' && gameId && socket && user?.email) {
        // Show confirmation dialog for active games
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the game? This will result in a loss.';
        
        // Emit leave event
        socket.emit('LeaveGame', { 
          gameId, 
          playerEmail: user.email,
          reason: 'player_closed_page'
        });
        
        return 'Are you sure you want to leave the game? This will result in a loss.';
      } else if (gameState === 'waiting_response' && gameId && socket && user?.email) {
        socket.emit('CancelGameInvite', { 
          gameId,
          hostEmail: user.email
        });
      }
    };

    const handleVisibilityChange = () => {
      // Handle when user navigates to another tab or minimizes browser
      if (document.visibilityState === 'hidden') {
        if (gameState === 'waiting_to_start' && gameId && socket && user?.email) {
          // Both host and guest should emit appropriate events when leaving waiting room
          if (isHost) {
            // Host leaving - emit both events to ensure guest gets notified
            socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email });
            socket.emit('LeaveGame', { gameId, playerEmail: user.email });
          } else {
            socket.emit('LeaveGame', { gameId, playerEmail: user.email });
          }
        } else if (gameState === 'in_game' && gameId && socket && user?.email) {
          // Player left during active game - mark as lost
          socket.emit('LeaveGame', { 
            gameId, 
            playerEmail: user.email,
            reason: 'player_changed_tab'
          });
        } else if (gameState === 'waiting_response' && gameId && socket && user?.email) {
          socket.emit('CancelGameInvite', { 
            gameId,
            hostEmail: user.email
          });
        }
      }
    };

    const handlePopState = () => {
      handleRouteChange();
    };

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
  }, [currentPath, gameState, gameId, isHost, socket, user]);

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    // Auto-hide after 5 seconds
    setTimeout(() => setNotification({ message: '', type: 'info' }), 5000);
  };

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
          name: data.guestData.username || data.guestData.login,
          login: data.guestData.login,
          avatar: data.guestData.avatar || '/avatar/Default.svg',
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
      } else if (data.status === 'error') {
        showNotification(data.message, 'error');
        resetGameState();
      }
    };

    // FIXED: Improved logic for handling game invite acceptance
    const handleGameInviteAccepted = (data) => {
      if (data.status === 'ready_to_start') {
        setGameAccepted(true);
        setGameState('waiting_to_start');
        setIsWaitingForResponse(false);
        clearCountdown();

        if (gameState === 'waiting_response') {
          // We are the host
          setIsHost(true);
          setInvitedPlayer({
            ...data.guestData,
            name: data.guestData.username || data.guestData.login,
            login: data.guestData.login,
            avatar: data.guestData.avatar || '/avatar/Default.svg',
            GameStatus: 'Available'
          });
        } else {
          // We are the guest
          setIsHost(false);
          setInvitedPlayer({
            ...data.hostData,
            name: data.hostData.username || data.hostData.login,
            login: data.hostData.login,
            avatar: data.hostData.avatar || '/avatar/Default.svg',
            GameStatus: 'Available'
          });
        }

        setPersistentGameState({
          gameState: 'waiting_to_start',
          gameId: data.gameId,
          opponent: isHost ? data.guestData : data.hostData,
          isHost: gameState === 'waiting_response'
        });
      }
    };

    const handleGameInviteDeclined = (data) => {
      setIsInviting(false);
      setInvitedPlayer(null);
      setIsWaitingForResponse(false);
      setWaitTime(0);
      clearCountdown();
      
      showNotification(`${data.guestLogin || data.guestName} declined your invitation.`, 'error');
      
      // Reset game state and redirect host back to play page
      resetGameState();
      
      router.push('/play');
    };

    const handleGameInviteTimeout = (data) => {
      setIsInviting(false);
      setInvitedPlayer(null);
      setIsWaitingForResponse(false);
      setWaitTime(0);
      clearCountdown();
      
      showNotification('Game invitation expired.', 'error');
      
      // Reset game state and redirect host back to play page
      resetGameState();
      
      // Navigate back to the main play page using React router
      // router.push('/play');
    };

    const handleGameInviteCanceled = (data) => {
      setIsInviting(false);
      setInvitedPlayer(null);
      setIsWaitingForResponse(false);
      setWaitTime(0);
      clearCountdown();
      
      showNotification('Game invitation was canceled by host.', 'error');
      
      // Reset game state and redirect host back to play page
      resetGameState();
      
      // Navigate back to the main play page using React router
      // router.push('/play');
    };

    const handlePlayerLeft = (data) => {
      setIsInviting(false);
      setInvitedPlayer(null);
      setIsWaitingForResponse(false);
      setWaitTime(0);
      clearCountdown();
      
      showNotification('Opponent left the game. You win!', 'success');
      
      // Reset game state
      resetGameState();
      
      // Clean up any stale game data
      if (socket && user?.email) {
        socket.emit('CleanupGameData', { email: user.email });
      }
      
      // Redirect to win page since the current user wins when opponent leaves
      const winnerName = user?.username || user?.login || 'You';
      const loserName = data.playerWhoLeft || 'Opponent';
      router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
    };

    const handleGameEnded = (data) => {
      setIsInviting(false);
      setInvitedPlayer(null);
      setIsWaitingForResponse(false);
      setWaitTime(0);
      clearCountdown();
      
      // Determine if current user won
      const isWinner = data.winner === user?.email;
      const winnerName = isWinner ? (user?.username || user?.login || 'You') : (data.winner || 'Opponent');
      const loserName = isWinner ? (data.loser || 'Opponent') : (user?.username || user?.login || 'You');
      
      showNotification(data.message || 'Game ended.', 'info');
      
      // Reset game state
      resetGameState();
      
      // Clean up any stale game data
      if (socket && user?.email) {
        socket.emit('CleanupGameData', { email: user.email });
      }
      
      // Redirect to appropriate result page based on whether user won or lost
      if (isWinner) {
        router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      } else {
        router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      }
    };

    const handleGameCanceled = (data) => {
      setIsInviting(false);
      setInvitedPlayer(null);
      setIsWaitingForResponse(false);
      setWaitTime(0);
      clearCountdown();
      
      showNotification('Game was canceled.', 'error');
      
      // Reset game state and redirect back to play page
      resetGameState();
      
      // Navigate back to the main play page using React router
      router.push('/play');
    };

    // FIXED: Handle game start response - navigate both players to game
    const handleGameStartResponse = (data) => {
      if (data.status === 'success') {
        // Only the guest should navigate to the game page
        // The host should stay on the current page and the game will start there
        if (!isHost) {
          const targetPath = `/play/game/${gameId}`;
          window.location.href = targetPath;
        } else {
          // The host should stay on this page and the game component will be rendered here
          // We need to transition to the game state
          setShowGame(true);
        }
      } else {
        alert(`Failed to start game: ${data.message}`);
      }
    };

    // Handle game started event
    const handleGameStarted = (data) => {
      if (data.gameId === gameId) {
        // Update game state to indicate the game is now active
        setGameState('in_game');
        // The game component will handle the actual game start
        // This event confirms that the server has started the game
      }
    };

    // Handler for guest leaving before game starts
    const handleGameEndedByOpponentLeave = (data) => {
      setIsInviting(false);
      setInvitedPlayer(null);
      setIsWaitingForResponse(false);
      setWaitTime(0);
      clearCountdown();
      showNotification('Opponent left the game.', 'error');
      resetGameState();
      router.push('/play');
    };

    // Add event listeners
    socket.on('InviteToGameResponse', handleInviteResponse);
    socket.on('GameInviteAccepted', handleGameInviteAccepted);
    socket.on('GameInviteDeclined', handleGameInviteDeclined);
    socket.on('GameInviteTimeout', handleGameInviteTimeout);
    socket.on('GameInviteCanceled', handleGameInviteCanceled);
    socket.on('PlayerLeft', handlePlayerLeft);
    socket.on('GameEnded', handleGameEnded);
    socket.on('GameCanceled', handleGameCanceled);
    socket.on('GameStartResponse', handleGameStartResponse);
    socket.on('GameStarted', handleGameStarted);
    socket.on('GameEndedByOpponentLeave', handleGameEndedByOpponentLeave);

    return () => {
      socket.off('InviteToGameResponse', handleInviteResponse);
      socket.off('GameInviteAccepted', handleGameInviteAccepted);
      socket.off('GameInviteDeclined', handleGameInviteDeclined);
      socket.off('GameInviteTimeout', handleGameInviteTimeout);
      socket.off('GameInviteCanceled', handleGameInviteCanceled);
      socket.off('PlayerLeft', handlePlayerLeft);
      socket.off('GameEnded', handleGameEnded);
      socket.off('GameCanceled', handleGameCanceled);
      socket.off('GameStartResponse', handleGameStartResponse);
      socket.off('GameStarted', handleGameStarted);
      socket.off('GameEndedByOpponentLeave', handleGameEndedByOpponentLeave);
    };
  }, [socket, gameId, clearInvite, user?.email, gameState, isHost, receivedInvite]);

  // Handle page refresh and disconnection
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

  // Handle accepting invite from context
  useEffect(() => {
    if (receivedInvite && gameState === 'idle') {
      setInvitedPlayer({
        ...receivedInvite.hostData,
        name: receivedInvite.hostData.username,
        GameStatus: 'Available'
      });
      setGameId(receivedInvite.gameId);
      setIsHost(false); // Guest is not host
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
        
        if (!res.ok) {
          setFriends([]);
          return;
        }
        
        const data = await res.json();
        
        if (data.friends && Array.isArray(data.friends)) {
          const formatted = data.friends.map(f => ({
            name: f.username,
            avatar: f.avatar,
            nickname: f.login,
            GameStatus: 'Available',
            ...f,
          }));
          setFriends(formatted);
        } else {
          setFriends([]);
        }
      } catch (err) {
        setFriends([]);
        // Don't show alert to user, just log the error
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
            // If time runs out, cancel the invite automatically
            handleCancelInvite();
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
        hostEmail: user.email
      });
    }
    resetGameState();
  };

  // FIXED: Simplified start game logic
  const handleStartGame = () => {
    if (socket && gameId) {
      socket.emit('StartGame', { gameId });
    } else {
      alert('Cannot start game - missing connection or game ID');
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

  // If waiting to start game, show waiting page
  if (gameState === 'waiting_to_start' && gameAccepted && invitedPlayer) {
    return (
      <WaitingPage
        currentUser={user}
        opponent={invitedPlayer}
        onStartGame={handleStartGame}
        onCancelGame={handleCancelGame}
        isHost={isHost}
        gameId={gameId}
      />
    );
  }

  // Function to handle game exit (triggered by route change or manual exit)
  // This will run for both host and guest (any player in the game)
  const handleGameExit = () => {
    if (socket && gameId && user?.email && gameState === 'in_game') {
      socket.emit('LeaveGame', {
        gameId,
        playerEmail: user.email,
      });
    }
  };

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
                        <p className="text-gray-400 text-lg mb-4">
                          {searchQuery ? 'No players found matching your search.' : 'No friends online right now.'}
                        </p>
                        {!searchQuery && (
                          <div className="space-y-2">
                            <p className="text-gray-500 text-sm">
                              Make sure you have friends added to your account.
                            </p>
                            <button
                              onClick={() => window.location.reload()}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              Refresh
                            </button>
                          </div>
                        )}
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
          ) : (
            // Game Component for Host
            <PingPongGame
              player1={user}
              player2={invitedPlayer}
              onExit={handleGameEnd}
              gameId={gameId}
              socket={socket}
              isHost={isHost}
              opponent={invitedPlayer}
            />
          )}
        </div>
      </div>
    </div>
  );
}