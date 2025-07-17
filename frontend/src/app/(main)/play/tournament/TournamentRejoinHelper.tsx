"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/(zustand)/useAuthStore';
import { getGameSocketInstance } from '@/(zustand)/useGameStore'
import { useTournamentNotifications } from '../../../../utils/tournament/TournamentNotificationProvider';

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

    // Handle global tournament notifications (match starting, etc.)
    const handleGlobalTournamentNotification = (data: any) => {
      if (data.type === 'match_starting' && data.tournamentId && data.matchId && data.countdown) {
        // Show notification to user
        addNotification({
          type: 'match_starting',
          title: data.title || '⚡ Your Match is Starting!',
          message: data.message || `Your match will begin in ${data.countdown} seconds!`,
          countdown: data.countdown,
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          autoClose: true,
          duration: data.countdown * 1000
        });

        // Automatically join the tournament match
        if (socket && user?.email) {
          socket.emit('JoinTournamentMatch', {
            tournamentId: data.tournamentId,
            matchId: data.matchId,
            playerEmail: user.email
          });
        }
      }
    };

    // Handle match found - redirect to game
    const handleMatchFound = (data: any) => {
      if (data.isTournament && data.gameId) {
        // Show notification about match starting
        addNotification({
          type: 'match_starting',
          title: '🎮 Tournament Match Found!',
          message: 'Your tournament match is starting...',
          autoClose: true,
          duration: 3000
        });

        // Redirect to the game
        setTimeout(() => {
          router.push(`/play/game/${data.gameId}`);
        }, 1000);
      }
    };

    // Handle game starting - ensure we're in the right place
    const handleGameStarting = (data: any) => {
      if (data.isTournament && data.gameId) {
        // Make sure we're redirected to the game
        router.push(`/play/game/${data.gameId}`);
      }
    };

    socket.on('UserActiveTournaments', handleActiveTournaments);
    socket.on('RejoinTournamentResponse', handleRejoinResponse);
    socket.on('GlobalTournamentNotification', handleGlobalTournamentNotification);
    socket.on('MatchFound', handleMatchFound);
    socket.on('GameStarting', handleGameStarting);
    fetchActiveTournaments();

    // Check every 30 seconds for active tournaments
    const interval = setInterval(fetchActiveTournaments, 30000);

    return () => {
      socket.off('UserActiveTournaments', handleActiveTournaments);
      socket.off('RejoinTournamentResponse', handleRejoinResponse);
      socket.off('GlobalTournamentNotification', handleGlobalTournamentNotification);
      socket.off('MatchFound', handleMatchFound);
      socket.off('GameStarting', handleGameStarting);
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
