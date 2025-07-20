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
  const [receivedInvite, setReceivedInvite] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!socket || !user?.email) return;

    const handleTournamentInviteReceived = (data) => {
      setReceivedInvite(data);
      setShowToast(true);
      
      // Auto-hide after 30 seconds
      setTimeout(() => {
        setShowToast(false);
        setReceivedInvite(null);
      }, 30000);
    };
    
    const handleTournamentInviteCanceled = (data) => {
      setReceivedInvite(null);
      setShowToast(false);
    };

    const handleTournamentInviteTimeout = (data) => {
      setReceivedInvite(null);
      setShowToast(false);
    };

    const handleTournamentInviteAccepted = (data) => {
      setReceivedInvite(null);
      setShowToast(false);
      // Only navigate if this is the invited player (not the host)
      if (data.inviteeEmail === user.email) {
        router.push(`/play/tournament/${data.tournamentId}`);
      }
    };

    const handleTournamentInviteDeclined = (data) => {
      setReceivedInvite(null);
      setShowToast(false);
    };

    const handleTournamentInviteResponse = (data) => {
      // This handles the response when the current user accepts an invite
      if (data.status === 'success' && data.tournamentId) {
        setReceivedInvite(null);
        setShowToast(false);
        // Redirect to tournament lobby immediately with shorter timeout for better UX
        setTimeout(() => {
          router.push(`/play/tournament/${data.tournamentId}`);
        }, 300);
      } else if (data.status === 'error') {
        setReceivedInvite(null);
        setShowToast(false);
      }
    };

    const handleTournamentCancelled = (data) => {
      // Clear any pending invites if the tournament was cancelled
      setReceivedInvite(null);
      setShowToast(false);
    };

    // Add event listeners
    socket.on("TournamentInviteReceived", handleTournamentInviteReceived);
    socket.on("TournamentInviteCanceled", handleTournamentInviteCanceled);
    socket.on("TournamentInviteTimeout", handleTournamentInviteTimeout);
    socket.on("TournamentInviteAccepted", handleTournamentInviteAccepted);
    socket.on("TournamentInviteDeclined", handleTournamentInviteDeclined);
    socket.on("TournamentInviteResponse", handleTournamentInviteResponse);
    socket.on("TournamentCancelled", handleTournamentCancelled);

    // Cleanup event listeners on unmount
    return () => {
      socket.off("TournamentInviteReceived", handleTournamentInviteReceived);
      socket.off("TournamentInviteCanceled", handleTournamentInviteCanceled);
      socket.off("TournamentInviteTimeout", handleTournamentInviteTimeout);
      socket.off("TournamentInviteAccepted", handleTournamentInviteAccepted);
      socket.off("TournamentInviteDeclined", handleTournamentInviteDeclined);
      socket.off("TournamentInviteResponse", handleTournamentInviteResponse);
      socket.off("TournamentCancelled", handleTournamentCancelled);
    };
  }, [socket, user?.email, router]);

  const acceptInvite = () => {
    if (receivedInvite && socket) {
      socket.emit("AcceptTournamentInvite", {
        inviteId: receivedInvite.inviteId,
        inviteeEmail: user.email,
      });
    }
  };

  const declineInvite = () => {
    if (receivedInvite && socket) {
      socket.emit("DeclineTournamentInvite", {
        inviteId: receivedInvite.inviteId,
        inviteeEmail: user.email,
      });
      setReceivedInvite(null);
      setShowToast(false);
    }
  };

  const clearInvite = () => {
    setReceivedInvite(null);
    setShowToast(false);
  };

  return (
    <TournamentInviteContext.Provider value={{ socket, receivedInvite, acceptInvite, declineInvite, clearInvite }}>
      {children}
      {receivedInvite && showToast && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right duration-300">
          <div className="bg-[#2a2f3a] border border-[#404654] rounded-lg shadow-2xl p-4 max-w-sm w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-lg font-semibold">🏆 Tournament Invite</h3>
              <button
                onClick={clearInvite}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <Image
                src={`/images/${receivedInvite.hostData?.avatar}` || "/avatar/Default.svg"}
                alt={receivedInvite.hostData?.username || "Host"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#404654]"
              />
              <div>
                <p className="text-white font-medium text-sm">{receivedInvite.hostData?.username || "Host"}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">{receivedInvite.message}</p>
            <div className="flex space-x-2">
              <button
                onClick={acceptInvite}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
              >
                Accept
              </button>
              <button
                onClick={declineInvite}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </TournamentInviteContext.Provider>
  );
} 