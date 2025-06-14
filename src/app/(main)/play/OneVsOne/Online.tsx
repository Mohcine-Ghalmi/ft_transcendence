"use client"
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import {onlineFriends, user } from '@/data/mockData';


// Additional mock players to show more variety
const onlinePlayers = onlineFriends;

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
  const [waitTime, setWaitTime] = useState(3);
  
  const filteredPlayers = onlinePlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (player) => {
    console.log('Inviting player:', player);
    setInvitedPlayer(player);
    setIsWaitingForResponse(true);
    setGameAccepted(false);
    setWaitTime(3);
    
    // Simulate countdown and response waiting
    const interval = setInterval(() => {
      setWaitTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Simulate random response (accept/decline/timeout) - higher chance of accept for demo
          const responses = ['accept', 'accept', 'accept', 'decline', 'timeout'];
          const response = responses[Math.floor(Math.random() * responses.length)];
          
          setTimeout(() => {
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
          }, 1000);
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCancelInvite = () => {
    setIsWaitingForResponse(false);
    setInvitedPlayer(null);
    setGameAccepted(false);
    setWaitTime(3);
  };

  const handleStartGame = () => {
    // Here you would navigate to the actual game component
    console.log('Starting game with:', {
      player1: user,
      player2: invitedPlayer
    });
    
    // For demo purposes, we'll show an alert. In a real app, you'd use React Router or Next.js router
    alert(`Game starting between ${user.name} and ${invitedPlayer.name}!`);
    
    // Reset state after game starts
    setIsWaitingForResponse(false);
    setInvitedPlayer(null);
    setGameAccepted(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#121417] text-white">
      {/* Main Content */}
      <main className="pt-20 w-full min-h-screen">
        <div className="max-w-4xl mx-auto px-4 h-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">1v1 Online Match</h1>
          
          {!isWaitingForResponse ? (
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
                
                <div className="space-y-2">
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
            /* Match Queue / Game Accepted Interface */
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-semibold text-white mb-12">Match Queue</h2>
                
                {/* Player 1 */}
                <div className="mb-16">
                  <h3 className="text-xl text-white mb-8">Player 1</h3>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 mb-6">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover border-4 border-[#4a5568]"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    <h4 className="text-white font-semibold text-2xl mb-2">{user.name}</h4>
                    <p className="text-gray-400 text-lg">@{user.username}</p>
                  </div>
                </div>
                
                {/* Player 2 - Waiting for Response or Accepted */}
                <div className="mb-16">
                  <h3 className="text-xl text-white mb-8">Player 2</h3>
                  <div className="flex flex-col items-center">
                    {gameAccepted ? (
                      <>
                        {/* Show invited player when game is accepted */}
                        <div className="w-32 h-32 mb-6">
                          <img
                            src={invitedPlayer.avatar}
                            alt={invitedPlayer.name}
                            className="w-full h-full rounded-full object-cover border-4 border-green-500"
                            onError={(e) => {
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                        </div>
                        <h4 className="text-white font-semibold text-2xl mb-2">{invitedPlayer.name}</h4>
                        <p className="text-green-400 text-lg font-semibold">Invitation Accepted!</p>
                      </>
                    ) : (
                      <>
                        <p className="text-white text-lg mb-8">
                          Waiting for {invitedPlayer?.name} to respond...
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="w-full max-w-md mb-4">
                          <div className="bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-white rounded-full h-2 transition-all duration-1000 ease-linear"
                              style={{ width: `${((3 - waitTime) / 3) * 100}%` }}
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
          )}
        </div>
      </main>
    </div>
  );
}