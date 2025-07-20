'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getGameSocketInstance, useGameStore } from '@/(zustand)/useGameStore'

const GameInviteContext = createContext(null)

export function useGameInvite() {
  return useContext(GameInviteContext)
}

export function GameInviteProvider({ children }) {
  const { user } = useAuthStore()
  const socket = getGameSocketInstance()
  const [receivedInvite, setReceivedInvite] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()
  const { connectSocket } = useGameStore()
  useEffect(() => {
    connectSocket()
  }, [])
  useEffect(() => {
    if (!socket || !user?.email) return

    // Socket event listeners for game invites
    const handleGameInviteReceived = (data) => {
      setReceivedInvite(data)
      setShowToast(true)
      
      // Auto-hide after 30 seconds
      setTimeout(() => {
        setShowToast(false)
        setReceivedInvite(null)
      }, 30000)
    }
    const handleGameInviteCanceled = () => {
      setReceivedInvite(null)
      setShowToast(false)
    }

    // Add event listeners
    socket.on('GameInviteReceived', handleGameInviteReceived)
    socket.on('GameInviteCanceled', handleGameInviteCanceled)

    // Cleanup event listeners on unmount
    return () => {
      socket.off('GameInviteReceived', handleGameInviteReceived)
      socket.off('GameInviteCanceled', handleGameInviteCanceled)
    }
  }, [socket, user?.email])

  const acceptInvite = () => {
    if (receivedInvite && socket) {
      socket.emit('AcceptGameInvite', {
        gameId: receivedInvite.gameId,
        guestEmail: user.email,
      })
      setReceivedInvite(null)
      setShowToast(false)
      router.push(`/play/game/${receivedInvite.gameId}`)
    }
  }

  const declineInvite = () => {
    if (receivedInvite && socket) {
      socket.emit('DeclineGameInvite', {
        gameId: receivedInvite.gameId,
        guestEmail: user.email,
      })
      setReceivedInvite(null)
      setShowToast(false)
    }
  }

  const clearInvite = () => {
    setReceivedInvite(null)
    setShowToast(false)
  }

  return (
    <GameInviteContext.Provider
      value={{
        socket,
        receivedInvite,
        acceptInvite,
        declineInvite,
        clearInvite,
      }}
    >
      {children}
      {receivedInvite && showToast && (
        <div className="fixed top-4 right-4 z-[9998] animate-in slide-in-from-right duration-300">
          <div className="bg-[#2a2f3a] border border-[#404654] rounded-lg shadow-2xl p-4 max-w-sm w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-lg font-semibold">🎮 Game Invite</h3>
              <button
                onClick={clearInvite}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <Image
                src={`/images/${receivedInvite.hostData.avatar}`}
                alt={
                  receivedInvite.hostData.username ||
                  receivedInvite.hostData.login
                }
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#404654]"
              />
              <div>
                <p className="text-white font-medium text-sm">
                  {receivedInvite.hostData.username ||
                    receivedInvite.hostData.login}
                </p>
                <p className="text-gray-400 text-xs">
                  Level {receivedInvite.hostData.level || 1}
                </p>
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
    </GameInviteContext.Provider>
  )
}
