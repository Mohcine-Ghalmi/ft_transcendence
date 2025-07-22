'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { MATCH_STATES } from '../../../../data/mockData'
import TournamentBracket from './TournamentBracket'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import CryptoJS from 'crypto-js'
import { PlayerListItem } from '../../play/OneVsOne/Online'
import { getGameSocketInstance } from '@/(zustand)/useGameStore'
import { useTournamentNotifications } from '../../../../utils/tournament/TournamentNotificationProvider';

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

const OnlinePlayMode = ({ onInvitePlayer, pendingInvites, sentInvites, friends, invitingPlayers }: OnlinePlayModeProps & { friends: Player[], invitingPlayers: Set<string> }) => {
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
              isInviting={invitingPlayers.has(player.email)}
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

const ParticipantItem = ({ player, isHost }: {
  player: any;
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
  const { user, onlineUsers } = useAuthStore();
  const router = useRouter();
  const { addNotification } = useTournamentNotifications();
  const [tournamentState, setTournamentState] = useState('setup'); // setup, lobby, in_progress
  const [tournamentName, setTournamentName] = useState('Online Pong Championship');
  const [tournamentNameError, setTournamentNameError] = useState<string | null>(null);
  const [tournamentSize, setTournamentSize] = useState(4);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [participants, setParticipants] = useState(user ? [{
    id: user.id || 'host',
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
  const [invitingPlayers, setInvitingPlayers] = useState(new Set<string>()); // Track multiple inviting players
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = Math.log2(tournamentSize);

  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketInstance = getGameSocketInstance();
    if (socketInstance) {
      setSocket(socketInstance);
    }
  }, []);

  useEffect(() => {
    if (!socket || !user?.email) return;

    const checkActiveTournaments = () => {
      socket.emit('CheckUserTournamentStatus', { userEmail: user.email });
    };

    const handleUserTournamentStatus = (data: any) => {
      if (data.activeTournament && tournamentState === 'setup') {
        setTournamentId(data.activeTournament.tournamentId);
        setTournamentName(data.activeTournament.name);
        setTournamentState(data.activeTournament.status);
        setTournamentSize(data.activeTournament.size);
        
        if (data.activeTournament.participants) {
          const formattedParticipants = data.activeTournament.participants.map((p: any) => ({
            id: p.email,
            login: p.nickname,
            avatar: p.avatar,
            nickname: p.nickname,
            isHost: p.isHost,
            email: p.email
          }));
          setParticipants(formattedParticipants);
        }

        addNotification({
          type: 'tournament_info',
          title: 'Rejoined Tournament',
          message: `Welcome back to "${data.activeTournament.name}"! You were automatically rejoined.`,
          tournamentId: data.activeTournament.tournamentId,
          showBracketLink: data.activeTournament.status !== 'lobby',
          autoClose: true,
          duration: 5000
        });
      }
    };

    socket.on('UserTournamentStatus', handleUserTournamentStatus);
    checkActiveTournaments();

    return () => {
      socket.off('UserTournamentStatus', handleUserTournamentStatus);
    };
  }, [socket, user?.email, tournamentState, addNotification]);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('ListTournaments');
    
    const handleTournamentList = (data: any) => {
      setTournaments(data);
    };
    
    socket.on('TournamentList', handleTournamentList);
    
    return () => {
      socket.off('TournamentList', handleTournamentList);
    };
  }, [socket]);

  useEffect(() => {
    async function fetchFriends() {
      if (!user?.email) return

      try {
      const res = await fetch(
        `http://localhost:5005/api/users/friends?email=${user.email}`
      )

      if (!res.ok) {
        setFriends([])
        return
      }

      const data = await res.json()

      if (data.friends && Array.isArray(data.friends)) {
        const formatted = data.friends
        .filter((f) => onlineUsers.includes(f.email)) // Check if user is in onlineUsers
        .map((f) => ({
          name: f.username,
          avatar: f.avatar,
          nickname: f.login,
          GameStatus: 'Available',
          ...f,
        }))
        setFriends(formatted)
      } else {
        setFriends([])
      }
      } catch (err) {
      setFriends([])
      }
    }
    fetchFriends()
  }, [user])

  const getDisplayName = (player: any) => {
    return player?.nickname?.trim() || player?.login || 'Unknown Player';
  };

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
      
      if (newState === MATCH_STATES.PLAYER1_WIN || newState === MATCH_STATES.PLAYER2_WIN) {
        const winner = newState === MATCH_STATES.PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
        
        if (roundIndex === totalRounds - 1) {
          setChampion(winner);
          setTournamentComplete(true);
        }
        else if (roundIndex < totalRounds - 1) {
          const nextRound = roundIndex + 1;
          const nextMatchIndex = Math.floor(matchIndex / 2);
          const isFirstMatchOfPair = matchIndex % 2 === 0;
          
          const nextMatchIndex2 = updatedMatches.findIndex(
            m => m.round === nextRound && m.matchIndex === nextMatchIndex
          );
          
          if (nextMatchIndex2 !== -1) {
            const nextMatch = { ...updatedMatches[nextMatchIndex2] };
            
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

  const canAdvanceRound = () => {
    const currentRoundMatches = matches.filter(m => m.round === currentRound);
    return currentRoundMatches.length > 0 && currentRoundMatches.every(m => 
      m.state === MATCH_STATES.PLAYER1_WIN || m.state === MATCH_STATES.PLAYER2_WIN
    );
  };

  const advanceRound = () => {
    if (currentRound < totalRounds - 1) {
      setCurrentRound(prevRound => prevRound + 1);
    } else {
      const finalMatch = matches.find(m => m.round === totalRounds - 1 && m.matchIndex === 0);
      if (finalMatch) {
        const winner = finalMatch.state === MATCH_STATES.PLAYER1_WIN ? 
          finalMatch.player1 : finalMatch.player2;
        setChampion(winner);
      }
      setTournamentComplete(true);
    }
  };

  const startTournament = () => {
    if (!tournamentId || !socket) {
      return;
    }
    socket.emit('StartTournament', { tournamentId, hostEmail: user.email });
  };

  const startCurrentRoundMatches = () => {
    if (!tournamentId || !socket) {
      console.error('❌ Cannot start matches - missing tournamentId or socket:', {
        tournamentId,
        socket: !!socket
      });
      return;
    }
    
    console.log('🎮 Starting current round matches:', {
      tournamentId,
      hostEmail: user.email,
      notifyCountdown: 10
    });
    
    socket.emit('StartCurrentRound', { 
      tournamentId, 
      hostEmail: user.email,
      notifyCountdown: 10 // 10 second countdown for players to join matches
    });
  };

  const handleInvitePlayer = async (player: Player) => {
    if (participants.length >= tournamentSize || !tournamentId || !socket) {
      return;
    }
    
    // Add this player to the inviting set
    setInvitingPlayers(prev => new Set([...prev, player.email]));
    
    if (!process.env.NEXT_PUBLIC_ENCRYPTION_KEY) {
      // Remove from inviting set if failed
      setInvitingPlayers(prev => {
        const newSet = new Set(prev);
        newSet.delete(player.email);
        return newSet;
      });
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
  };

  useEffect(() => {
    if (!socket) return;

    const handleInviteResponse = (data: any) => {
      if (data.status === 'success' && data.type === 'invite_sent') {
        console.log('Tournament invitation sent successfully to:', data.guestData?.email);
      } else if (data.status === 'error') {
        console.error('Tournament invitation error:', data.message);
      }
    };
    const handleInviteAccepted = (data: any) => {
      if (data.guestData?.email) {
        setInvitingPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.guestData.email);
          return newSet;
        });
      }
      
      if (data.newParticipant) {
        setParticipants(prev => [...prev, data.newParticipant]);
      }
    };
    const handleInviteDeclined = (data: any) => {
      if (data.guestEmail) {
        setInvitingPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.guestEmail);
          return newSet;
        });
      }
    };
    const handleInviteTimeout = (data: any) => {
      if (data.guestEmail) {
        setInvitingPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.guestEmail);
          return newSet;
        });
      }
    };

    const handleInviteCanceled = (data: any) => {
      if (data.guestEmail) {
        setInvitingPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.guestEmail);
          return newSet;
        });
      }
    };

    const handleInviteCleanup = (data: any) => {
      console.log('Cleaning up invite in OnlineTournament:', data.guestEmail, data.action);
      if (data.guestEmail) {
        setInvitingPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.guestEmail);
          return newSet;
        });
      }
    };  

    socket.on('InviteToTournamentResponse', handleInviteResponse);
    socket.on('TournamentInviteAccepted', handleInviteAccepted);
    socket.on('TournamentInviteDeclined', handleInviteDeclined);
    socket.on('TournamentInviteTimeout', handleInviteTimeout);
    socket.on('TournamentInviteCanceled', handleInviteCanceled);
    socket.on('TournamentInviteCleanup', handleInviteCleanup);
    return () => {
      socket.off('InviteToTournamentResponse', handleInviteResponse);
      socket.off('TournamentInviteAccepted', handleInviteAccepted);
      socket.off('TournamentInviteDeclined', handleInviteDeclined);
      socket.off('TournamentInviteTimeout', handleInviteTimeout);
      socket.off('TournamentInviteCanceled', handleInviteCanceled);
      socket.on('TournamentInviteCleanup', handleInviteCleanup);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [socket, user?.email]);

  const leaveTournament = () => {
    if (tournamentState === 'lobby' && tournamentId && user?.email && socket) {
      // Check if user is the host
      const isHost = participants.some(p => 
        (p.id === user.id || p.id === user.email || (p as any).email === user.email) && p.isHost
      );
      
      if (isHost) {
        handleCancelTournament();
      } else {
        socket.emit('ExplicitLeaveTournament', {
          tournamentId,
          playerEmail: user.email,
          reason: 'explicit_leave_button'
        });
        
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
        setInvitingPlayers(new Set()); // Clear inviting players
        setTournamentComplete(false);
        setChampion(null);
        return;
      }
    }
    
    // Reset local state for host after canceling or if not in lobby
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
    setInvitingPlayers(new Set()); // Clear inviting players
    setTournamentComplete(false);
    setChampion(null);
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
    // Clear any existing errors
    setTournamentNameError(null);
    
    if (!tournamentName || tournamentName.trim().length === 0) {
      setTournamentNameError('Please enter a tournament name');
      return;
    }
    
    if (!user?.email || !socket) {
      return;
    }
    
    socket.emit('CreateTournament', {
      name: tournamentName,
      hostEmail: user.email,
      hostNickname: user.login || user.name || user.username,
      hostAvatar: user.avatar,
      size: tournamentSize,
    });
  };

  // Handle tournament creation response
  useEffect(() => {
    if (!socket) return;
    const handleTournamentCreated = (tournament: any) => {
      setTournamentId(tournament.tournamentId);
      setTournamentState('lobby');
      setTournamentNameError(null);
    };
    const handleTournamentError = (error: any) => {
      if (error.message && error.message.toLowerCase().includes('name') && error.message.toLowerCase().includes('exists')) {
        setTournamentNameError(error.message);
      }
    };
    const handleTournamentUpdated = (data: any) => {
      if (data.tournamentId === tournamentId) {
        const updatedParticipants = data.tournament.participants.map((p: any) => ({
          id: p.email,
          login: p.nickname,
          avatar: p.avatar,
          nickname: p.nickname,
          isHost: p.isHost,
          email: p.email
        }));
        setParticipants(updatedParticipants);
        
        if (data.tournament.status !== tournamentState)
          setTournamentState(data.tournament.status);
      }
    };
    const handleTournamentReady = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentState('ready');
      }
    };
    const handleTournamentStarted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentState('in_progress');
        
        const isHost = participants.some(p => 
          (p.id === user.id || p.id === user.email || (p as any).email === user.email) && p.isHost
        );
        
        if (isHost) {
          // Host gets notification about joining the game bracket
          addNotification({
            type: 'tournament_started',
            title: 'Tournament Started!',
            message: 'Your tournament has begun! You can now view the bracket and manage matches.',
            tournamentId: data.tournamentId,
            showBracketLink: true,
            autoClose: false
          });
          
          // Redirect host to tournament page
          router.push(`/play/tournament/${tournamentId}`);
        } else {
          // Participants get notification about tournament start
          addNotification({
            type: 'tournament_started',
            title: 'Tournament Started!',
            message: 'The tournament has begun! Check the bracket and wait for your match.',
            tournamentId: data.tournamentId,
            showBracketLink: true,
            autoClose: false
          });
        }
      }
    };
    
    const handleMatchStartingSoon = (data: any) => {
      if (data.tournamentId === tournamentId && data.playerEmail === user?.email) {
        // Player has a match starting soon - show countdown using global notification
        addNotification({
          type: 'match_starting',
          title: 'Match Starting Soon!',
          message: `Your tournament match will begin in ${data.countdown || 10} seconds. Get ready!`,
          countdown: data.countdown || 10,
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          autoClose: false,
          autoRedirect: true,
          redirectTo: `/play/game/${data.matchId}`,
          onTimeout: () => {
            router.push(`/play/game/${data.matchId}`);
          }
        });
      }
    };
    
    const handleTournamentMatchReady = (data: any) => {
      if (data.tournamentId === tournamentId && 
          (data.player1Email === user?.email || data.player2Email === user?.email)) {
        // This player's match is ready - use global notification
        addNotification({
          type: 'match_starting',
          title: 'Match Ready!',
          message: 'Your tournament match is about to start!',
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          autoClose: true,
          duration: 3000
        });
      }
    };
    const handleTournamentStartResponse = (data: any) => {
      console.log('🎮 TournamentStartResponse:', data);
      if (data.status === 'error') {
        console.error('❌ Tournament start failed:', data.message);
      }
    };
    
    const handleStartCurrentRoundResponse = (data: any) => {
      console.log('🎮 StartCurrentRoundResponse:', data);
      if (data.status === 'error') {
        console.error('❌ Start current round failed:', data.message);
      } else {
        console.log('✅ Round starting:', {
          round: data.round,
          matchCount: data.matchCount,
          message: data.message
        });
        
        // Show success message to host
        addNotification({
          type: 'tournament_info',
          title: '🎮 Round Started',
          message: data.message || `Round ${data.round + 1} is starting! Players will be notified and redirected automatically.`,
          autoClose: true,
          duration: 5000
        });
      }
    };
    const handleTournamentParticipantLeft = (data: any) => {
      if (data.tournamentId === tournamentId) {
        
        // Remove participant using multiple identifiers for robustness
        setParticipants(prev => prev.filter(p => {
          const leftPlayerEmail = data.leftPlayer?.email || data.playerEmail;
          const leftPlayerId = data.leftPlayer?.id;
          const leftPlayerNickname = data.leftPlayer?.nickname;
          const participant = p as any;
          
          // Check multiple identifiers to ensure robust removal
          return !(
            participant.id === leftPlayerEmail ||
            participant.email === leftPlayerEmail ||
            (leftPlayerId && participant.id === leftPlayerId) ||
            (leftPlayerNickname && participant.nickname === leftPlayerNickname)
          );
        }));
        
        if (data.tournament?.participants) {
          const updatedParticipants = data.tournament.participants.map((p: any) => ({
            id: p.email,
            login: p.nickname,
            avatar: p.avatar,
            nickname: p.nickname,
            isHost: p.isHost,
            email: p.email
          }));
          setParticipants(updatedParticipants);
        }
      }
    };
    const handleTournamentCancelled = (data: any) => {
      if (data.tournamentId === tournamentId) {
        // Reset tournament state
        setTournamentState('setup');
        setTournamentId(null);
        setParticipants(user ? [{
          id: user.id || user.nickname || 'host',
          login: user.name, 
          avatar: user.avatar,
          nickname: user.nickname,
          isHost: true
        }] : []);
        setMatches([]);
      }
    };
    const handleTournamentCancelResponse = (data: any) => {
      if (data.status === 'success') {
        // Reset tournament state
        setTournamentState('setup');
        setTournamentId(null);
        setParticipants(user ? [{
          id: user.id || user.nickname || 'host',
          login: user.name, 
          avatar: user.avatar,
          nickname: user.nickname,
          isHost: true
        }] : []);
        setMatches([]);
      }
    };
    
    socket.on('TournamentCreated', handleTournamentCreated);
    socket.on('TournamentError', handleTournamentError);
    socket.on('TournamentUpdated', handleTournamentUpdated);
    socket.on('TournamentReady', handleTournamentReady);
    socket.on('TournamentStarted', handleTournamentStarted);
    socket.on('TournamentStartResponse', handleTournamentStartResponse);
    socket.on('StartCurrentRoundResponse', handleStartCurrentRoundResponse);
    // socket.on('TournamentParticipantLeft', handleTournamentParticipantLeft);
    socket.on('TournamentCancelled', handleTournamentCancelled);
    socket.on('TournamentCancelResponse', handleTournamentCancelResponse);
    socket.on('MatchStartingSoon', handleMatchStartingSoon);
    socket.on('GlobalMatchStartingSoon', handleMatchStartingSoon);
    socket.on('TournamentMatchReady', handleTournamentMatchReady);
    return () => {
      socket.off('TournamentCreated', handleTournamentCreated);
      socket.off('TournamentError', handleTournamentError);
      socket.off('TournamentUpdated', handleTournamentUpdated);
      socket.off('TournamentReady', handleTournamentReady);
      socket.off('TournamentStarted', handleTournamentStarted);
      socket.off('TournamentStartResponse', handleTournamentStartResponse);
      socket.off('StartCurrentRoundResponse', handleStartCurrentRoundResponse);
      // socket.off('TournamentParticipantLeft', handleTournamentParticipantLeft);
      socket.off('TournamentCancelled', handleTournamentCancelled);
      socket.off('TournamentCancelResponse', handleTournamentCancelResponse);
      socket.off('MatchStartingSoon', handleMatchStartingSoon);
      socket.off('GlobalMatchStartingSoon', handleMatchStartingSoon);
      socket.off('TournamentMatchReady', handleTournamentMatchReady);
    };
  }, [socket, tournamentId, user?.email, router]);

  // Cancel tournament handler
  const handleCancelTournament = () => {
    if (!tournamentId || !user?.email || !socket) {
      return;
    }
    
    socket.emit('CancelTournament', {
      tournamentId,
      hostEmail: user.email
    });
  };

  // Handle route changes and page unload - allow free navigation for all players
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (tournamentState === 'lobby' && tournamentId && user?.email && socket) {
        // Check if user is the host
        const isHost = participants.some(p => 
          (p.id === user.id || p.id === user.email || (p as any).email === user.email) && p.isHost
        );
        
        if (isHost) {
          // Only cancel tournament when HOST closes browser/tab
          socket.emit('CancelTournament', {
            tournamentId,
            hostEmail: user.email
          });
        }
      }
    };

    const handleRouteChange = () => {
      // Only check if host is navigating away from tournament pages
      const currentPath = window.location.pathname;
      const isTournamentPage = currentPath.includes('/tournament') || currentPath.includes('/play');
      
      if (tournamentState === 'lobby' && tournamentId && user?.email && socket && !isTournamentPage) {
        // Check if user is the host
        const isHost = participants.some(p => 
          (p.id === user.id || p.id === user.email || (p as any).email === user.email) && p.isHost
        );
        
        if (isHost) {
          // Only cancel tournament when HOST navigates away from tournament area
          socket.emit('CancelTournament', {
            tournamentId,
            hostEmail: user.email
          });
        }
      }
    };

    // Only add event listeners for hosts to prevent tournament cancellation
    const isHost = participants.some(p => 
      (p.id === user.id || p.id === user.email || (p as any).email === user.email) && p.isHost
    );

    if (isHost) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Listen for route changes (Next.js App Router)
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function() {
        handleRouteChange();
        return originalPushState.apply(history, arguments);
      };
      
      history.replaceState = function() {
        handleRouteChange();
        return originalReplaceState.apply(history, arguments);
      };

      window.addEventListener('popstate', handleRouteChange);

      // Cleanup
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handleRouteChange);
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
      };
    }
  }, [tournamentState, tournamentId, user?.email, socket, participants]);

  // Handle tournament name change and clear errors
  const handleTournamentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTournamentName(e.target.value);
    // Clear error when user starts typing
    if (tournamentNameError) {
      setTournamentNameError(null);
    }
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
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-[#2a2f3a]">
                <h2 className="text-2xl font-semibold mb-6">Tournament Setup</h2>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 text-lg">Tournament Name</label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={handleTournamentNameChange}
                    className={`bg-[#2a2f3a] text-white rounded-lg px-4 py-3 w-full outline-none focus:ring-2 border text-lg transition-all ${
                      tournamentNameError 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-[#3a3f4a] focus:ring-blue-500'
                    }`}
                    placeholder="Enter tournament name"
                    required
                  />
                  {tournamentNameError && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {tournamentNameError}
                    </p>
                  )}
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
                  
                  <div className="text-gray-400 text-xs mb-4">
                    {participants.some(p => (p.id === user?.id || p.id === user?.email || (p as any).email === user?.email) && p.isHost) 
                      ? 'As the host, you must stay on tournament pages. Leaving will cancel the tournament.'
                      : 'You can freely navigate anywhere! You\'ll remain in the tournament and get notified when matches start. Only click "Leave Tournament" if you want to quit completely.'}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={leaveTournament}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {participants.some(p => (p.id === user?.id || p.id === user?.email || (p as any).email === user?.email) && p.isHost) 
                      ? 'Cancel Tournament' 
                      : 'Leave Tournament'}
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
              
              {/* Online Player Search and Invite - Only for Tournament Host */}
              {participants.some(p => (p.id === user?.id || p.id === user?.email || (p as any).email === user?.email) && p.isHost) && (
                <OnlinePlayMode 
                  onInvitePlayer={handleInvitePlayer} 
                  pendingInvites={pendingInvites}
                  sentInvites={sentInvites}
                  friends={friends}
                  invitingPlayers={invitingPlayers}
                />
              )}
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
                          alt={player.login || player.nickname || "Player Avatar"}
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