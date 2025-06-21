"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
// import { user } from '@/data/mockData';
import { useAuthStore } from '@/(zustand)/useAuthStore'
import {PingPongGame} from "../game/PingPongGame";
import { PlayerCard } from './Locale';

// Removed mock players as we are using friends from backend now

const PlayerListItem = ({ player, onInvite }) => {
  const isAvailable = player.GameStatus === 'Available';
  const isOnline = player.GameStatus === 'Available' || player.GameStatus === 'In a match';
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#1a1d23] rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={player.avatar}
            alt={player.name}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
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
        disabled={!isAvailable}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isAvailable
            ? 'bg-[#4a5568] hover:bg-[#5a6578] text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        Invite
      </button>
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
  const {user} = useAuthStore();
  
  // Use useRef to store the interval ID so we can clear it when canceling
  const countdownIntervalRef = useRef(null);
  const responseTimeoutRef = useRef(null);
  
  useEffect(() => {
  async function fetchFriends() {
    try {
      // Use the correct endpoint for your backend
      const res = await fetch(`http://localhost:5005/api/users/friends?email=${user.email}`);
      const data = await res.json();
      // Transform backend data to match frontend structure
      const formatted = data.friends.map(f => ({
        name: f.username,
        avatar: f.avatar,
        nickname: f.login,
        GameStatus: 'Available', // Or use real status if you have it
        ...f,
      }));
      setFriends(formatted);
    } catch (err) {
      setFriends([]);
    }
  }
  fetchFriends();
  }, []);

  const filteredPlayers = friends.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (player) => {
    console.log('Inviting player:', player);
    setInvitedPlayer(player);
    setIsWaitingForResponse(true);
    setGameAccepted(false);
    setWaitTime(30);
    
    // Clear any existing intervals/timeouts
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    
    // Simulate countdown and response waiting
    countdownIntervalRef.current = setInterval(() => {
      setWaitTime(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          
          // Simulate random response (accept/decline/timeout) - higher chance of accept for demo
          const responses = ['accept', 'decline', 'timeout'];
          // const response = responses[Math.floor(Math.random() * responses.length)];
          const response = 'accept';
          
          responseTimeoutRef.current = setTimeout(() => {
            // Check if invitation is still active (not canceled)
            if (isWaitingForResponse) {
              if (response === 'accept') {
                setGameAccepted(true);
                // Don't reset the waiting state, show the accepted game state instead
              } else if (response === 'decline') {
                alert(`${player.name} declined your invitation.`);
                setIsWaitingForResponse(false);
                setInvitedPlayer(null);
              } else {
                alert(`${player.name} didn't respond to your invitation.`);
                setIsWaitingForResponse(false);
                setInvitedPlayer(null);
              }
            }
            responseTimeoutRef.current = null;
          }, 0);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCancelInvite = () => {
    // Clear all intervals and timeouts to prevent any delayed responses
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
    
    // Reset all states
    setIsWaitingForResponse(false);
    setInvitedPlayer(null);
    setGameAccepted(false);
    setWaitTime(30);
  };

  const handleStartGame = () => {
    console.log('Starting game with:', {
      player1: user,
      player2: invitedPlayer
    });

    setShowGame(true);
  };

  const handleExitGame = () => {
    setShowGame(false);
    setIsWaitingForResponse(false);
    setInvitedPlayer(null);
    setGameAccepted(false);
  };

  return (
    <div className="h-full w-full text-white">
      {/* Main Content */}
     <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            {!gameAccepted && (
            <h1 className="text-center text-4xl md:text-5xl font-bold mb-8">1v1 Online Match</h1>
            )}
          
          {!showGame ? (
            !isWaitingForResponse ? (
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
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-4 bg-[#2a2f3a] text-white rounded-lg border-none outline-none focus:bg-[#3a3f4a] transition-colors text-lg"
                  />
                </div>
                
                {/* Online Players Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">Online Players</h2>
                  
                  <div className="space-y-2 bo">
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player, index) => (
                        <PlayerListItem
                          key={`${player.name}-${index}`}
                          player={player}
                          onInvite={handleInvite}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No players found matching your search.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Match Queue / Game Accepted Interface
              <div className="flex flex-row items-center justify-center">
                <div className="max-w-7xl mx-auto text-center">
                  <h2 className="text-3xl font-semibold text-white mb-12"></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12 md:mb-20">
                  
                  {/* Player 1 */}
                  <PlayerCard player={user} playerNumber={1} />
                 
                  
                  {/* Player 2 - Waiting for Response or Accepted */}
                  <div className="flex items-center">
                    <div className="flex flex-col items-center">
                      {gameAccepted ? (
                          <PlayerCard player={invitedPlayer} playerNumber={2} />
                      ) : (
                        <>
                          <p className="text-white text-lg mb-8">
                            Waiting for {invitedPlayer.name} to respond...
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
                        </>
                      )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    {gameAccepted ? (
                      <button
                        onClick={handleStartGame}
                        className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-colors"
                      >
                        Start Game
                      </button>
                    ) : (
                      <button
                        onClick={handleCancelInvite}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : (
              <PingPongGame
                player1={user}
                player2={invitedPlayer}
                onExit={handleExitGame}
              />
          )}
        </div>
      </div>
    </div>
  );
}