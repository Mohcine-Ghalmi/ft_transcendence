"use client";

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import {MATCH_STATES} from '../../../../data/mockData';
import TournamentBracket from './TournamentBracket';
import { useAuthStore } from '@/(zustand)/useAuthStore';
import { getSocketInstance } from '@/(zustand)/useAuthStore';
import CryptoJS from 'crypto-js';
import { PlayerListItem } from '../../play/OneVsOne/Online';

interface Player {
  name: string;
  email: string;
  avatar: string;
  GameStatus: string;
  nickname: string;
}

interface OnlinePlayModeProps {
  onInvitePlayer: (player: Player) => void;
  pendingInvites: Map<string, any>;
  sentInvites: Map<string, any>;
}

const OnlinePlayMode = ({ onInvitePlayer, pendingInvites, sentInvites, friends }: OnlinePlayModeProps & { friends: Player[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Use the same filtering logic as OneVsOne
  const filteredPlayers = friends.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="bg-[#0f1419] rounded-lg p-6 border border-[#2a2f3a]">
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
          className="w-full pl-12 pr-4 py-3 bg-[#1a1d23] text-white rounded-lg border border-[#2a2f3a] outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
      </div>
      {/* Online Players List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <h4 className="text-white text-lg font-medium mb-3">Online Players</h4>

        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player: Player, index: number) => (
            <PlayerListItem
              key={`${player.email}-${player.nickname}-${index}`}
              player={player}
              onInvite={onInvitePlayer}
              isInviting={false} // You can enhance this to match invite state
            />
          ))
        ) : (
          <div className="text-center py-8">
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
  );
};

const ParticipantItem = ({ player, removeParticipant, isHost }: {
  player: any;
  removeParticipant: (nickname: string) => void;
  isHost: boolean;
}) => {
  return (
    <div className="flex items-center bg-[#1a1d23] rounded-lg p-3 hover:bg-[#2a2f3a] transition-all border border-[#2a2f3a]">
      <div className="w-10 h-10 rounded-full bg-[#2a2f3a] flex-shrink-0 overflow-hidden mr-3 border border-[#3a3f4a]">
        <Image 
          src={`/images/${player.avatar}`} 
          alt={player.login || "zahay"} 
          width={40}  
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <div className="text-white font-medium">{player.login}</div>
        {player.nickname && player.nickname !== player.login && (
          <div className="text-gray-400 text-sm">{player.nickname}</div>
        )}
        {player.isHost && (
          <div className="text-blue-400 text-xs">Host</div>
        )}
      </div>
      {!player.isHost && isHost && (
        <button 
          onClick={() => removeParticipant(player.login)}
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
    <div className="flex items-center justify-center mb-6 bg-[#1a1d23] rounded-lg p-4 border border-[#2a2f3a]">
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
            : 'bg-[#2a2f3a] cursor-not-allowed opacity-50 border border-[#3a3f4a]'
        }`}
      >
        {currentRound + 1 === totalRounds ? "End Tournament" : "Next Round"}
      </button>
    </div>
  );
};

// Main Tournament Component
export default function OnlineTournament() {
  const { user } = useAuthStore();
  const [tournamentState, setTournamentState] = useState('setup'); // setup, lobby, in_progress
  const [tournamentName, setTournamentName] = useState('Online Pong Championship');
  const [tournamentSize, setTournamentSize] = useState(4);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [participants, setParticipants] = useState(user ? [{
    id: user.id || user.nickname || 'host',
    login: user.name, 
    avatar: user.avatar,
    nickname: user.nickname,
    isHost: true
  }] : []);
  const [matches, setMatches] = useState([]);
  const [sentInvites, setSentInvites] = useState(new Map());
  const [pendingInvites, setPendingInvites] = useState(new Map());
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [champion, setChampion] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [friends, setFriends] = useState<Player[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [invitedPlayer, setInvitedPlayer] = useState<Player | null>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [waitTime, setWaitTime] = useState(30);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = Math.log2(tournamentSize);

  // Use getSocketInstance at runtime
  let socket;

  // Fetch tournaments from backend
  useEffect(() => {
    socket = getSocketInstance();
    if (!socket) return;
    socket.emit('ListTournaments');
    socket.on('TournamentList', (data) => {
      setTournaments(data);
    });
    return () => {
      socket.off('TournamentList');
    };
  }, []);

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
          const formatted = data.friends.map((f, index) => ({
            id: f.id || `friend-${index}`,
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
    
    // For online tournaments, we would typically send socket events to start matches
    // For now, we'll just simulate starting the first match
    const firstMatch = currentRoundMatches[0];
    console.log('Starting match:', firstMatch);
    
    // Update match state to in_progress
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === firstMatch.id 
          ? { ...match, state: MATCH_STATES.IN_PROGRESS }
          : match
      )
    );
  };

  // Tournament invite handler (encrypt and emit)
  const handleInvitePlayer = async (player: Player) => {
    if (participants.length >= tournamentSize) {
      alert('Tournament is full!');
      return;
    }
    if (!tournamentId) {
      alert('Tournament not created yet!');
      return;
    }
    socket = getSocketInstance();
    if (!socket) {
      alert('Socket not connected!');
      return;
    }
    setIsInviting(true);
    setInvitedPlayer(player);
    setWaitingForResponse(true);
    setWaitTime(30);
    setInviteId(null);
    if (!process.env.NEXT_PUBLIC_ENCRYPTION_KEY) {
      alert('Encryption key not found');
      setIsInviting(false);
      setWaitingForResponse(false);
      return;
    }
    const inviteData = {
      tournamentId: tournamentId,
      hostEmail: user.email,
      inviteeEmail: player.email
    };
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(inviteData),
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    ).toString();
    socket.emit('InviteToTournament', encrypted);
    // Start countdown
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setWaitTime(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          setWaitingForResponse(false);
          setIsInviting(false);
          setInvitedPlayer(null);
          setInviteId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Socket event listeners for tournament invite
  useEffect(() => {
    socket = getSocketInstance();
    if (!socket) return;
    const handleInviteResponse = (data: any) => {
      if (data.status === 'success' && data.type === 'invite_sent') {
        setInviteId(data.inviteId);
      } else if (data.status === 'error') {
        alert(data.message);
        setIsInviting(false);
        setWaitingForResponse(false);
        setInvitedPlayer(null);
        setInviteId(null);
      }
    };
    const handleInviteAccepted = (data: any) => {
      if (data.inviteId === inviteId) {
        setIsInviting(false);
        setWaitingForResponse(false);
        setInvitedPlayer(null);
        setInviteId(null);
        alert('Tournament invite accepted!');
        // TODO: Add participant to tournament state
      }
    };
    const handleInviteDeclined = (data: any) => {
      if (data.inviteId === inviteId) {
        setIsInviting(false);
        setWaitingForResponse(false);
        setInvitedPlayer(null);
        setInviteId(null);
        alert('Tournament invite declined.');
      }
    };
    const handleInviteTimeout = (data: any) => {
      if (data.inviteId === inviteId) {
        setIsInviting(false);
        setWaitingForResponse(false);
        setInvitedPlayer(null);
        setInviteId(null);
        alert('Tournament invite timed out.');
      }
    };
    const handleInviteCanceled = (data: any) => {
      if (data.inviteId === inviteId) {
        setIsInviting(false);
        setWaitingForResponse(false);
        setInvitedPlayer(null);
        setInviteId(null);
        alert('Tournament invite canceled.');
      }
    };
    socket.on('InviteToTournamentResponse', handleInviteResponse);
    socket.on('TournamentInviteAccepted', handleInviteAccepted);
    socket.on('TournamentInviteDeclined', handleInviteDeclined);
    socket.on('TournamentInviteTimeout', handleInviteTimeout);
    socket.on('TournamentInviteCanceled', handleInviteCanceled);
    return () => {
      socket.off('InviteToTournamentResponse', handleInviteResponse);
      socket.off('TournamentInviteAccepted', handleInviteAccepted);
      socket.off('TournamentInviteDeclined', handleInviteDeclined);
      socket.off('TournamentInviteTimeout', handleInviteTimeout);
      socket.off('TournamentInviteCanceled', handleInviteCanceled);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [inviteId, user?.email]);

  // Cancel invite
  const handleCancelInvite = () => {
    socket = getSocketInstance();
    if (socket && inviteId && user?.email) {
      socket.emit('CancelTournamentInvite', { inviteId, hostEmail: user.email });
    }
    setIsInviting(false);
    setWaitingForResponse(false);
    setInvitedPlayer(null);
    setInviteId(null);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  // Leave tournament
  const leaveTournament = () => {
    setTournamentId(null);
    setParticipants([{
      id: user.id || user.nickname || 'host',
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

  // Create tournament handler
  const handleCreateTournament = () => {
    if (!tournamentName || tournamentName.trim().length === 0) return;
    socket = getSocketInstance();
    if (!socket) {
      alert('Socket not connected!');
      return;
    }
    socket.emit('CreateTournament', {
      name: tournamentName,
      hostEmail: user.email,
      hostNickname: user.login || user.name,
      hostAvatar: user.avatar,
      size: tournamentSize,
    });
  };

  // Handle tournament creation response
  useEffect(() => {0
    socket = getSocketInstance();
    if (!socket) return;
    
    const handleTournamentCreated = (tournament: any) => {
      console.log('Tournament created:', tournament);
      setTournamentId(tournament.tournamentId);
      setTournamentState('lobby');
      setParticipants(tournament.participants.map((p: any) => ({
        id: p.email,
        login: p.nickname,
        avatar: p.avatar,
        nickname: p.nickname,
        isHost: p.isHost
      })));
    };
    
    const handleTournamentError = (error: any) => {
      console.error('Tournament creation error:', error);
      alert(error.message || 'Failed to create tournament');
    };

    const handleTournamentUpdated = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setParticipants(data.tournament.participants.map((p: any) => ({
          id: p.email,
          login: p.nickname,
          avatar: p.avatar,
          nickname: p.nickname,
          isHost: p.isHost
        })));
      }
    };

    const handleTournamentReady = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setParticipants(data.tournament.participants.map((p: any) => ({
          id: p.email,
          login: p.nickname,
          avatar: p.avatar,
          nickname: p.nickname,
          isHost: p.isHost
        })));
        // Tournament is full and ready to start
        if (data.tournament.hostEmail === user?.email) {
          // Host can start the tournament
          alert('Tournament is full! You can now start the tournament.');
        }
      }
    };

    const handleTournamentStarted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentState('in_progress');
        setMatches(data.tournament.matches);
        // Navigate to tournament game page
        window.location.href = `/play/tournament/${tournamentId}`;
      }
    };

    const handleTournamentParticipantLeft = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setParticipants(data.tournament.participants.map((p: any) => ({
          id: p.email,
          login: p.nickname,
          avatar: p.avatar,
          nickname: p.nickname,
          isHost: p.isHost
        })));
        const leftPlayerName = data.leftPlayer?.nickname || data.leftPlayer?.email || 'Unknown';
        alert(`${leftPlayerName} left the tournament`);
      }
    };
    
    socket.on('TournamentCreated', handleTournamentCreated);
    socket.on('TournamentError', handleTournamentError);
    socket.on('TournamentUpdated', handleTournamentUpdated);
    socket.on('TournamentReady', handleTournamentReady);
    socket.on('TournamentStarted', handleTournamentStarted);
    socket.on('TournamentParticipantLeft', handleTournamentParticipantLeft);
    
    return () => {
      socket.off('TournamentCreated', handleTournamentCreated);
      socket.off('TournamentError', handleTournamentError);
      socket.off('TournamentUpdated', handleTournamentUpdated);
      socket.off('TournamentReady', handleTournamentReady);
      socket.off('TournamentStarted', handleTournamentStarted);
      socket.off('TournamentParticipantLeft', handleTournamentParticipantLeft);
    };
  }, [tournamentId, user?.email]);

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
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-[#2a2f3a]">
                <h2 className="text-2xl font-semibold mb-6">Tournament Setup</h2>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 text-lg">Tournament Name</label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="bg-[#2a2f3a] text-white rounded-lg px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500 border border-[#3a3f4a] text-lg"
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
                          'bg-[#2a2f3a] text-gray-300 hover:bg-[#3a3f4a] border border-[#3a3f4a]'}`}
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
                  onClick={handleCreateTournament}
                  disabled={!tournamentName || tournamentName.trim().length === 0}
                  className={`w-full max-w-md text-white font-semibold rounded-lg py-4 text-xl transition-all ${
                    tournamentName && tournamentName.trim().length !== 0
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-[#2a2f3a] cursor-not-allowed border border-[#3a3f4a]'
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
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-[#2a2f3a]">
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
                    {participants.map((player, index) => (
                      <ParticipantItem
                        key={player.id || player.nickname || player.login || `participant-${index}`}
                        player={player}
                        removeParticipant={removeParticipant}
                        isHost={true}
                      />
                    ))}
                    
                    {/* Empty slots */}
                    {Array.from({ length: tournamentSize - participants.length }).map((_, index) => (
                      <div key={`empty-slot-${index}`} className="flex items-center justify-center bg-[#1a1d23] rounded-lg p-3 border border-[#2a2f3a] border-dashed min-h-[58px]">
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
                        : 'bg-[#2a2f3a] cursor-not-allowed text-gray-400 border border-[#3a3f4a]'
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
                friends={friends}
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
              
              {/* Start Matches Button */}
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-[#2a2f3a]">
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
                        : 'bg-[#2a2f3a] cursor-not-allowed text-gray-400 border border-[#3a3f4a]'
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
                onPlayMatch={() => {}}
              />
              
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-[#2a2f3a]">
                <h3 className="text-xl font-semibold text-white mb-4">Active Players</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {getActivePlayers().map((player, index) => (
                    <div key={player.id || player.nickname || player.login || `active-player-${index}`} className="flex flex-col items-center bg-[#2a2f3a] rounded-lg p-3 border border-[#3a3f4a]">
                      <div className="w-12 h-12 rounded-full bg-[#3a3f4a] overflow-hidden border-2 border-green-500">
                        <Image 
                          src={`/images/${player.avatar}`} 
                          alt={player.login} 
                          width={48} 
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-green-400 text-sm mt-2 truncate max-w-full font-medium">
                        {getDisplayName(player)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Tournament Complete Section */}
          {tournamentComplete && (
            <div className="text-center space-y-6">
              <div className="bg-[#1a1d23] rounded-lg p-8 border border-[#2a2f3a]">
                <h2 className="text-3xl font-bold text-white mb-4">Tournament Complete!</h2>
                {champion && (
                  <div className="mb-6">
                    <div className="text-2xl text-yellow-400 mb-2">🏆 Champion</div>
                    <div className="text-xl text-white">{getDisplayName(champion)}</div>
                  </div>
                )}
                <button
                  onClick={resetTournament}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create New Tournament
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}