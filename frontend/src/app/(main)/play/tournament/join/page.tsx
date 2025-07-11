"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/(zustand)/useAuthStore';
import { getSocketInstance } from '@/(zustand)/useAuthStore';
import { Search, Users, Clock, Trophy, ArrowLeft } from 'lucide-react';

interface Tournament {
  tournamentId: string;
  name: string;
  hostEmail: string;
  hostName: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'setup' | 'lobby' | 'in_progress' | 'completed';
  createdAt: string;
  participants: Array<{
    id: string;
    login: string;
    avatar: string;
    nickname: string;
    isHost: boolean;
    email: string;
  }>;
};

const TournamentCard = ({ tournament, onJoin, isJoining }: {
  tournament: Tournament;
  onJoin: (tournamentId: string) => void;
  isJoining: boolean;
}) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const isParticipant = tournament.participants.some(p => p.email === user?.email || p.login === user?.email);
  const isFull = tournament.currentParticipants >= tournament.maxParticipants;
  const canJoin = tournament.status === 'lobby' && !isParticipant && !isFull;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'setup': return 'text-green-400 bg-green-400/10';
      case 'lobby': return 'text-yellow-400 bg-yellow-400/10';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10';
      case 'completed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'setup': return 'Open for Join';
      case 'lobby': return 'Open for Join';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="rounded-lg p-6 border border-[#2a2f3a] hover:border-[#3a3f4a] transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white text-xl font-semibold mb-2">{tournament.name}</h3>
          <p className="text-gray-400 text-sm mb-2">Hosted by {tournament.hostName}</p>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
            {getStatusText(tournament.status)}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-gray-400 text-sm mb-1">
            <Users size={16} className="mr-1" />
            {tournament.currentParticipants}/{tournament.maxParticipants}
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <Clock size={16} className="mr-1" />
            {new Date(tournament.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <h4 className="text-white text-sm font-medium mb-2">Participants</h4>
        <div className="flex flex-wrap gap-2">
          {tournament.participants.map((participant, index) => (
            <div key={index} className="flex items-center border border-[#2a2f3a] rounded-full px-3 py-1">
              <div className="w-6 h-6 rounded-full border border-[#3a3f4a] overflow-hidden mr-2">
                <Image 
                  src={participant.avatar ? `/images/${participant.avatar}` : '/avatar/Default.avif'}
                  alt={`${participant.login} avatar`} 
                  width={24}  
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white text-xs">
                {participant.login}
                {participant.isHost && <span className="text-blue-400 ml-1">(Host)</span>}
              </span>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: tournament.maxParticipants - tournament.currentParticipants }).map((_, index) => (
            <div key={`empty-${index}`} className="flex items-center border border-dashed border-[#3a3f4a] rounded-full px-3 py-1">
              <div className="w-6 h-6 rounded-full border border-dashed border-[#3a3f4a] mr-2"></div>
              <span className="text-gray-500 text-xs">Empty Slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {isParticipant && (
          <button
            onClick={() => window.location.href = `/play/tournament/${tournament.tournamentId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Enter Tournament
          </button>
        )}
        {canJoin && (
          <button
            onClick={() => onJoin(tournament.tournamentId)}
            disabled={isJoining}
            className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isJoining 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isJoining ? 'Joining...' : 'Join Tournament'}
          </button>
        )}
        {isFull && !isParticipant && tournament.status !== 'completed' && tournament.status !== 'in_progress' && (
          <button
            disabled
            className="bg-gray-600 cursor-not-allowed text-gray-400 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Tournament Full
          </button>
        )}
        {(tournament.status === 'in_progress' || tournament.status === 'completed') && !isParticipant && (
          <button
            onClick={() => {
              // Since we only show lobby tournaments, this won't be reached
              router.push(`/play/tournament/${tournament.tournamentId}`);
            }}
            disabled={isJoining}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Tournament
          </button>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ isLoading, onCreateTest }: { isLoading: boolean; onCreateTest: () => void }) => {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <Trophy size={64} className="mx-auto text-gray-400" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">
        {isLoading ? 'Loading Tournaments...' : 'No Active Tournaments'}
      </h3>
      <p className="text-gray-400 mb-6">
        {isLoading 
          ? 'Please wait while we fetch available tournaments.'
          : 'There are no tournaments available to join right now.'
        }
      </p>
    </div>
  );
};

export default function JoinTournamentPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [socket, setSocket] = useState<any>(null);

  // Fetch tournaments on mount
  useEffect(() => {
    const socketInstance = getSocketInstance();
    setSocket(socketInstance);
    if (!socketInstance) {
      setIsLoading(false);
      return;
    }

    // Listen for tournament list
    const handleTournamentList = (data: any[]) => {
      // Transform backend tournament data to match frontend interface
      // Only show tournaments that are in lobby state (joinable)
      const transformedTournaments = (data || [])
        .filter((tournament: any) => tournament.status === 'lobby') // Only show joinable tournaments
        .map((tournament: any) => ({
          tournamentId: tournament.tournamentId,
          name: tournament.name,
          hostEmail: tournament.hostEmail,
          hostName: tournament.hostEmail, // Use email as name for now
          maxParticipants: tournament.size,
          currentParticipants: tournament.participants?.length || 0,
          status: tournament.status,
          createdAt: tournament.createdAt,
          participants: (tournament.participants || []).map((p: any) => ({
            id: p.email,
            login: p.nickname || p.login,
            avatar: p.avatar,
            nickname: p.nickname,
            isHost: p.isHost,
            email: p.email
          }))
        }));
      
      setTournaments(transformedTournaments);
      setIsLoading(false);
    };

    // Listen for join responses
    const handleJoinResponse = (data: { status: string; message: string; tournamentId?: string; tournamentStatus?: string }) => {
      if (data.status === 'success' && data.tournamentId) {
        setNotification({ message: 'Successfully joined tournament! Redirecting to tournament lobby...', type: 'success' });
        // Navigate to the tournament page (lobby) immediately with shorter timeout for better UX
        setTimeout(() => {
          router.push(`/play/tournament/${data.tournamentId}`);
        }, 300);
      } else {
        setNotification({ message: data.message || 'Failed to join tournament', type: 'error' });
      }
      setIsJoining(null);
    };

    // Listen for tournament cancelled events
    const handleTournamentCancelled = (data: { tournamentId: string; tournamentName: string; message: string }) => {
      setNotification({ message: data.message || `Tournament "${data.tournamentName}" has been cancelled by the host.`, type: 'error' });
      // Refresh the tournament list
      socketInstance.emit('ListTournaments');
    };

    // Listen for redirect to play events
    const handleRedirectToPlay = (data: { message: string }) => {
      setNotification({ message: data.message, type: 'error' });
      // Refresh the tournament list after a short delay
      setTimeout(() => {
        socketInstance.emit('ListTournaments');
      }, 2000);
    };

    // Listen for tournament updated events
    const handleTournamentUpdated = (data: { tournamentId: string; tournament: any }) => {
      // Refresh the tournament list when tournaments are updated
      socketInstance.emit('ListTournaments');
    };

    socketInstance.on('TournamentList', handleTournamentList);
    socketInstance.on('TournamentJoinResponse', handleJoinResponse);
    socketInstance.on('TournamentCancelled', handleTournamentCancelled);
    socketInstance.on('RedirectToPlay', handleRedirectToPlay);
    socketInstance.on('TournamentUpdated', handleTournamentUpdated);

    // Request tournament list
    socketInstance.emit('ListTournaments');

    // Cleanup
    return () => {
      socketInstance.off('TournamentList', handleTournamentList);
      socketInstance.off('TournamentJoinResponse', handleJoinResponse);
      socketInstance.off('TournamentCancelled', handleTournamentCancelled);
      socketInstance.off('RedirectToPlay', handleRedirectToPlay);
      socketInstance.off('TournamentUpdated', handleTournamentUpdated);
    };
  }, [router]);

  // Filter tournaments based on search and status
  useEffect(() => {
    let filtered = tournaments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(tournament =>
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.hostName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === statusFilter);
    }

    setFilteredTournaments(filtered);
  }, [tournaments, searchQuery, statusFilter]);

  // Handle joining a tournament
  const handleJoinTournament = (tournamentId: string) => {
    if (!user || !socket) {
      setNotification({ message: 'Please log in to join tournaments', type: 'error' });
      return;
    }

    // Try to get email from different possible fields
    const playerEmail = user.email || user.login || user.username;
    
    if (!playerEmail) {
      setNotification({ message: 'User email not found. Please log in again.', type: 'error' });
      return;
    }

    if (!tournamentId) {
      setNotification({ message: 'Invalid tournament ID', type: 'error' });
      return;
    }

    setIsJoining(tournamentId);
    
    const joinData = {
      tournamentId,
      playerEmail
    };
    
    socket.emit('JoinTournamentAsNewParticipant', joinData);
  };

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold">Join Tournament</h1>
                <p className="text-gray-400">Find and join active ping pong tournaments</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/play/tournament?mode=Online')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Tournament
            </button>
          </div>

        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border ${
            notification.type === 'success' 
              ? 'bg-green-600/10 border-green-600 text-green-400' 
              : 'bg-red-600/10 border-red-600 text-red-400'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Tournament List */}
        <div className="space-y-6">
          {isLoading || filteredTournaments.length === 0 ? (
            <EmptyState
              isLoading={isLoading}
              onCreateTest={() => {
                // You can implement a test tournament creation handler here
                setNotification({ message: 'Test tournament creation not implemented.', type: 'error' });
              }}
            />
          ) : (
            filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.tournamentId}
                tournament={tournament}
                onJoin={handleJoinTournament}
                isJoining={isJoining === tournament.tournamentId}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
