"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {MATCH_STATES} from '../../../../data/mockData';
import TournamentBracket from './TournamentBracket';
import { user, onlineFriends } from '@/data/mockData';

const OnlinePlayMode = ({ onInvitePlayer, pendingInvites, sentInvites }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState(onlineFriends);
  
  // Filter online players based on search query
  const filteredPlayers = friends.filter(player =>
    player.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get button state for a player
  const getPlayerButtonState = (player) => {
    if (pendingInvites.has(player.name)) {
      return { text: 'Pending...', disabled: true, color: 'bg-yellow-600' };
    }
    if (sentInvites.has(player.name)) {
      return { text: 'Invited', disabled: true, color: 'bg-blue-600' };
    }
    return { text: 'Invite', disabled: false, color: 'bg-green-600 hover:bg-green-500' };
  };
  
  return (
    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
      <h4 className="text-white text-sm font-medium mb-2">Find Players</h4>
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-600"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => {
            const buttonState = getPlayerButtonState(player);
            return (
              <div key={player.name} className="flex items-center justify-between bg-gray-800 rounded-lg p-2 border border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-gray-500">
                    <Image 
                      src={player.avatar} 
                      alt={player.name} 
                      width={32} 
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-white text-sm">{player.name}</div>
                    <div className="flex items-center text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                        player.GameStatus === 'Available' ? 'bg-green-500' : 
                        player.GameStatus === 'In a match' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className={
                        player.GameStatus === 'Available' ? 'text-green-400' : 
                        player.GameStatus === 'In a match' ? 'text-yellow-400' : 'text-red-400'
                      }>
                        {player.GameStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onInvitePlayer(player)}
                  disabled={buttonState.disabled || player.GameStatus !== 'Available'}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    player.GameStatus !== 'Available'
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : `${buttonState.color} text-white`
                  }`}
                >
                  {player.GameStatus !== 'Available' ? 'Unavailable' : buttonState.text}
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-400">
            No players found matching your search
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
  const handleMatchUpdate = (roundIndex, matchIndex, newState) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      const matchToUpdate = newMatches.find(m => m.round === roundIndex && m.matchIndex === matchIndex);
      
      if (matchToUpdate) {
        matchToUpdate.state = newState;
        
        // If the match is over, update the next round's match
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
          
          // Check if this is the final match
          if (roundIndex === Math.log2(tournamentSize) - 1) {
            const winner = newState === MATCH_STATES.PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
            setChampion(winner);
            setTournamentComplete(true);
          }
          
          // Check if all matches in the current round are complete
          const roundMatches = newMatches.filter(m => m.round === roundIndex);
          const allMatchesComplete = roundMatches.every(m => 
            m.state === MATCH_STATES.PLAYER1_WIN || m.state === MATCH_STATES.PLAYER2_WIN
          );
          
          // Move to next round if all matches are complete
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
  const handleInvitePlayer = (player) => {
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
  const removeParticipant = (playerNickname) => {
    if (playerNickname === user.nickname) return; // Can't remove host
    setParticipants(prev => prev.filter(p => p.nickname !== playerNickname));
  };

  // Reset tournament
  const resetTournament = () => {
    leaveTournament();
  };

  return (
    <div className="bg-gray-800/70 rounded-xl p-4 backdrop-blur-sm border border-gray-700 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Online Tournament Mode
      </h2>
      
      {/* Tournament Setup Section */}
      {tournamentState === 'setup' && (
        <div className="bg-gray-800/80 rounded-lg p-5 border border-gray-700 shadow-lg">
          <h3 className="text-white text-lg font-semibold mb-3">Create Tournament</h3>
          <div className="mb-4">
            <label className="block text-white text-sm mb-1">Tournament Name</label>
            <input 
              type="text" 
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600"
              placeholder="Enter tournament name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm mb-2">Tournament Size</label>
            <div className="grid grid-cols-3 gap-2">
              {[4, 8, 16].map(size => (
                <button 
                  key={size} 
                  className={`py-2 px-3 rounded-lg ${tournamentSize === size ? 
                    'bg-indigo-600 text-white' : 
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
            disabled={!tournamentName || tournamentName.trim().length == 0}
            className={`w-full text-white font-medium rounded-lg py-2.5 transition-all ${
                     tournamentName && tournamentName.trim().length != 0
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
          >
            Create Tournament
          </button>
        </div>
      )}
      
      {/* Tournament Lobby Section */}
      {tournamentState === 'lobby' && (
        <div className="bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          <div className="bg-indigo-900/50 p-4 border-b border-indigo-500/30">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-lg font-semibold">{tournamentName}</h3>
              <span className="px-3 py-1 bg-green-600/70 rounded-full text-white text-xs font-medium">
                Waiting for Players
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-gray-300 text-sm">
                Players: {participants.length}/{tournamentSize}
              </div>
              <div className="text-gray-300 text-sm">
                Code: <span className="font-mono font-bold">{tournamentCode}</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h4 className="text-white font-medium mb-3">Participants</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 max-h-48 overflow-y-auto">
              {participants.map((player, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-2 border border-gray-600">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-indigo-400/60">
                      <Image 
                        src={player.avatar || "/mghalmi.jpg"} 
                        alt={player.login} 
                        width={32} 
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate max-w-[100px]">
                      <div className="text-white text-sm truncate">{player.login}</div>
                      {player.isHost && (
                        <div className="text-indigo-400 text-xs">Host</div>
                      )}
                    </div>
                  </div>
                  {!player.isHost && (
                    <button 
                      onClick={() => removeParticipant(player.nickname)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove participant"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: tournamentSize - participants.length }).map((_, index) => (
                <div key={`empty-${index}`} className="flex items-center justify-center bg-gray-700/50 rounded-lg p-2 border border-gray-600 border-dashed">
                  <div className="text-gray-400 text-sm">Waiting...</div>
                </div>
              ))}
            </div>
            
            {/* Online Play Mode for inviting players */}
            <OnlinePlayMode 
              onInvitePlayer={handleInvitePlayer} 
              pendingInvites={pendingInvites}
              sentInvites={sentInvites}
            />
            
            <div className="flex justify-between gap-3 mt-6">
              <button 
                onClick={leaveTournament}
                className="flex-grow py-2 bg-red-600/70 hover:bg-red-500 rounded-lg text-white font-medium transition-colors"
              >
                Leave Tournament
              </button>
              <button 
                onClick={startTournament}
                disabled={participants.length < 4}
                className={`flex-grow py-2 rounded-lg font-medium transition-all ${
                  participants.length >= 4 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:brightness-110 text-white' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Start Tournament
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tournament Progress Section */}
      {tournamentState === 'in_progress' && !tournamentComplete && (
        <div className="bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          <div className="bg-indigo-900/50 p-4 border-b border-indigo-500/30">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-lg font-semibold">{tournamentName}</h3>
              <span className="px-3 py-1 bg-yellow-600/70 rounded-full text-white text-xs font-medium">
                Tournament in Progress
              </span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-gray-300 text-sm">Round {currentRound + 1}/{Math.log2(tournamentSize)}</div>
            </div>
          </div>
          <div className="p-4">
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
        <div className="bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          <div className="bg-green-900/50 p-4 border-b border-green-500/30">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-lg font-semibold">{tournamentName}</h3>
              <span className="px-3 py-1 bg-green-600/70 rounded-full text-white text-xs font-medium">
                Tournament Complete
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-1 rounded-full mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-600 overflow-hidden border-4 border-yellow-500">
                  <Image 
                    src={champion?.avatar || '/mghalmi.jpg'} 
                    alt={champion?.login || 'Champion'} 
                    width={96} 
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <h3 className="text-2xl text-white mb-1">Tournament Champion</h3>
              <div className="text-yellow-400 text-3xl font-bold mb-6">{champion?.login || 'Unknown'}</div>
            </div>
            
            <TournamentBracket 
              participants={participants}
              tournamentSize={participants.length}
              matches={matches}
              currentRound={currentRound}
              onMatchUpdate={() => {}} // No more updates allowed
            />
            
            <div className="mt-8 flex space-x-4 justify-center">
              <button
                onClick={resetTournament}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
              >
                New Tournament
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}