"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, getSocketInstance } from '@/(zustand)/useAuthStore';
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
}

export const TournamentRejoinHelper = () => {
  const { user } = useAuthStore();
  const { addNotification } = useTournamentNotifications();
  const [activeTournaments, setActiveTournaments] = useState<ActiveTournament[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize socket connection
  useEffect(() => {
    // Use game socket for tournament functionality
    const socketInstance = getGameSocketInstance();
    if (socketInstance) {
      setSocket(socketInstance);
    }
  }, []);

  // Fetch user's active tournaments
  useEffect(() => {
    if (!socket || !user?.email) return;

    const fetchActiveTournaments = () => {
      socket.emit('GetUserActiveTournaments', { userEmail: user.email });
    };

    const handleActiveTournaments = (data: any) => {
      if (data.tournaments) {
        setActiveTournaments(data.tournaments);
      }
    };

    const handleRejoinResponse = (data: any) => {
      if (data.status === 'success' && data.redirectUrl) {
        // Redirect user back to tournament
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

    // Handle auto-rejoin when socket connects
    const handleAutoRejoinedTournament = (data: any) => {
      if (data.tournament) {
        // Show notification that user has been auto-rejoined
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

    // Handle global tournament notifications (match starting, etc.)
    const handleGlobalTournamentNotification = (data: any) => {
      console.log('🎮 TournamentRejoinHelper received GlobalTournamentNotification:', data);
      
      if (data.type === 'match_starting' && data.tournamentId && data.matchId && data.countdown) {
        console.log('🎮 Processing match starting notification for match:', data.matchId);
        
        // Show simple countdown notification - no join/leave options
        addNotification({
          type: 'match_starting',
          title: '🎮 Tournament Match Starting',
          message: `Your match will start in ${data.countdown} seconds. Get ready!`,
          countdown: data.countdown,
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          autoClose: false
        });

        console.log('🎮 Match will auto-start and redirect after countdown completes.');
      }
    };

    // Handle match found - redirect to game immediately (after countdown)
    const handleMatchFound = (data: any) => {
      console.log('🎮 MatchFound event received:', data);
      
      if (data.isTournament && data.gameId) {
        console.log('🎮 Redirecting to game now:', `/play/game/${data.gameId}`);
        
        // Redirect immediately - countdown is already complete
        router.push(`/play/game/${data.gameId}`);
      }
    };

    // Handle game starting - ensure we're in the right place
    const handleGameStarting = (data: any) => {
      console.log('🎮 GameStarting event received:', data);
      
      if (data.isTournament && data.gameId) {
        // Make sure we're redirected to the game
        console.log('🎮 GameStarting - redirecting to game:', `/play/game/${data.gameId}`);
        router.push(`/play/game/${data.gameId}`);
      }
    };

    socket.on('UserActiveTournaments', handleActiveTournaments);
    socket.on('RejoinTournamentResponse', handleRejoinResponse);
    socket.on('GlobalTournamentNotification', handleGlobalTournamentNotification);
    socket.on('MatchFound', handleMatchFound);
    socket.on('GameStarting', handleGameStarting);
    socket.on('AutoRejoinedTournament', handleAutoRejoinedTournament);
    fetchActiveTournaments();

    // Check every 30 seconds for active tournaments
    const interval = setInterval(fetchActiveTournaments, 30000);

    return () => {
      socket.off('UserActiveTournaments', handleActiveTournaments);
      socket.off('RejoinTournamentResponse', handleRejoinResponse);
      socket.off('GlobalTournamentNotification', handleGlobalTournamentNotification);
      socket.off('MatchFound', handleMatchFound);
      socket.off('GameStarting', handleGameStarting);
      socket.off('AutoRejoinedTournament', handleAutoRejoinedTournament);
      clearInterval(interval);
    };
  }, [socket, user?.email, router, addNotification]);

  const rejoinTournament = (tournamentId: string, tournamentName: string) => {
    if (socket && user?.email) {
      socket.emit('RejoinTournament', {
        tournamentId,
        playerEmail: user.email
      });

      // Show loading notification
      addNotification({
        type: 'tournament_info',
        title: 'Rejoining Tournament',
        message: `Rejoining "${tournamentName}"...`,
        autoClose: true,
        duration: 3000
      });
    }
  };

  const isOnTournamentPage = pathname?.includes('/tournament');
  
  // Always show tournament access - don't hide it on tournament pages
  if (activeTournaments.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* <div className="bg-[#1a1d23] rounded-lg p-4 border border-[#2a2f3a] shadow-lg max-w-sm">
        <h3 className="text-white font-semibold mb-3">🏆 Active Tournaments</h3>
        <div className="space-y-2">
          {activeTournaments.map((tournament) => (
            <div key={tournament.tournamentId} className="flex items-center justify-between bg-[#2a2f3a] rounded p-3">
              <div className="flex-1">
                <div className="text-white text-sm font-medium truncate">
                  {tournament.tournamentName}
                </div>
                <div className="text-gray-400 text-xs">
                  {tournament.status === 'lobby' ? 'Waiting for players' : `Round ${(tournament.currentRound || 0) + 1}/${tournament.totalRounds || 1}`} • {tournament.participantCount}/{tournament.maxParticipants}
                </div>
                {tournament.isHost && (
                  <div className="text-blue-400 text-xs">Host</div>
                )}
              </div>
              <button
                onClick={() => rejoinTournament(tournament.tournamentId, tournament.tournamentName)}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded transition-colors"
              >
                {tournament.status === 'lobby' ? 'View Lobby' : 'View Bracket'}
              </button>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default TournamentRejoinHelper;
