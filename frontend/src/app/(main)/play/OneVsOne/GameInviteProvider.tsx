'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getGameSocketInstance, useGameStore } from '@/(zustand)/useGameStore'
import { toast } from 'react-toastify'

const GameInviteContext = createContext(null)

export function useGameInvite() {
  return useContext(GameInviteContext)
}

export function GameInviteProvider({ children }) {
  const { user } = useAuthStore()
  const socket = getGameSocketInstance()
  const [receivedInvites, setReceivedInvites] = useState([])
  const [isSliding, setIsSliding] = useState({})
  const [acceptingInvites, setAcceptingInvites] = useState(new Set()) // Track which invites are being processed
  const router = useRouter()
  const { connectSocket } = useGameStore()
  
  useEffect(() => {
    connectSocket()
  }, [])

  useEffect(() => {
    if (!socket || !user?.email) return

    // Socket event listeners for game invites
    const handleGameInviteReceived = (data) => {
      console.log('Game invite received from:', data.hostData?.username, 'GameID:', data.gameId);
      console.log('Current user email:', user.email);
      console.log('Host email:', data.hostData?.email);
      
      // Check if there's already an invitation from this exact host and game combination
      setReceivedInvites(prev => {
        const existingFromSameHostAndGame = prev.findIndex(invite => 
          invite.hostData?.email === data.hostData?.email && invite.gameId === data.gameId
        );
        
        if (existingFromSameHostAndGame !== -1) {
          // Replace existing invitation from same host and game
          console.log('Replacing existing invite from same host and game');
          const updated = [...prev];
          updated[existingFromSameHostAndGame] = { ...data, timestamp: Date.now() };
          return updated;
        } else {
          // Add new invitation (allows multiple from different hosts)
          console.log('Adding new invite - multiple invitations allowed');
          return [...prev, { ...data, timestamp: Date.now() }];
        }
      });
      
      // Auto-hide after 30 seconds using unique gameId (consistent with tournaments)
      setTimeout(() => {
        setIsSliding(prev => ({ ...prev, [data.gameId]: true }));
        setTimeout(() => {
          setReceivedInvites(prev => prev.filter(invite => invite.gameId !== data.gameId));
          setIsSliding(prev => {
            const newSliding = { ...prev };
            delete newSliding[data.gameId];
            return newSliding;
          });
        }, 300);
      }, 30000);
    }

    const handleGameInviteCanceled = (data) => {
      setReceivedInvites(prev => prev.filter(invite => invite.gameId !== data.gameId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[data.gameId];
        return newSliding;
      });
    }

    // Handle cleanup event for multi-session sync
    const handleGameInviteCleanup = (data) => {
      console.log('Cleaning up invite in inactive session:', data.gameId, data.action);
      
      // Remove the invite from this session's UI
      setReceivedInvites(prev => prev.filter(invite => invite.gameId !== data.gameId));
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[data.gameId];
        return newSliding;
      });

      // Remove from accepting state
      setAcceptingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.gameId);
        return newSet;
      });

      // Optional: Show a brief notification that the invite was handled elsewhere
      if (data.action === 'accepted') {
        console.log('Invite was accepted in another session');
      } else if (data.action === 'declined') {
        console.log('Invite was declined in another session');
      }
    }

    // NEW: Enhanced response handler for invitation acceptance/decline
    const handleGameInviteResponse = (data) => {
      // Remove from accepting state regardless of result
      if (data.gameId) {
        setAcceptingInvites(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.gameId);
          return newSet;
        });
      }

      if (data.status === 'error') {
        // Handle specific error cases
        if (data.reason === 'host_in_game') {
          toast.error('The sender is already in an active game and cannot start a new one.');
          
          // Remove the expired invite from UI
          setReceivedInvites(prev => prev.filter(invite => invite.gameId !== data.gameId));
          setIsSliding(prev => {
            const newSliding = { ...prev };
            delete newSliding[data.gameId];
            return newSliding;
          });
          
        } else if (data.reason === 'guest_in_game') {
          toast.error('You are already in an active game. Please finish your current game first.');
          
          // Optionally redirect to current game if gameId is provided
          if (data.currentGameId) {
            setTimeout(() => {
              router.push(`/play/game/${data.currentGameId}`);
            }, 2000);
          }
          
        } else {
          // Generic error handling
          toast.error(data.message || 'Failed to accept invitation.');
        }
      } else if (data.status === 'success') {
        toast.success(data.message || 'Invitation accepted successfully!');
      }
    }

    // Add event listeners
    socket.on('GameInviteReceived', handleGameInviteReceived)
    socket.on('GameInviteCanceled', handleGameInviteCanceled)
    socket.on('GameInviteCleanup', handleGameInviteCleanup)
    socket.on('GameInviteResponse', handleGameInviteResponse) // NEW listener

    // Cleanup event listeners on unmount
    return () => {
      socket.off('GameInviteReceived', handleGameInviteReceived)
      socket.off('GameInviteCanceled', handleGameInviteCanceled)
      socket.off('GameInviteCleanup', handleGameInviteCleanup)
      socket.off('GameInviteResponse', handleGameInviteResponse) // NEW cleanup
    }
  }, [socket, user?.email, router])

  const acceptInvite = (gameId) => {
    const invite = receivedInvites.find(inv => inv.gameId === gameId);
    if (invite && socket) {
      // Mark as accepting to show loading state
      setAcceptingInvites(prev => new Set([...prev, gameId]));

      socket.emit('AcceptGameInvite', {
        gameId: invite.gameId,
        guestEmail: user.email,
      })
      
      // Remove from current session immediately (optimistic update)
      setReceivedInvites(prev => prev.filter(inv => inv.gameId !== gameId))
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[gameId];
        return newSliding;
      });
      
      // Navigate to game page (will be handled by response if there's an error)
      router.push(`/play/game/${invite.gameId}`)
    }
  }

  const declineInvite = (gameId) => {
    const invite = receivedInvites.find(inv => inv.gameId === gameId);
    if (invite && socket) {
      socket.emit('DeclineGameInvite', {
        gameId: invite.gameId,
        guestEmail: user.email,
      })
      
      // Remove from current session immediately
      setReceivedInvites(prev => prev.filter(inv => inv.gameId !== gameId))
      setIsSliding(prev => {
        const newSliding = { ...prev };
        delete newSliding[gameId];
        return newSliding;
      });
    }
  }

  const clearInvite = (gameId) => {
    setReceivedInvites(prev => prev.filter(inv => inv.gameId !== gameId))
    setIsSliding(prev => {
      const newSliding = { ...prev };
      delete newSliding[gameId];
      return newSliding;
    });
    
    // Remove from accepting state if present
    setAcceptingInvites(prev => {
      const newSet = new Set(prev);
      newSet.delete(gameId);
      return newSet;
    });
  }

  const hasPendingInviteWith = (playerEmail) => {
    return receivedInvites.some(invite => invite.hostData?.email === playerEmail);
  }

  const getPendingInvites = () => {
    return receivedInvites.map(invite => ({
      gameId: invite.gameId,
      hostEmail: invite.hostData?.email,
      hostUsername: invite.hostData?.username || invite.hostData?.login,
      message: invite.message,
      timestamp: invite.timestamp
    }));
  }

  return (
    <GameInviteContext.Provider
      value={{
        socket,
        receivedInvites,
        acceptInvite,
        declineInvite,
        clearInvite,
        hasPendingInviteWith,
        getPendingInvites,
      }}
    >
      {children}
      {receivedInvites.map((invite, index) => {
        const isAccepting = acceptingInvites.has(invite.gameId);
        
        return (
          <div 
            key={invite.gameId}
            className={`fixed top-4 z-[9998] transition-all duration-300 ${
              isSliding[invite.gameId] 
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
                <h3 className="text-white text-lg font-semibold">🎮 Game Invite</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    #{invite.gameId?.slice(-4) || 'Unknown'}
                  </span>
                  <button
                    onClick={() => clearInvite(invite.gameId)}
                    className="text-gray-400 hover:text-white transition-colors"
                    disabled={isAccepting}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-3 mb-3">
                <Image
                  src={`/images/${invite.hostData.avatar}`}
                  alt={
                    invite.hostData.username ||
                    invite.hostData.login
                  }
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#404654]"
                />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    {invite.hostData.username ||
                      invite.hostData.login}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Level {invite.hostData.level || 1} • {invite.hostData.email?.split('@')[0] || 'Player'}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">{invite.message || 'Wants to play a game with you!'}</p>
              
              {/* Show loading state when accepting */}
              {isAccepting && (
                <div className="text-center text-blue-400 text-sm mb-4">
                  Checking availability...
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={() => acceptInvite(invite.gameId)}
                  disabled={isAccepting}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    isAccepting 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isAccepting ? 'Checking...' : 'Accept'}
                </button>
                <button
                  onClick={() => declineInvite(invite.gameId)}
                  disabled={isAccepting}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    isAccepting 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </GameInviteContext.Provider>
  )
}