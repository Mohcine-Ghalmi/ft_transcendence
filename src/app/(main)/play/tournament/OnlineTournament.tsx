"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import {MATCH_STATES} from '../../../../data/mockData';
import TournamentBracket from './TournamentBracket';
import { user, onlineFriends } from '@/data/mockData';

interface Player {
  name: string;
  avatar: string;
  GameStatus: string;
  nickname: string;
}

interface OnlinePlayModeProps {
  onInvitePlayer: (player: Player) => void;
  pendingInvites: Map<string, any>;
  sentInvites: Map<string, any>;
}

const OnlinePlayMode = ({ onInvitePlayer, pendingInvites, sentInvites }: OnlinePlayModeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState(onlineFriends);
  
  // Filter online players based on search query
  const filteredPlayers = friends.filter((player: Player) =>
    player.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get button state for a player
  const getPlayerButtonState = (player: Player) => {
    if (pendingInvites.has(player.name)) {
      return { text: 'Pending...', disabled: true, color: 'bg-yellow-600' };
    }
    if (sentInvites.has(player.name)) {
      return { text: 'Invited', disabled: true, color: 'bg-blue-600' };
    }
    return { text: 'Invite', disabled: false, color: 'bg-green-600 hover:bg-green-500' };
  };
  
  return (
    <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700 shadow-lg">
      <h3 className="text-white text-xl font-semibold mb-4">Invite Players</h3>
      
      {/* Search Bar - Similar to OneVsOne Online */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-[#2a2f3a] text-white rounded-lg border-none outline-none focus:bg-[#3a3f4a] transition-colors text-lg"
        />
      </div>
      
      {/* Online Players List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <h4 className="text-white text-lg font-medium mb-3">Online Players</h4>
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player: Player) => {
            const buttonState = getPlayerButtonState(player);
            const isAvailable = player.GameStatus === 'Available';
            
            return (
              <div key={player.name} className="flex items-center justify-between p-4 hover:bg-[#1a1d23] rounded-lg transition-colors border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-500">
                      <Image 
                        src={player.avatar} 
                        alt={player.name} 
                        width={48} 
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Status indicator */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      player.GameStatus === 'Available' ? 'bg-green-500' : 
                      player.GameStatus === 'In a match' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
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
                  onClick={() => onInvitePlayer(player)}
                  disabled={buttonState.disabled || !isAvailable}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    !isAvailable
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : buttonState.disabled
                      ? `${buttonState.color} text-white cursor-not-allowed`
                      : `${buttonState.color} text-white hover:brightness-110`
                  }`}
                >
                  {!isAvailable ? 'Unavailable' : buttonState.text}
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No players found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Tournament Component
export default function OnlineTournament() {
  const [tournamentState, setTournamentState] = useState('setup'); // setup, lobby, in_progress
  const [tournamentName, setTournamentName] = useState('Online Pong Championship');
  const [tournamentSize, setTournamentSize] = useState(4);
  const [tournamentCode, setTournamentCode] = useState('');
  const [currentRound, setCurrentRound] = useState(0);
  const [participants, setParticipants] = useState([{
    id: user.nickname, 
    login: user.name, 
    avatar: user.avatar,
    nickname: user.nickname,
    isHost: true
  }]);
  const [matches, setMatches] = useState([]);
  const [sentInvites, setSentInvites] = useState(new Map());
  const [pendingInvites, setPendingInvites] = useState(new Map());
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [champion, setChampion] = useState(null);

  // Generate tournament code when creating tournament
  useEffect(() => {
    if (tournamentState === 'lobby' && !tournamentCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setTournamentCode(code);
    }
  }, [tournamentState, tournamentCode]);

  // Handle match updates (simulation of play)
  const handleMatchUpdate = (roundIndex: number, matchIndex: number, newState: string) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      const matchToUpdate = newMatches.find(m => m.round === roundIndex && m.matchIndex === matchIndex);
      
      if (matchToUpdate) {
        matchToUpdate.state = newState;
        
        if (newState === MATCH_STATES.PLAYER1_WIN || newState === MATCH_STATES.PLAYER2_WIN) {
          const nextRound = roundIndex + 1;
          const nextMatchIndex = Math.floor(matchIndex / 2);
          const isFirstMatch = matchIndex % 2 === 0;
          const nextMatch = newMatches.find(m => m.round === nextRound && m.matchIndex === nextMatchIndex);
          
          if (nextMatch) {
            const winner = newState === MATCH_STATES.PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
            if (isFirstMatch) {
              nextMatch.player1 = winner;
            } else {
              nextMatch.player2 = winner;
            }
          }
          
          if (roundIndex === Math.log2(tournamentSize) - 1) {
            const winner = newState === MATCH_STATES.PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
            setChampion(winner);
            setTournamentComplete(true);
          }
          
          const roundMatches = newMatches.filter(m => m.round === roundIndex);
          const allMatchesComplete = roundMatches.every(m => 
            m.state === MATCH_STATES.PLAYER1_WIN || m.state === MATCH_STATES.PLAYER2_WIN
          );
          
          if (allMatchesComplete && nextRound < Math.log2(tournamentSize)) {
            setCurrentRound(nextRound);
          }
        }
      }
      return newMatches;
    });
  };

  // Start tournament logic
  const startTournament = () => {
    if (participants.length < 4) {
      alert('You need at least 4 players to start the tournament!');
      return;
    }
    
    // Initialize tournament bracket
    const initialMatches = [];
    const rounds = Math.log2(tournamentSize);
    
    // First round
    for (let i = 0; i < tournamentSize / 2; i++) {
      const player1 = participants[i * 2] || null;
      const player2 = participants[i * 2 + 1] || null;
      initialMatches.push({
        round: 0,
        matchIndex: i,
        player1,
        player2,
        state: MATCH_STATES.WAITING
      });
    }
    
    // Subsequent rounds
    for (let round = 1; round < rounds; round++) {
      const matchesInRound = tournamentSize / Math.pow(2, round + 1);
      for (let match = 0; match < matchesInRound; match++) {
        initialMatches.push({
          round,
          matchIndex: match,
          player1: null,
          player2: null,
          state: MATCH_STATES.WAITING
        });
      }
    }
    
    setMatches(initialMatches);
    setTournamentState('in_progress');
  };

  // Invite a specific player to tournament
  const handleInvitePlayer = (player: Player) => {
    if (participants.length >= tournamentSize) {
      alert('Tournament is full!');
      return;
    }
    
    // Add to sent invites
    setSentInvites(prev => new Map(prev).set(player.name, {
      player,
      timestamp: Date.now()
    }));
    
    // Simulate invitation response after 2 seconds
    setTimeout(() => {
      const accepted = Math.random() > 0.3; // 70% chance of acceptance
      
      if (accepted) {
        // Remove from sent invites and add player to participants
        setSentInvites(prev => {
          const newMap = new Map(prev);
          newMap.delete(player.name);
          return newMap;
        });
        
        // Add player to participants
        setParticipants(prev => {
          if (prev.some(p => p.nickname === player.nickname)) return prev;
          return [...prev, {
            id: player.nickname,
            login: player.name,
            avatar: player.avatar,
            nickname: player.nickname,
            isHost: false
          }];
        });
      } else {
        // Remove from sent invites
        setSentInvites(prev => {
          const newMap = new Map(prev);
          newMap.delete(player.name);
          return newMap;
        });
        alert(`${player.name} declined the tournament invitation.`);
      }
    }, 2000);
  };

  // Leave tournament
  const leaveTournament = () => {
    setParticipants([{
      id: user.nickname, 
      login: user.name, 
      avatar: user.avatar,
      nickname: user.nickname,
      isHost: true
    }]);
    setMatches([]);
    setCurrentRound(0);
    setTournamentState('setup');
    setTournamentCode('');
    setSentInvites(new Map());
    setPendingInvites(new Map());
    setTournamentComplete(false);
    setChampion(null);
  };

  // Remove participant (host only)
  const removeParticipant = (playerNickname: string) => {
    if (playerNickname === user.nickname) return; // Can't remove host
    setParticipants(prev => prev.filter(p => p.nickname !== playerNickname));
  };

  // Reset tournament
  const resetTournament = () => {
    leaveTournament();
  };

  return (
    <div className="h-full text-white">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-4">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
            Online Tournament Mode
          </h1>
          
          {/* Tournament Setup Section */}
          {tournamentState === 'setup' && (
            <div className="bg-gray-800/80 rounded-lg p-8 border border-gray-700 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-white text-2xl font-semibold mb-6 text-center">Create Tournament</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white text-lg font-medium mb-3">Tournament Name</label>
                  <input 
                    type="text" 
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600"
                    placeholder="Enter tournament name"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-lg font-medium mb-3">Tournament Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[4, 8, 16].map(size => (
                      <button 
                        key={size} 
                        className={`py-3 px-4 rounded-lg text-lg font-medium transition-all ${tournamentSize === size ? 
                          'bg-indigo-600 text-white ring-2 ring-indigo-400' : 
                          'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        onClick={() => setTournamentSize(size)}
                      >
                        {size} Players
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setTournamentState('lobby')}
                  disabled={!tournamentName || tournamentName.trim().length === 0}
                  className={`w-full text-white font-semibold rounded-lg py-4 text-lg transition-all ${
                    tournamentName && tournamentName.trim().length !== 0
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 shadow-lg'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  Create Tournament
                </button>
              </div>
            </div>
          )}
          
          {/* Tournament Lobby Section */}
          {tournamentState === 'lobby' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tournament Info and Participants */}
              <div className="bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg">
                <div className="bg-indigo-900/50 p-6 border-b border-indigo-500/30">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white text-xl font-semibold">{tournamentName}</h3>
                    <span className="px-3 py-1 bg-green-600/70 rounded-full text-white text-sm font-medium">
                      Waiting for Players
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <div className="text-lg">
                      Players: <span className="font-bold text-white">{participants.length}/{tournamentSize}</span>
                    </div>
                    <div className="text-lg">
                      Code: <span className="font-mono font-bold text-indigo-300">{tournamentCode}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-white text-lg font-semibold mb-4">Participants</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-80 overflow-y-auto">
                    {participants.map((player, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3 border border-gray-600">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-indigo-400/60">
                            <Image 
                              src={player.avatar || "/mghalmi.jpg"} 
                              alt={player.login} 
                              width={40} 
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-white font-medium">{player.login}</div>
                            {player.isHost && (
                              <div className="text-indigo-400 text-sm">Host</div>
                            )}
                          </div>
                        </div>
                        {!player.isHost && (
                          <button 
                            onClick={() => removeParticipant(player.nickname)}
                            className="text-red-400 hover:text-red-300 p-1 rounded"
                            title="Remove participant"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: tournamentSize - participants.length }).map((_, index) => (
                      <div key={`empty-${index}`} className="flex items-center justify-center bg-gray-700/50 rounded-lg p-3 border border-gray-600 border-dashed min-h-[60px]">
                        <div className="text-gray-400">Waiting...</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={leaveTournament}
                      className="flex-1 py-3 bg-red-600/70 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors"
                    >
                      Leave Tournament
                    </button>
                    <button 
                      onClick={startTournament}
                      disabled={participants.length < 4}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        participants.length >= 4 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:brightness-110 text-white shadow-lg' 
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Start Tournament
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Online Player Search and Invite */}
              <OnlinePlayMode 
                onInvitePlayer={handleInvitePlayer} 
                pendingInvites={pendingInvites}
                sentInvites={sentInvites}
              />
            </div>
          )}
          
          {/* Tournament Progress Section */}
          {tournamentState === 'in_progress' && !tournamentComplete && (
            <div className="bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg">
              <div className="bg-indigo-900/50 p-6 border-b border-indigo-500/30">
                <div className="flex justify-between items-center">
                  <h3 className="text-white text-xl font-semibold">{tournamentName}</h3>
                  <span className="px-4 py-2 bg-yellow-600/70 rounded-full text-white font-medium">
                    Tournament in Progress
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-gray-300 text-lg">Round {currentRound + 1}/{Math.log2(tournamentSize)}</div>
                </div>
              </div>
              <div className="p-6">
                <TournamentBracket 
                  participants={participants}
                  tournamentSize={participants.length}
                  matches={matches}
                  currentRound={currentRound}
                  onMatchUpdate={handleMatchUpdate}
                />
              </div>
            </div>
          )}

          {/* Tournament Complete View */}
          {tournamentComplete && (
            <div className="bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg">
              <div className="bg-green-900/50 p-6 border-b border-green-500/30">
                <div className="flex justify-between items-center">
                  <h3 className="text-white text-xl font-semibold">{tournamentName}</h3>
                  <span className="px-4 py-2 bg-green-600/70 rounded-full text-white font-medium">
                    Tournament Complete
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-2 rounded-full mb-6">
                    <div className="w-32 h-32 rounded-full bg-gray-600 overflow-hidden border-4 border-yellow-500">
                      <Image 
                        src={champion?.avatar || '/mghalmi.jpg'} 
                        alt={champion?.login || 'Champion'} 
                        width={128} 
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl text-white mb-2">Tournament Champion</h3>
                  <div className="text-yellow-400 text-4xl font-bold mb-8">{champion?.login || 'Unknown'}</div>
                </div>
                
                <TournamentBracket 
                  participants={participants}
                  tournamentSize={participants.length}
                  matches={matches}
                  currentRound={currentRound}
                  onMatchUpdate={() => {}}
                />
                
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={resetTournament}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-lg font-semibold"
                  >
                    New Tournament
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
