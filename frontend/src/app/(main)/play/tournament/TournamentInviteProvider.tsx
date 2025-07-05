"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore, getSocketInstance } from "@/(zustand)/useAuthStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TournamentInviteContext = createContext(null);

export function useTournamentInvite() {
  return useContext(TournamentInviteContext);
}

export function TournamentInviteProvider({ children }) {
  const { user } = useAuthStore();
  const socket = getSocketInstance();
  const [receivedInvite, setReceivedInvite] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!socket || !user?.email) return;

    // Socket event listeners for tournament invites
    const handleTournamentInviteReceived = (data) => {
      console.log('Tournament invite received:', data);
      setReceivedInvite(data);
    };
    
    const handleTournamentInviteCanceled = (data) => {
      console.log('Tournament invite canceled:', data);
      setReceivedInvite(null);
    };

    const handleTournamentInviteTimeout = (data) => {
      console.log('Tournament invite timeout:', data);
      setReceivedInvite(null);
    };

    const handleTournamentInviteAccepted = (data) => {
      console.log('Tournament invite accepted:', data);
      setReceivedInvite(null);
      // Only navigate if this is the invited player (not the host)
      if (data.inviteeEmail === user.email) {
        router.push(`/play/tournament/${data.tournamentId}`);
      }
    };

    const handleTournamentInviteDeclined = (data) => {
      console.log('Tournament invite declined:', data);
      setReceivedInvite(null);
    };

    // Add event listeners
    socket.on("TournamentInviteReceived", handleTournamentInviteReceived);
    socket.on("TournamentInviteCanceled", handleTournamentInviteCanceled);
    socket.on("TournamentInviteTimeout", handleTournamentInviteTimeout);
    socket.on("TournamentInviteAccepted", handleTournamentInviteAccepted);
    socket.on("TournamentInviteDeclined", handleTournamentInviteDeclined);

    // Cleanup event listeners on unmount
    return () => {
      socket.off("TournamentInviteReceived", handleTournamentInviteReceived);
      socket.off("TournamentInviteCanceled", handleTournamentInviteCanceled);
      socket.off("TournamentInviteTimeout", handleTournamentInviteTimeout);
      socket.off("TournamentInviteAccepted", handleTournamentInviteAccepted);
      socket.off("TournamentInviteDeclined", handleTournamentInviteDeclined);
    };
  }, [socket, user?.email, router]);

  const acceptInvite = () => {
    if (receivedInvite && socket) {
      socket.emit("AcceptTournamentInvite", {
        inviteId: receivedInvite.inviteId,
        inviteeEmail: user.email,
      });
      setReceivedInvite(null);
      // Don't navigate here - let the socket event handle it
    }
  };

  const declineInvite = () => {
    if (receivedInvite && socket) {
      socket.emit("DeclineTournamentInvite", {
        inviteId: receivedInvite.inviteId,
        inviteeEmail: user.email,
      });
      setReceivedInvite(null);
    }
  };

  const clearInvite = () => {
    setReceivedInvite(null);
  };

  return (
    <TournamentInviteContext.Provider value={{ socket, receivedInvite, acceptInvite, declineInvite, clearInvite }}>
      {children}
      {receivedInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2f3a] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-white text-xl font-semibold mb-4">Tournament Invitation</h3>
            <div className="flex items-center space-x-4 mb-4">
              <Image
                src={`/images/${receivedInvite.hostData?.avatar}` || "/avatar/Default.svg"}
                alt={receivedInvite.hostData?.username || "Host"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-white font-medium">{receivedInvite.hostData?.username || "Host"}</p>
                <p className="text-gray-400 text-sm">Level {receivedInvite.hostData?.level || "Unknown"}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">{receivedInvite.message}</p>
            <div className="flex space-x-4">
              <button
                onClick={acceptInvite}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
              >
                Accept
              </button>
              <button
                onClick={declineInvite}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
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