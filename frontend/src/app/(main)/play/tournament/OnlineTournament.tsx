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
    return { text: 'Invite', disabled: false, color: 'bg-green-600 hover:bg-green-700' };
  };
  
  return (
    <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
      <h3 className="text-white text-xl font-semibold mb-4">Invite Players</h3>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#2a2f3a] text-white rounded-lg border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
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
              <div key={player.name} className="flex items-center justify-between p-3 hover:bg-[#2a2f3a] rounded-lg transition-colors border border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600">
                      <Image 
                        src={player.avatar} 
                        alt={player.name} 
                        width={40} 
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a1d23] ${
                      player.GameStatus === 'Available' ? 'bg-green-500' : 
                      player.GameStatus === 'In a match' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{player.name}</h3>
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !isAvailable
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : buttonState.disabled
                      ? `${buttonState.color} text-white cursor-not-allowed`
                      : `${buttonState.color} text-white`
                  }`}
                >
                  {!isAvailable ? 'Unavailable' : buttonState.text}
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No players found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ParticipantItem = ({ player, removeParticipant, isHost }: {
  player: any;
  removeParticipant: (nickname: string) => void;
  isHost: boolean;
}) => {
  return (
    <div className="flex items-center bg-[#1a1d23] rounded-lg p-3 hover:bg-[#2a2f3a] transition-all border border-gray-700/50">
      <div className="w-10 h-10 rounded-full bg-[#2a2f3a] flex-shrink-0 overflow-hidden mr-3 border border-gray-600">
        <Image 
          src={player.avatar} 
          alt={player.login} 
          width={40}  
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <div className="text-white font-medium">{player.login}</div>
        {player.nickname && (
          <div className="text-gray-400 text-sm">{player.nickname}</div>
        )}
        {player.isHost && (
          <div className="text-blue-400 text-xs">Host</div>
        )}
      </div>
      {!player.isHost && isHost && (
        <button 
          onClick={() => removeParticipant(player.nickname)}
          className="ml-2 text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-400/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

const RoundControls = ({ currentRound, totalRounds, onAdvanceRound, canAdvance }: {
  currentRound: number;
  totalRounds: number;
  onAdvanceRound: () => void;
  canAdvance: boolean;
}) => {
  return (
    <div className="flex items-center justify-center mb-6 bg-[#1a1d23] rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center space-x-3">
        <span className="text-white text-lg">Round:</span>
        <span className="text-blue-400 font-bold text-xl">{currentRound + 1}/{totalRounds}</span>
      </div>
      
      <button
        onClick={onAdvanceRound}
        disabled={!canAdvance}
        className={`ml-6 px-6 py-2 rounded-lg text-white font-medium transition-colors ${
          canAdvance
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-600 cursor-not-allowed opacity-50'
        }`}
      >
        {currentRound + 1 === totalRounds ? "End Tournament" : "Next Round"}
      </button>
    </div>
  );
};

// Main Tournament Component
export default function OnlineTournament() {
  const [tournamentState, setTournamentState] = useState('setup'); // setup, lobby, in_progress
  const [tournamentName, setTournamentName] = useState('Online Pong Championship');
  const [tournamentSize, setTournamentSize] = useState(4);
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

  const totalRounds = Math.log2(tournamentSize);

  // Helper function to get display name
  const getDisplayName = (player: any) => {
    return player?.nickname?.trim() || player?.login || 'Unknown Player';
  };

  // Handle match updates
  const handleMatchUpdate = (roundIndex: number, matchIndex: number, newState: string) => {
    setMatches(prevMatches => {
      const updatedMatches = [...prevMatches];
      const matchToUpdateIndex = updatedMatches.findIndex(
        m => m.round === roundIndex && m.matchIndex === matchIndex
      );
      
      if (matchToUpdateIndex === -1) return prevMatches;
      
      const matchToUpdate = { ...updatedMatches[matchToUpdateIndex] };
      matchToUpdate.state = newState;
      updatedMatches[matchToUpdateIndex] = matchToUpdate;
      
      // If we have a winner, update next round's match
      if (newState === MATCH_STATES.PLAYER1_WIN || newState === MATCH_STATES.PLAYER2_WIN) {
        const winner = newState === MATCH_STATES.PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
        
        // Check if this is the final match
        if (roundIndex === totalRounds - 1) {
          setChampion(winner);
          setTournamentComplete(true);
        }
        // Calculate position in next round
        else if (roundIndex < totalRounds - 1) {
          const nextRound = roundIndex + 1;
          const nextMatchIndex = Math.floor(matchIndex / 2);
          const isFirstMatchOfPair = matchIndex % 2 === 0;
          
          const nextMatchIndex2 = updatedMatches.findIndex(
            m => m.round === nextRound && m.matchIndex === nextMatchIndex
          );
          
          if (nextMatchIndex2 !== -1) {
            const nextMatch = { ...updatedMatches[nextMatchIndex2] };
            
            // Update player1 or player2 based on which match this was
            if (isFirstMatchOfPair) {
              nextMatch.player1 = winner;
            } else {
              nextMatch.player2 = winner;
            }
            
            updatedMatches[nextMatchIndex2] = nextMatch;
          }
        }
      }
      
      return updatedMatches;
    });
  };

  // Check if all matches in current round are completed
  const canAdvanceRound = () => {
    const currentRoundMatches = matches.filter(m => m.round === currentRound);
    return currentRoundMatches.length > 0 && currentRoundMatches.every(m => 
      m.state === MATCH_STATES.PLAYER1_WIN || m.state === MATCH_STATES.PLAYER2_WIN
    );
  };

  // Advance to next round
  const advanceRound = () => {
    if (currentRound < totalRounds - 1) {
      setCurrentRound(prevRound => prevRound + 1);
    } else {
      // Tournament is completed
      const finalMatch = matches.find(m => m.round === totalRounds - 1 && m.matchIndex === 0);
      if (finalMatch) {
        const winner = finalMatch.state === MATCH_STATES.PLAYER1_WIN ? 
          finalMatch.player1 : finalMatch.player2;
        setChampion(winner);
      }
      setTournamentComplete(true);
    }
  };

  // Start tournament logic
  const startTournament = () => {
    if (participants.length < tournamentSize) {
      alert(`You need ${tournamentSize} players to start the tournament!`);
      return;
    }
    
    // Initialize tournament bracket
    const initialMatches = [];
    
    // Create first round matches
    for (let i = 0; i < tournamentSize / 2; i++) {
      const player1 = participants[i * 2] || null;
      const player2 = participants[i * 2 + 1] || null;
      
      initialMatches.push({
        id: crypto.randomUUID(),
        round: 0,
        matchIndex: i,
        player1: player1,
        player2: player2,
        state: MATCH_STATES.WAITING
      });
    }
    
    // Create placeholder matches for future rounds
    for (let round = 1; round < totalRounds; round++) {
      const matchesInRound = tournamentSize / Math.pow(2, round + 1);
      
      for (let i = 0; i < matchesInRound; i++) {
        initialMatches.push({
          id: crypto.randomUUID(),
          round: round,
          matchIndex: i,
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

  // Get players who are still in the tournament (not eliminated)
  const getActivePlayers = () => {
    const eliminatedPlayerIds = new Set();
    
    // Find all eliminated players
    matches.forEach(match => {
      if (match.state === MATCH_STATES.PLAYER1_WIN && match.player2) {
        eliminatedPlayerIds.add(match.player2.id);
      } else if (match.state === MATCH_STATES.PLAYER2_WIN && match.player1) {
        eliminatedPlayerIds.add(match.player1.id);
      }
    });
    
    // Return active players
    return participants.filter(p => !eliminatedPlayerIds.has(p.id));
  };

  return (
    <div className="h-full w-full text-white">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <h1 className="text-center text-4xl md:text-5xl font-bold mb-8">
            {tournamentState === 'setup' ? "Online Tournament" : tournamentName}
          </h1>
          
          {/* Tournament Setup Section */}
          {tournamentState === 'setup' && (
            <div className="space-y-6">
              {/* Tournament Settings */}
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
                <h2 className="text-2xl font-semibold mb-6">Tournament Setup</h2>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 text-lg">Tournament Name</label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="bg-[#2a2f3a] text-white rounded-lg px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-lg"
                    placeholder="Enter tournament name"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-3 text-lg">Tournament Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[4, 8, 16].map(size => (
                      <button 
                        key={size} 
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${tournamentSize === size ? 
                          'bg-blue-600 text-white' : 
                          'bg-[#2a2f3a] text-gray-300 hover:bg-[#3a3f4a] border border-gray-600'}`}
                        onClick={() => setTournamentSize(size)}
                      >
                        {size} Players
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Create Button */}
              <div className="text-center">
                <button
                  onClick={() => setTournamentState('lobby')}
                  disabled={!tournamentName || tournamentName.trim().length === 0}
                  className={`w-full max-w-md text-white font-semibold rounded-lg py-4 text-xl transition-all ${
                    tournamentName && tournamentName.trim().length !== 0
                      ? 'bg-green-600 hover:bg-green-700'
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tournament Info and Participants */}
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-white">Tournament Lobby</h3>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-yellow-600/70 rounded-full text-white text-sm font-medium">
                      Waiting for Players
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white text-lg font-medium">Participants ({participants.length}/{tournamentSize})</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {participants.map((player) => (
                      <ParticipantItem
                        key={player.id}
                        player={player}
                        removeParticipant={removeParticipant}
                        isHost={true}
                      />
                    ))}
                    
                    {/* Empty slots */}
                    {Array.from({ length: tournamentSize - participants.length }).map((_, index) => (
                      <div key={`empty-${index}`} className="flex items-center justify-center bg-[#1a1d23] rounded-lg p-3 border border-gray-700/50 border-dashed min-h-[58px]">
                        <div className="text-gray-400">Waiting for player...</div>
                      </div>
                    ))}
                  </div>
                  
                  {participants.length < tournamentSize && (
                    <div className="text-yellow-400 text-sm mb-4">
                      You need to invite {tournamentSize - participants.length} more players
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={leaveTournament}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel Tournament
                  </button>
                  <button
                    onClick={startTournament}
                    disabled={participants.length < tournamentSize}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      participants.length >= tournamentSize
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 cursor-not-allowed text-gray-400'
                    }`}
                  >
                    Start Tournament
                  </button>
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
            <div className="space-y-6">
              <RoundControls
                currentRound={currentRound}
                totalRounds={totalRounds}
                onAdvanceRound={advanceRound}
                canAdvance={canAdvanceRound()}
              />
              
              <TournamentBracket
                participants={participants}
                tournamentSize={tournamentSize}
                matches={matches}
                currentRound={currentRound}
                onMatchUpdate={handleMatchUpdate}
              />
              
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Active Players</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {getActivePlayers().map(player => (
                    <div key={player.id} className="flex flex-col items-center bg-[#2a2f3a] rounded-lg p-3 border border-gray-600">
                      <div className="w-12 h-12 rounded-full bg-[#3a3f4a] overflow-hidden border-2 border-green-500">
                        <Image 
                          src={player.avatar} 
                          alt={player.login} 
                          width={48} 
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-green-400 text-sm mt-2 truncate max-w-full font-medium">
                        {getDisplayName(player)}
                      </div>
                      {player.nickname && player.nickname !== player.login && (
                        <div className="text-gray-400 text-xs truncate max-w-full">
                          ({player.login})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tournament Complete View */}
          {tournamentComplete && (
            <div className="text-center space-y-6">
              <div className="bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50">
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-2 rounded-full mb-6">
                    <div className="w-32 h-32 rounded-full bg-[#2a2f3a] overflow-hidden border-4 border-yellow-500">
                      <Image 
                        src={champion?.avatar || '/mghalmi.jpg'} 
                        alt={champion?.login || 'Champion'} 
                        width={128} 
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-2">🏆 Tournament Champion</h2>
                  <div className="text-yellow-400 text-4xl font-bold mb-2">
                    {champion ? getDisplayName(champion) : 'Unknown'}
                  </div>
                  {champion?.nickname && champion.nickname !== champion.login && (
                    <div className="text-yellow-300 text-xl mb-6">
                      ({champion.login})
                    </div>
                  )}
                </div>
              </div>
              
              <TournamentBracket
                participants={participants}
                tournamentSize={tournamentSize}
                matches={matches}
                currentRound={currentRound}
                onMatchUpdate={() => {}} // No more updates allowed
              />
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetTournament}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors"
                >
                  New Tournament
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}