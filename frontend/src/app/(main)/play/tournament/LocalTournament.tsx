"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { user } from '@/data/mockData';
import {MATCH_STATES} from '../../../../data/mockData';
import TournamentBracket from './TournamentBracket';
import {PingPongGame} from '../game/PingPongGame';

// Tournament Bracket Component for Local Tournament

const ParticipantItem = ({ player, removeParticipant, changeParticipantName, changeParticipantNickname }: {
  player: any;
  removeParticipant: (id: string) => void;
  changeParticipantName: (id: string, name: string) => void;
  changeParticipantNickname: (id: string, nickname: string) => void;
}) => {
  return (
    <div className="flex items-center bg-[#1a1d23] rounded-lg p-3 hover:bg-[#2a2f3a] transition-all border border-gray-700/50">
      <div className="w-10 h-10 rounded-full bg-[#2a2f3a] flex-shrink-0 overflow-hidden mr-3 border border-gray-600">
        <Image 
          src={`/images/${player.avatar}`} 
          alt={player.name} 
          width={40}  
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow space-y-2">
        <input 
          type="text" 
          value={player.name}
          onChange={(e) => changeParticipantName(player.id, e.target.value)}
          className="bg-[#2a2f3a] text-white rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-sm placeholder-gray-400"
          minLength={1}
          required
          placeholder="Enter player name"
        />
        <input 
          type="text" 
          value={player.nickname || ''}
          onChange={(e) => changeParticipantNickname(player.id, e.target.value)}
          className="bg-[#2a2f3a] text-gray-300 rounded-lg px-3 py-1 w-full outline-none focus:ring-2 focus:ring-blue-400 border border-gray-600 text-xs placeholder-gray-500"
          placeholder="Enter nickname (optional)"
        />
      </div>
      {!player.is_user && (
        <button 
          onClick={() => removeParticipant(player.id)}
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

const LocalTournamentMode = () => {
  const [participants, setParticipants] = useState([
    { 
      id: crypto.randomUUID(), 
      name: user.name, 
      nickname: user.nickname || '', 
      avatar: `/avatar/Default.svg`, 
      ready: true, 
      is_user: true
    }
  ]);
  const [tournamentName, setTournamentName] = useState("Local Pong Championship");
  const [tournamentSize, setTournamentSize] = useState(4);
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [champion, setChampion] = useState<any>(null);
  const [playingMatch, setPlayingMatch] = useState<any>(null);
  const [showMatchResult, setShowMatchResult] = useState(false);
  const [matchWinner, setMatchWinner] = useState<any>(null);
  
  const totalRounds = Math.log2(tournamentSize);
  
  // Helper function to get display name (nickname if available, otherwise name)
  const getDisplayName = (player: any) => {
    return player?.nickname?.trim() || player?.name || 'Unknown Player';
  };
  
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
          name: `Player ${participants.length + 1}`, 
          nickname: '',
          avatar: `/avatar/Default.svg`, 
          ready: true,
          is_user: false
        }
      ]);
    }
  };
  
  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(player => player.id !== id));
    }
  };
  
  const changeParticipantName = (id: string, newName: string) => {
    setParticipants(participants.map(player => 
      player.id === id ? { ...player, name: newName } : player
    ));
  };
  
  const changeParticipantNickname = (id: string, newNickname: string) => {
    setParticipants(participants.map(player => 
      player.id === id ? { ...player, nickname: newNickname } : player
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
    setPlayingMatch(null);
    setShowMatchResult(false);
    setMatchWinner(null);
  };

  // Start a match in PingPongGame
  const handlePlayMatch = (match: any) => {
    setPlayingMatch(match);
  };

  // Handle winner from PingPongGame - Fixed with proper null checks
  const handleGameEnd = (winner?: any) => {
    // if (!playingMatch || !playingMatch.player1 || !playingMatch.player2) {
    //   console.error('Invalid match or missing players');
    //   return;
    // }
    
    console.log('Game ended. Winner:', winner, 'Playing match:', playingMatch);
    
    // Enhanced validation with better error handling
    if (!playingMatch) {
      console.error('No playing match found');
      return;
    }

    // If no winner is provided (game was exited), just go back to tournament
    if (!winner) {
      setPlayingMatch(null);
      return;
    }
    
    // Ensure winner has required properties
    if (!winner.id) {
      console.error('Winner missing id property');
      return;
    }
    
    // Set match winner and show result
    setMatchWinner(winner);
    setShowMatchResult(true);
    
    // Update match state - Fixed null checks
    const matchState = winner.id === playingMatch.player1?.id 
      ? MATCH_STATES.PLAYER1_WIN 
      : MATCH_STATES.PLAYER2_WIN;
    
    handleMatchUpdate(playingMatch.round, playingMatch.matchIndex, matchState);
  };

  // Continue tournament after showing match result
  const handleContinueTournament = () => {
    setShowMatchResult(false);
    setMatchWinner(null);
    setPlayingMatch(null);
  };

  // Start matches for current round
  const startCurrentRoundMatches = () => {
    const currentRoundMatches = matches.filter(m => 
      m.round === currentRound && 
      m.state === MATCH_STATES.WAITING && 
      m.player1 && 
      m.player2
    );
    
    if (currentRoundMatches.length === 0) {
      alert('No matches ready to start in the current round.');
      return;
    }
    
    // Start the first available match
    const firstMatch = currentRoundMatches[0];
    setPlayingMatch(firstMatch);
  };

  return (
    <div className="h-full w-full text-white">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
            {(!playingMatch || showMatchResult) && (
            <h1 className="text-center text-4xl md:text-5xl font-bold mb-8">
              {tournamentStarted ? tournamentName : "Local Tournament"}
            </h1>
            )}
          
          {!tournamentStarted && (
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
              
              {/* Participants List */}
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-white">Participants ({participants.length}/{tournamentSize})</h3>
                  <button
                    onClick={addParticipant}
                    disabled={participants.length >= tournamentSize}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      participants.length < tournamentSize
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 cursor-not-allowed text-gray-400'
                    }`}
                  >
                    Add Player
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {participants.map(player => (
                    <ParticipantItem
                      key={player.id}
                      player={player}
                      removeParticipant={removeParticipant}
                      changeParticipantName={changeParticipantName}
                      changeParticipantNickname={changeParticipantNickname}
                    />
                  ))}
                </div>
                
                {participants.length < tournamentSize && (
                  <div className="text-yellow-400 text-sm mt-3">
                    You need to add {tournamentSize - participants.length} more players 
                  </div>
                )}
              </div>
              
              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={startTournament}
                  disabled={participants.length < tournamentSize || !tournamentName}
                  className={`w-full max-w-md text-white font-semibold rounded-lg py-4 text-xl transition-all ${
                    participants.length >= tournamentSize && tournamentName &&
                    !participants.some(participant => !participant.name || participant.name.trim() === '') &&
                    new Set(participants.map(p => p.name?.trim())).size === participants.filter(p => p.name?.trim()).length
                      ? 'bg-green-600 hover:bg-green-700'
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
            <div className="space-y-6">
              {/* Match Result Modal */}
              {showMatchResult && matchWinner && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                  <div className="bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50 max-w-md w-full mx-4 text-center">
                    <div className="mb-6">
                      <div className="w-24 h-24 rounded-full bg-[#2a2f3a] overflow-hidden border-4 border-green-500 mx-auto mb-4">
                        <Image 
                          src={`/images/${matchWinner.avatar}` || '/avatar/Default.svg'} 
                          alt={matchWinner.name || 'Winner'} 
                          width={96} 
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Match Winner!</h2>
                      <div className="text-green-400 text-2xl font-bold mb-2">
                        {getDisplayName(matchWinner)}
                      </div>
                      {matchWinner.nickname && matchWinner.nickname !== matchWinner.name && (
                        <div className="text-green-300 text-lg">
                          ({matchWinner.name})
                        </div>
                      )}
                    </div>
                    <p className="text-gray-300 mb-6">
                      {getDisplayName(matchWinner)} advances to the next round!
                    </p>
                    <button
                      onClick={handleContinueTournament}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
                    >
                      Continue Tournament
                    </button>
                  </div>
                </div>
              )}

              {/* If a match is being played, show PingPongGame */}
              {playingMatch && !showMatchResult ? (
                <PingPongGame
                  player1={playingMatch.player1}
                  player2={playingMatch.player2}
                  onExit={handleGameEnd}
                  isTournamentMode={true}
                />
              ) : (
                <>
                  <RoundControls
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                    onAdvanceRound={advanceRound}
                    canAdvance={canAdvanceRound()}
                  />
                  
                  {/* Start Matches Button */}
                  <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4">Tournament Controls</h3>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={startCurrentRoundMatches}
                        disabled={matches.filter(m => 
                          m.round === currentRound && 
                          m.state === MATCH_STATES.WAITING && 
                          m.player1 && 
                          m.player2
                        ).length === 0}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          matches.filter(m => 
                            m.round === currentRound && 
                            m.state === MATCH_STATES.WAITING && 
                            m.player1 && 
                            m.player2
                          ).length > 0
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 cursor-not-allowed text-gray-400'
                        }`}
                      >
                        Start Next Match
                      </button>
                      <div className="text-gray-300 text-sm flex items-center">
                        {matches.filter(m => 
                          m.round === currentRound && 
                          m.state === MATCH_STATES.WAITING && 
                          m.player1 && 
                          m.player2
                        ).length} matches waiting in Round {currentRound + 1}
                      </div>
                    </div>
                  </div>
                  
                  <TournamentBracket
                    participants={participants}
                    tournamentSize={tournamentSize}
                    matches={matches}
                    currentRound={currentRound}
                    onMatchUpdate={handleMatchUpdate}
                    onPlayMatch={handlePlayMatch}
                  />
                  
                  <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4">Active Players</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {getActivePlayers().map(player => (
                        <div key={player.id} className="flex flex-col items-center bg-[#2a2f3a] rounded-lg p-3 border border-gray-600">
                          <div className="w-12 h-12 rounded-full bg-[#3a3f4a] overflow-hidden border-2 border-green-500">
                            <Image 
                              src={`/images/${player.avatar}`} 
                              alt={player.name} 
                              width={48} 
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-green-400 text-sm mt-2 truncate max-w-full font-medium">
                            {getDisplayName(player)}
                          </div>
                          {player.nickname && player.nickname !== player.name && (
                            <div className="text-gray-400 text-xs truncate max-w-full">
                              ({player.name})
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
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
                        src={`/images/${champion?.avatar}`} 
                        alt={champion?.name || 'Champion'} 
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
                  {champion?.nickname && champion.nickname !== champion.name && (
                    <div className="text-yellow-300 text-xl mb-6">
                      ({champion.name})
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
                onPlayMatch={() => {}} // No more matches to play
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

export default LocalTournamentMode;
