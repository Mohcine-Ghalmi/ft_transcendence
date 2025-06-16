"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { user } from '@/data/mockData';
import MATCH_STATES from './match_states';
import TournamentBracket from './TournamentBracket';

// Tournament Bracket Component for Local Tournament

const ParticipantItem = ({ player, removeParticipant, changeParticipantName }) => {
  return (
    <div className="flex items-center bg-gray-700/80 rounded-lg p-2 backdrop-blur-sm hover:bg-gray-700 transition-all">
      <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden mr-2 border border-indigo-400">
        <Image 
          src={player.avatar} 
          alt={player.login} 
          width={32}  
          height={32}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <input 
          type="text" 
          value={player.login}
          onChange={(e) => changeParticipantName(player.id, e.target.value)}
          className="bg-gray-600/80 text-white rounded px-2 py-1 w-full outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-500 text-sm"
          minLength={1}
          required
          placeholder="Login cannot be empty"
        />
      </div>
      {!player.is_user && (
        <button 
          onClick={() => removeParticipant(player.id)}
          className="ml-1 text-red-400 hover:text-red-300 transition-colors p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

const RoundControls = ({ currentRound, totalRounds, onAdvanceRound, canAdvance }) => {
  return (
    <div className="flex items-center justify-center mb-4 bg-gray-700/60 rounded-lg p-2">
      <div className="flex items-center space-x-2">
        <span className="text-white">Round:</span>
        <span className="text-indigo-300 font-bold">{currentRound + 1}/{totalRounds}</span>
      </div>
      
      <button
        onClick={onAdvanceRound}
        disabled={!canAdvance}
        className={`ml-4 px-3 py-1 rounded text-white text-sm ${
          canAdvance
            ? 'bg-indigo-600 hover:bg-indigo-500'
            : 'bg-gray-600 cursor-not-allowed'
        }`}
      >
        {currentRound + 1 === totalRounds ? "End Tournament" : "Next Round"}
      </button>
    </div>
  );
};

const LocalTournamentMode = () => {
  const [participants, setParticipants] = useState([
    { id: crypto.randomUUID(), login: user.name, avatar: user.avatar, ready: true, is_user: true}
  ]);
  const [tournamentName, setTournamentName] = useState("Local Pong Championship");
  const [tournamentSize, setTournamentSize] = useState(4);
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [matches, setMatches] = useState([]);
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [champion, setChampion] = useState(null);
  
  const totalRounds = Math.log2(tournamentSize);
  
  // Initialize tournament matches
  const initializeTournament = () => {
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
    setTournamentStarted(true);
  };
  
  // Update match state and propagate winners to next round
  const handleMatchUpdate = (roundIndex, matchIndex, newState) => {
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
  
  const addParticipant = () => {
    if (participants.length < tournamentSize) {
      setParticipants([
        ...participants,
        { 
          id: crypto.randomUUID(),
          login: `Player ${participants.length + 1}`, 
          avatar: `/mghalmi.jpg`, 
          ready: true,
          is_user: false
        }
      ]);
    }
  };
  
  const removeParticipant = (id) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(player => player.id !== id));
    }
  };
  
  const changeParticipantName = (id, newLogin) => {
    setParticipants(participants.map(player => 
      player.id === id ? { ...player, login: newLogin } : player
    ));
  };
  
  const startTournament = () => {
    initializeTournament();
  };
  
  const resetTournament = () => {
    setTournamentStarted(false);
    setCurrentRound(0);
    setMatches([]);
    setTournamentComplete(false);
    setChampion(null);
  };

return (
  <div className="bg-gray-800/70 rounded-xl p-4 backdrop-blur-sm border border-gray-700 max-w-7xl mx-auto">
      <h2 className="text-2xl text-white font-bold mb-4 text-center">{tournamentStarted ? tournamentName : "Local Tournament Setup"}</h2>
    <div className="bg-gray-800/80 rounded-lg p-5 border border-gray-700 shadow-lg">
      {!tournamentStarted && (
        <div className="space-y-4">
          {/* Tournament Settings */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Tournament Name</label>
            <input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="bg-gray-700 text-white rounded px-3 py-2 w-full outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600"
              placeholder="Enter tournament name"
              required
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
          
          {/* Participants List */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl text-white">Participants ({participants.length}/{tournamentSize})</h3>
              <button
                onClick={addParticipant}
                disabled={participants.length >= tournamentSize}
                className={`px-5 py-1 rounded text-white text-1xl ${
                  participants.length < tournamentSize
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Add Player
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {participants.map(player => (
                <ParticipantItem
                  key={player.id}
                  player={player}
                  removeParticipant={removeParticipant}
                  changeParticipantName={changeParticipantName}
                />
              ))}
            </div>
            
            {participants.length < tournamentSize && (
              <div className="text-yellow-400 text-sm mt-2">
                You need to add {tournamentSize - participants.length} more players 
              </div>
            )}
          </div>
          
          {/* Start Button */}
          <div className="mt-8 text-center">
            <button
              onClick={startTournament}
              disabled={participants.length < tournamentSize ||  !tournamentName}
              className={`w-full text-white font-medium rounded-lg py-2.5 transition-all ${
                participants.length >= tournamentSize && tournamentName &&
                !participants.some(participant => !participant.login || participant.login.trim() === '') &&
                new Set(participants.map(p => p.login?.trim())).size === participants.filter(p => p.login?.trim()).length
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              Start Tournament
            </button>
          </div>
        </div>
      )}
      
      {/* Tournament Started View */}
      {tournamentStarted && !tournamentComplete && (
        <div>
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
          
          <div className="mt-6">
            <h3 className="text-xl text-white mb-3">Active Players</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {getActivePlayers().map(player => (
                <div key={player.id} className="flex flex-col items-center bg-gray-700/60 rounded-lg p-2">
                  <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden border border-indigo-400">
                    <Image 
                      src={player.avatar} 
                      alt={player.login} 
                      width={40} 
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-green-300 text-sm mt-1 truncate max-w-full">
                    {player.login}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Tournament Complete View */}
      {tournamentComplete && (
        <div className="flex flex-col items-center mt-">
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
          
          <TournamentBracket
            participants={participants}
            tournamentSize={tournamentSize}
            matches={matches}
            currentRound={currentRound}
            onMatchUpdate={() => {}} // No more updates allowed
          />
          
          <div className="mt-8 flex space-x-4">
            <button
              onClick={resetTournament}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
            >
              New Tournament
            </button>
            
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default LocalTournamentMode;