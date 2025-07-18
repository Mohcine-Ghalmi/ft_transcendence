"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSocketInstance } from '@/(zustand)/useAuthStore';
import { useAuthStore } from '@/(zustand)/useAuthStore';
import { useRouter } from 'next/navigation';

interface TournamentNotification {
  id: string;
  type: 'tournament_started' | 'match_starting' | 'bracket_ready' | 'tournament_info' | 'match_timeout';
  title: string;
  message: string;
  countdown?: number;
  tournamentId?: string;
  matchId?: string;
  showBracketLink?: boolean;
  showJoinButton?: boolean;
  autoClose?: boolean;
  duration?: number;
  autoRedirect?: boolean;
  redirectTo?: string;
  onJoin?: () => void;
  onIgnore?: () => void;
  onTimeout?: () => void;
}

interface TournamentNotificationContextType {
  notifications: TournamentNotification[];
  addNotification: (notification: Omit<TournamentNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const TournamentNotificationContext = createContext<TournamentNotificationContextType | undefined>(undefined);

export const useTournamentNotifications = () => {
  const context = useContext(TournamentNotificationContext);
  if (!context) {
    throw new Error('useTournamentNotifications must be used within a TournamentNotificationProvider');
  }
  return context;
};

// Global Tournament Notification Component
const GlobalTournamentNotification = ({ notification, onClose }: {
  notification: TournamentNotification;
  onClose: () => void;
}) => {
  const [countdown, setCountdown] = useState<number | null>(notification.countdown || null);
  const router = useRouter();
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<any>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = getSocketInstance();
    if (socketInstance) {
      setSocket(socketInstance);
    }
  }, []);

  useEffect(() => {
    if (notification.countdown && notification.countdown > 0) {
      setCountdown(notification.countdown);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            
            // Schedule the close action outside the render cycle
            setTimeout(() => {
              // Handle timeout for match notifications
              if (notification.type === 'match_starting') {
                // Just close the notification - games auto-start on backend
                // Player will be redirected when MatchFound event is received
                console.log('🎮 Countdown finished - waiting for game to auto-start...');
                onClose();
              }
            }, 0);
            
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [notification.countdown, notification.type, notification.tournamentId, notification.matchId, notification.onTimeout, notification.autoRedirect, notification.redirectTo, router, socket, user?.email, onClose, notification]);

  useEffect(() => {
    if (notification.autoClose && notification.duration) {
      const timer = setTimeout(() => {
        onClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.autoClose, notification.duration, onClose]);

  const handleJoinMatch = () => {
    if (notification.onJoin) {
      notification.onJoin();
    } else if (socket && user?.email && notification.tournamentId && notification.matchId) {
      // Emit to backend to join the tournament match
      socket.emit('JoinTournamentMatch', {
        tournamentId: notification.tournamentId,
        matchId: notification.matchId,
        playerEmail: user.email
      });
    }
    onClose();
  };

  const handleIgnore = () => {
    if (notification.onIgnore) {
      notification.onIgnore();
    } else if (socket && user?.email && notification.tournamentId) {
      // Mark player as lost due to ignoring notification
      socket.emit('PlayerMatchTimeout', {
        tournamentId: notification.tournamentId,
        playerEmail: user.email,
        matchId: notification.matchId
      });
    }
    onClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'tournament_started':
        return '🏆';
      case 'match_starting':
        return '⚡';
      case 'bracket_ready':
        return '📋';
      case 'match_timeout':
        return '⏰';
      default:
        return '🎮';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'tournament_started':
        return 'bg-green-600/90';
      case 'match_starting':
        return 'bg-yellow-600/90';
      case 'bracket_ready':
        return 'bg-blue-600/90';
      case 'match_timeout':
        return 'bg-red-600/90';
      default:
        return 'bg-gray-600/90';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <div className={`w-16 h-16 rounded-full ${getBackgroundColor()} flex items-center justify-center mx-auto mb-4`}>
            <span className="text-white text-2xl">{getIcon()}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{notification.title}</h2>
          <p className="text-gray-300 mb-4">{notification.message}</p>
          
          {countdown !== null && countdown !== undefined && countdown > 0 && (
            <div className="mb-4">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{countdown}</div>
              <p className="text-gray-300">seconds remaining...</p>
            </div>
          )}
          
          {notification.showBracketLink && notification.tournamentId && (
            <div className="mb-4">
              <button
                onClick={() => router.push(`/play/tournament/${notification.tournamentId}`)}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-3"
              >
                View Tournament Bracket
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-center">
          {notification.showJoinButton && (
            <button
              onClick={handleJoinMatch}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Join Match
            </button>
          )}
          
          {/* Only show action buttons if not a match_starting notification without showJoinButton */}
          {!(notification.type === 'match_starting' && !notification.showJoinButton) && (
            <>
              {notification.type === 'match_starting' ? (
                <button
                  onClick={handleIgnore}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Skip Match (Mark as Lost)
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const TournamentNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<TournamentNotification[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = getSocketInstance();
    if (socketInstance) {
      setSocket(socketInstance);
    }
  }, []);

  const addNotification = (notification: Omit<TournamentNotification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Listen for global tournament events
  useEffect(() => {
    if (!socket || !user?.email) return;

    const handleTournamentStarted = (data: any) => {
      addNotification({
        type: 'tournament_started',
        title: 'Tournament Started!',
        message: `Tournament "${data.tournamentName}" has begun! You can view the bracket and join when your match starts.`,
        tournamentId: data.tournamentId,
        showBracketLink: true,
        autoClose: false
      });
    };

    const handleMatchStartingSoon = (data: any) => {
      if (data.playerEmail === user?.email) {
        addNotification({
          type: 'match_starting',
          title: 'Your Match is Starting!',
          message: `Your tournament match will begin in 10 seconds. Get ready!`,
          countdown: 10,
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          showJoinButton: true,
          autoClose: false,
          autoRedirect: true,
          redirectTo: `/play/game/${data.matchId}`,
          onTimeout: () => {
            // Auto-redirect to match page after 10 seconds
            router.push(`/play/game/${data.matchId}`);
          }
        });
      }
    };

    const handleTournamentBracketReady = (data: any) => {
      addNotification({
        type: 'bracket_ready',
        title: 'Tournament Bracket Ready',
        message: 'The tournament bracket is now available. Check your match schedule!',
        tournamentId: data.tournamentId,
        showBracketLink: true,
        autoClose: true,
        duration: 5000
      });
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
          duration: data.countdown * 1000,
          showJoinButton: true,
          autoRedirect: true,
          redirectTo: `/play/game/${data.matchId}`,
          onTimeout: () => {
            // Auto-redirect to match page after countdown
            router.push(`/play/game/${data.matchId}`);
          }
        });
      }
    };

    // Global socket listeners
    socket.on('GlobalTournamentStarted', handleTournamentStarted);
    socket.on('GlobalMatchStartingSoon', handleMatchStartingSoon);
    socket.on('GlobalTournamentBracketReady', handleTournamentBracketReady);
    socket.on('GlobalTournamentNotification', handleGlobalTournamentNotification);

    return () => {
      socket.off('GlobalTournamentStarted', handleTournamentStarted);
      socket.off('GlobalMatchStartingSoon', handleMatchStartingSoon);
      socket.off('GlobalTournamentBracketReady', handleTournamentBracketReady);
      socket.off('GlobalTournamentNotification', handleGlobalTournamentNotification);
    };
  }, [socket, user?.email]);

  return (
    <TournamentNotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
      
      {/* Render notifications */}
      {notifications.map(notification => (
        <GlobalTournamentNotification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </TournamentNotificationContext.Provider>
  );
};
