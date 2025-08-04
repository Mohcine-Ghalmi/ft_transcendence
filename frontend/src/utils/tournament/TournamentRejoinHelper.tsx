"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/(zustand)/useAuthStore';
import { getGameSocketInstance } from '@/(zustand)/useGameStore';
import { useTournamentNotifications } from './TournamentNotificationProvider';

interface ActiveTournament {
  tournamentId: string;
  tournamentName: string;
  status: string;
  isHost: boolean;
  participantCount: number;
  maxParticipants: number;
  currentRound?: number;
  totalRounds?: number;
  currentSessionId?: string; // Track which session is active for this tournament
}

export const TournamentRejoinHelper = () => {
  const { user } = useAuthStore();
  const { addNotification } = useTournamentNotifications();
  const [activeTournaments, setActiveTournaments] = useState<ActiveTournament[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [showRejoin, setShowRejoin] = useState(false);
  const [currentSocketId, setCurrentSocketId] = useState<string>("");
  const [isInGame, setIsInGame] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const socketInstance = getGameSocketInstance();
    if (socketInstance) {
      setSocket(socketInstance);
      setCurrentSocketId(socketInstance.id);
    }
  }, []);

  // Check if user is currently on a tournament page
  const isOnTournamentPage = pathname.includes('/tournament');
  
  // Check if user is currently on a game page
  const isOnGamePage = pathname.includes('/game');

  useEffect(() => {
    if (!socket || !user?.email) return;

    const fetchActiveTournaments = () => {
      // Pass current socket ID to get session-specific data
      socket.emit('GetUserActiveTournaments', { 
        userEmail: user.email,
        socketId: socket.id 
      });
    };

    const handleActiveTournaments = (data: any) => {
      if (data.tournaments && Array.isArray(data.tournaments)) {
        // Filter tournaments that need rejoin for THIS session
        const tournamentsNeedingRejoin = data.tournaments.filter((t: any) => {
          // Only show if this session is the active session for the tournament
          return t.activeSessionId === socket.id || !t.activeSessionId;
        });
        
        setActiveTournaments(tournamentsNeedingRejoin);
        
        // Show rejoin helper if:
        // 1. There are active tournaments for this session
        // 2. User is NOT on a tournament page
        // 3. User is NOT in a game
        const shouldShow = tournamentsNeedingRejoin.length > 0 && 
                          !isOnTournamentPage && 
                          !data.isInActiveGame;
        
        setShowRejoin(shouldShow);
        setIsInGame(data.isInActiveGame || false);
      } else {
        setActiveTournaments([]);
        setShowRejoin(false);
      }
    };

    const handleGameStatusUpdate = (data: any) => {
      // Update game status when it changes
      setIsInGame(data.isInGame || false);
      
      // Hide rejoin helper if user enters a game
      if (data.isInGame) {
        setShowRejoin(false);
      }
    };

    const handleTournamentSessionUpdate = (data: any) => {
      // Handle updates to tournament session ownership
      if (data.tournamentId && data.sessionId) {
        setActiveTournaments(prev => prev.map(t => {
          if (t.tournamentId === data.tournamentId) {
            return { ...t, currentSessionId: data.sessionId };
          }
          return t;
        }));
        
        // Hide if another session took over
        if (data.sessionId !== socket.id) {
          setActiveTournaments(prev => prev.filter(t => t.tournamentId !== data.tournamentId));
        }
      }
    };

    const handleRejoinResponse = (data: any) => {
      if (data.status === 'success' && data.redirectUrl) {
        router.push(data.redirectUrl);
      } else if (data.status === 'error') {
        addNotification({
          type: 'tournament_info',
          title: 'Rejoin Failed',
          message: data.message || 'Failed to rejoin tournament',
          autoClose: true,
          duration: 5000
        });
      }
    };

    const handleAutoRejoinedTournament = (data: any) => {
      if (data.tournament) {
        addNotification({
          type: 'tournament_info',
          title: 'Welcome Back!',
          message: `You've been automatically rejoined to "${data.tournamentName}". The tournament is still active.`,
          tournamentId: data.tournamentId,
          showBracketLink: data.status !== 'lobby',
          autoClose: true,
          duration: 8000
        });
      }
    };

    const handleGlobalTournamentNotification = (data: any) => {
      if (data.type === 'match_starting' && data.tournamentId && data.matchId && data.countdown) {
        addNotification({
          type: 'match_starting',
          title: '🎮 Tournament Match Starting',
          message: `Your match will start in ${data.countdown} seconds. Get ready!`,
          countdown: data.countdown,
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          autoClose: false
        });
      }
    };

    const handleMatchFound = (data: any) => {
      if (data.isTournament && data.gameId) {
        setIsInGame(true);
        setShowRejoin(false);
        router.push(`/play/game/${data.gameId}`);
      }
    };

    const handleGameStarting = (data: any) => {
      if (data.isTournament && data.gameId) {
        setIsInGame(true);
        setShowRejoin(false);
        router.push(`/play/game/${data.gameId}`);
      }
    };

    const handleGameEnded = (data: any) => {
      setIsInGame(false);
      // Re-fetch tournaments after game ends
      fetchActiveTournaments();
    };

    const handleTournamentLeft = (data: any) => {
      // Remove tournament from active list when user leaves
      if (data.tournamentId) {
        setActiveTournaments(prev => prev.filter(t => t.tournamentId !== data.tournamentId));
      }
    };

    const handleTournamentCompleted = (data: any) => {
      // Remove completed tournament from active list
      if (data.tournamentId) {
        setActiveTournaments(prev => prev.filter(t => t.tournamentId !== data.tournamentId));
      }
    };

    socket.on('UserActiveTournaments', handleActiveTournaments);
    socket.on('RejoinTournamentResponse', handleRejoinResponse);
    socket.on('GlobalTournamentNotification', handleGlobalTournamentNotification);
    socket.on('MatchFound', handleMatchFound);
    socket.on('GameStarting', handleGameStarting);
    socket.on('GameEnded', handleGameEnded);
    socket.on('AutoRejoinedTournament', handleAutoRejoinedTournament);
    socket.on('GameStatusUpdate', handleGameStatusUpdate);
    socket.on('TournamentSessionUpdate', handleTournamentSessionUpdate);
    socket.on('TournamentLeft', handleTournamentLeft);
    socket.on('TournamentCompleted', handleTournamentCompleted);
    
    fetchActiveTournaments();

    // Check every 30 seconds for active tournaments
    const interval = setInterval(fetchActiveTournaments, 30000);

    return () => {
      socket.off('UserActiveTournaments', handleActiveTournaments);
      socket.off('RejoinTournamentResponse', handleRejoinResponse);
      socket.off('GlobalTournamentNotification', handleGlobalTournamentNotification);
      socket.off('MatchFound', handleMatchFound);
      socket.off('GameStarting', handleGameStarting);
      socket.off('GameEnded', handleGameEnded);
      socket.off('AutoRejoinedTournament', handleAutoRejoinedTournament);
      socket.off('GameStatusUpdate', handleGameStatusUpdate);
      socket.off('TournamentSessionUpdate', handleTournamentSessionUpdate);
      socket.off('TournamentLeft', handleTournamentLeft);
      socket.off('TournamentCompleted', handleTournamentCompleted);
      clearInterval(interval);
    };
  }, [socket, user?.email, router, addNotification, isOnTournamentPage, isOnGamePage]);

  // Hide rejoin helper when navigating to tournament or game pages
  useEffect(() => {
    if (isOnTournamentPage || isOnGamePage) {
      setShowRejoin(false);
    } else if (activeTournaments.length > 0 && !isInGame) {
      // Re-check if we should show the helper when navigating away from tournament/game pages
      setShowRejoin(true);
    }
  }, [pathname, activeTournaments.length, isInGame, isOnTournamentPage, isOnGamePage]);

  const rejoinTournament = (tournamentId: string, tournamentName: string) => {
    if (socket && user?.email) {
      socket.emit('RejoinTournament', {
        tournamentId,
        playerEmail: user.email,
        socketId: socket.id
      });

      addNotification({
        type: 'tournament_info',
        title: 'Rejoining Tournament',
        message: `Rejoining "${tournamentName}"...`,
        autoClose: true,
        duration: 3000
      });
    }
  };
  
  // Don't render if conditions aren't met
  if (!showRejoin || activeTournaments.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-[#1a1d23] rounded-lg p-4 border border-[#2a2f3a] shadow-lg max-w-sm">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <span className="mr-2">🏆</span> Active Tournaments
        </h3>
        <div className="space-y-2">
          {activeTournaments.map((tournament) => (
            <div key={tournament.tournamentId} className="flex items-center justify-between bg-[#2a2f3a] rounded p-3">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {tournament.tournamentName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {tournament.isHost && (
                    <span className="text-blue-400 text-xs">Host</span>
                  )}
                  <span className="text-gray-400 text-xs">
                    {tournament.status === 'lobby' ? 'In Lobby' : `Round ${(tournament.currentRound || 0) + 1}/${tournament.totalRounds || '?'}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => rejoinTournament(tournament.tournamentId, tournament.tournamentName)}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded transition-colors flex-shrink-0"
              >
                {tournament.status === 'lobby' ? 'View Lobby' : 'View Bracket'}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 text-gray-400 text-xs">
          You have active tournaments. Click to rejoin!
        </div>
      </div>
    </div>
  );
};

export default TournamentRejoinHelper;