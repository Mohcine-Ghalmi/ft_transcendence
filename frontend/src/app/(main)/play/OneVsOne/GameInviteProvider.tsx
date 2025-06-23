"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import CryptoJS from "crypto-js";
import { useAuthStore } from "@/(zustand)/useAuthStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GameInviteContext = createContext(null);

export function useGameInvite() {
  return useContext(GameInviteContext);
}

export function GameInviteProvider({ children }) {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState(null);
  const [receivedInvite, setReceivedInvite] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user?.email) return;
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    if (!encryptionKey) return;

    const cryptedMail = CryptoJS.AES.encrypt(user.email, encryptionKey).toString();
    const newSocket = io("http://localhost:5005", { query: { cryptedMail } });
    setSocket(newSocket);

    newSocket.on("GameInviteReceived", (data) => setReceivedInvite(data));
    newSocket.on("GameInviteCanceled", () => {
      setReceivedInvite(null);
      console.log('Game invite was canceled, clearing invite state');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const acceptInvite = () => {
    if (receivedInvite && socket) {
      socket.emit("AcceptGameInvite", {
        gameId: receivedInvite.gameId,
        guestEmail: user.email,
      });
      setReceivedInvite(null);
      router.push(`/play/game/${receivedInvite.gameId}`);
    }
  };

  const declineInvite = () => {
    if (receivedInvite && socket) {
      socket.emit("DeclineGameInvite", {
        gameId: receivedInvite.gameId,
        guestEmail: user.email,
      });
      setReceivedInvite(null);
    }
  };

  const clearInvite = () => {
    setReceivedInvite(null);
  };

  return (
    <GameInviteContext.Provider value={{ socket, receivedInvite, acceptInvite, declineInvite, clearInvite }}>
      {children}
      {receivedInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2f3a] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-white text-xl font-semibold mb-4">Game Invitation</h3>
            <div className="flex items-center space-x-4 mb-4">
              <Image
              src={receivedInvite.hostData.avatar}
              alt={receivedInvite.hostData.username}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
              />
              <div>
              <p className="text-white font-medium">{receivedInvite.hostData.username}</p>
              <p className="text-gray-400 text-sm">Level {receivedInvite.hostData.level}</p>
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
    </GameInviteContext.Provider>
  );
}