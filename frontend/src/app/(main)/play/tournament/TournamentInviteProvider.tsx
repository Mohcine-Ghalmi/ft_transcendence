'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getGameSocketInstance } from '@/(zustand)/useGameStore'

const TournamentInviteContext = createContext(null);

export function useTournamentInvite() {
  return useContext(TournamentInviteContext);
}

export function TournamentInviteProvider({ children }) {
  const { user } = useAuthStore();
  const socket = getGameSocketInstance();
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [isSliding, setIsSliding] = useState({});
  const [sessionConflicts, setSessionConflicts] = useState(new Set()); // Track conflicts
  const router = useRouter();

  useEffect(() => {
    if (!socket || !user?.email) return;

    const handleTournamentInviteReceived = (data) => {
      console.log('Tournament invite received from:', data.hostData?.username, 'Tournament ID:', data.tournamentId);
      
      // Check if invitation from this exact host and tournament already exists
      setReceivedInvites(prev => {
        const existingIndex = prev.findIndex(invite => 
          invite.hostData?.email === data.hostData?.email && invite.tournamentId === data.tournamentId
        );
        
        if (existingIndex !== -1) {
          // Update existing invitation from same host and tournament
          console.log('Updating existing tournament invite from same host and tournament');
          const updated = [...prev];
          updated[existingIndex] = { ...data, timestamp: Date.now() };
          return updated;
        } else {
          // Add new invitation (allows multiple from different hosts/tournaments)
          console.log('Adding new tournament invite - multiple invitations allowed');
          return [...prev, { ...data, timestamp: Date.now() }];
        }
      });
      
      // Auto-hide after 30 seconds
      setTimeout(() => {
        setIsSliding(prev => ({ ...prev, [data.inviteId]: true }));
        setTimeout(() => {
          setReceivedInvites(prev => prev.filter(invite => invite.inviteId !== data.inviteId));
          setIsSliding(prev => {
            const newSliding = { ...prev };
            delete newSliding[data.inviteId];
            return newSliding;
          });
        }, 300);
      }, 30000);
    };
    
    const handleTournamentInviteCanceled = (data) => {
      console.log('Tournament invite canceled:', data.inviteId);
      setReceivedInvites(prev => prev.filter(invite => invite.inviteId !== data.inviteId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[data.inviteId];
        return newSliding;
      });
    };

    const handleTournamentInviteTimeout = (data) => {
      console.log('Tournament invite timeout:', data.inviteId);
      setReceivedInvites(prev => prev.filter(invite => invite.inviteId !== data.inviteId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[data.inviteId];
        return newSliding;
      });
    };

    const handleTournamentInviteAccepted = (data) => {
      console.log('Tournament invite accepted:', data.inviteId, 'by:', data.inviteeEmail);
      setReceivedInvites(prev => prev.filter(invite => invite.inviteId !== data.inviteId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[data.inviteId];
        return newSliding;
      });
      
      // ✨ CRITICAL: Only navigate if this is the session that should redirect
      // Check if this session should redirect based on the redirectToLobby flag
      if (data.inviteeEmail === user.email || data.guestEmail === user.email) {
        console.log('Invite accepted in this session - should redirect');
        // Navigation will be handled by the TournamentInviteResponse event
      }
    };

    const handleTournamentInviteDeclined = (data) => {
      console.log('Tournament invite declined:', data.inviteId, 'by:', data.inviteeEmail || data.guestEmail);
      setReceivedInvites(prev => prev.filter(invite => invite.inviteId !== data.inviteId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[data.inviteId];
        return newSliding;
      });
    };

    const handleTournamentInviteResponse = (data) => {
      console.log('Tournament invite response:', data);
      
      // ✨ CRITICAL: Only redirect if this session should redirect
      if (data.status === 'success' && data.redirectToLobby && data.tournamentId) {
        console.log('This session should redirect to tournament lobby');
        setReceivedInvites(prev => prev.filter(invite => invite.inviteId !== data.inviteId));
        setIsSliding(prev => {
          const newSliding = { ...prev };
          delete newSliding[data.inviteId];
          return newSliding;
        });
        
        // Redirect to tournament lobby with shorter timeout for better UX
        setTimeout(() => {
          router.push(`/play/tournament/${data.tournamentId}`);
        }, 300);
        
      } else if (data.status === 'error') {
        setReceivedInvites(prev => prev.filter(invite => invite.inviteId !== data.inviteId));
        setIsSliding(prev => {
          const newSliding = { ...prev };
          delete newSliding[data.inviteId];
          return newSliding;
        });
      }
    };

    const handleTournamentCancelled = (data) => {
      console.log('Tournament cancelled:', data.tournamentId);
      // Clear any pending invites if the tournament was cancelled
      setReceivedInvites(prev => prev.filter(invite => invite.tournamentId !== data.tournamentId));
    };

    // ✨ NEW: Handle session conflicts
    const handleTournamentSessionConflict = (data) => {
      console.log('Tournament session conflict:', data.type, data.message);
      
      if (data.type === 'another_session_joined' || data.type === 'match_starting_elsewhere') {
        // Another session is handling the tournament, this session should stay idle
        setSessionConflicts(prev => new Set([...prev, data.tournamentId]));
        
        // Show a subtle notification that tournament is active elsewhere
        // You might want to show a toast or status message here
        console.log(`Tournament ${data.tournamentId} is active in another session`);
      }
    };

    // ✨ NEW: Handle session takeover notifications
    const handleTournamentSessionTakenOver = (data) => {
      console.log('Tournament session taken over:', data.tournamentId);
      
      // Remove from conflicts as this session is no longer active
      setSessionConflicts(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.tournamentId);
        return newSet;
      });
      
      // You might want to show a notification that the session was taken over
      console.log('Tournament session was taken over by another browser/tab');
    };

    // Handle cleanup from other sessions
    const handleTournamentInviteCleanup = (data) => {
      console.log('Cleaning up tournament invite in inactive session:', data.inviteId, data.action);
      
      setReceivedInvites(prev => prev.filter(invite => invite.inviteId !== data.inviteId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[data.inviteId];
        return newSliding;
      });

      // Optional: Show a brief notification that the invite was handled elsewhere
      if (data.action === 'accepted') {
        console.log('Tournament invite was accepted in another session');
      } else if (data.action === 'declined') {
        console.log('Tournament invite was declined in another session');
      } else if (data.action === 'canceled') {
        console.log('Tournament invite was canceled by host');
      } else if (data.action === 'timeout') {
        console.log('Tournament invite expired');
      }
    };

    // Add event listeners
    socket.on("TournamentInviteReceived", handleTournamentInviteReceived);
    socket.on("TournamentInviteCanceled", handleTournamentInviteCanceled);
    socket.on("TournamentInviteTimeout", handleTournamentInviteTimeout);
    socket.on("TournamentInviteAccepted", handleTournamentInviteAccepted);
    socket.on("TournamentInviteDeclined", handleTournamentInviteDeclined);
    socket.on("TournamentInviteResponse", handleTournamentInviteResponse);
    socket.on("TournamentCancelled", handleTournamentCancelled);
    socket.on("TournamentInviteCleanup", handleTournamentInviteCleanup);
    socket.on("TournamentSessionConflict", handleTournamentSessionConflict);
    socket.on("TournamentSessionTakenOver", handleTournamentSessionTakenOver);

    // Cleanup event listeners on unmount
    return () => {
      socket.off("TournamentInviteReceived", handleTournamentInviteReceived);
      socket.off("TournamentInviteCanceled", handleTournamentInviteCanceled);
      socket.off("TournamentInviteTimeout", handleTournamentInviteTimeout);
      socket.off("TournamentInviteAccepted", handleTournamentInviteAccepted);
      socket.off("TournamentInviteDeclined", handleTournamentInviteDeclined);
      socket.off("TournamentInviteResponse", handleTournamentInviteResponse);
      socket.off("TournamentCancelled", handleTournamentCancelled);
      socket.off("TournamentInviteCleanup", handleTournamentInviteCleanup);
      socket.off("TournamentSessionConflict", handleTournamentSessionConflict);
      socket.off("TournamentSessionTakenOver", handleTournamentSessionTakenOver);
    };
  }, [socket, user?.email, router]);

  const acceptInvite = (inviteId) => {
    const invite = receivedInvites.find(inv => inv.inviteId === inviteId);
    if (invite && socket) {
      socket.emit("AcceptTournamentInvite", {
        inviteId: invite.inviteId,
        inviteeEmail: user.email,
      });
      
      // Remove from current session immediately
      setReceivedInvites(prev => prev.filter(inv => inv.inviteId !== inviteId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[inviteId];
        return newSliding;
      });
    }
  };

  const declineInvite = (inviteId) => {
    const invite = receivedInvites.find(inv => inv.inviteId === inviteId);
    if (invite && socket) {
      socket.emit("DeclineTournamentInvite", {
        inviteId: invite.inviteId,
        inviteeEmail: user.email,
      });
      
      // Remove from current session immediately
      setReceivedInvites(prev => prev.filter(inv => inv.inviteId !== inviteId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[inviteId];
        return newSliding;
      });
    }
  };

  const clearInvite = (inviteId) => {
    setReceivedInvites(prev => prev.filter(inv => inv.inviteId !== inviteId));
    setIsSliding(prev => {
      const newSliding = { ...prev };
      delete newSliding[inviteId];
      return newSliding;
    });
  };
  
  // Helper functions for compatibility
  const hasPendingInviteWith = (email) => {
    return receivedInvites.some(invite => invite.hostData?.email === email);
  };
  
  const getPendingInvites = () => {
    return receivedInvites;
  };

  // Check if a tournament is in conflict (active in another session)
  const isTournamentInConflict = (tournamentId) => {
    return sessionConflicts.has(tournamentId);
  };

  return (
    <TournamentInviteContext.Provider value={{ 
      socket, 
      receivedInvites, 
      acceptInvite, 
      declineInvite, 
      clearInvite, 
      hasPendingInviteWith, 
      getPendingInvites,
      isTournamentInConflict,
      sessionConflicts
    }}>
      {children}
      {receivedInvites.map((invite, index) => (
        <div 
          key={invite.inviteId}
          className={`fixed top-4 z-[9999] transition-all duration-300 ${
            isSliding[invite.inviteId] 
              ? 'translate-x-full opacity-0' 
              : 'translate-x-0 opacity-100'
          }`}
          style={{ 
            right: '1rem',
            top: `${1 + index * 12}rem` // Stack invitations vertically
          }}
        >
          <div className="bg-[#2a2f3a] border border-[#404654] rounded-lg shadow-2xl p-4 max-w-sm w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-lg font-semibold">🏆 Tournament Invite</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                  #{invite.tournamentId?.slice(-4) || 'Unknown'}
                </span>
                <button
                  onClick={() => clearInvite(invite.inviteId)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <Image
                src={`/images/${invite.hostData?.avatar}` || "/avatar/Default.svg"}
                alt={invite.hostData?.username || "Host"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#404654]"
              />
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{invite.hostData?.username || "Host"}</p>
                <p className="text-gray-400 text-xs">
                  Level {invite.hostData?.level || "Unknown"} • {invite.hostData?.email?.split('@')[0] || 'Host'}
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">{invite.message}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => acceptInvite(invite.inviteId)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => declineInvite(invite.inviteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </TournamentInviteContext.Provider>
  );
}