'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { PingPongGame } from '../game/PingPongGame'
import { useRouter } from 'next/navigation'
import { getGameSocketInstance } from '@/(zustand)/useGameStore'

interface MatchmakingProps {
  onBack: () => void
}

const SessionConflictModal = ({
  isVisible,
  conflictType,
  onResolve
}: {
  isVisible: boolean
  conflictType: string
  onResolve: (action: 'force_takeover' | 'cancel') => void
}) => {
  if (!isVisible) return null

  const getConflictMessage = () => {
    switch (conflictType) {
      case 'already_searching':
        return 'You are already searching for a match in another tab or session. Only one session can search at a time.'
      case 'same_game_different_session':
        return 'This game is already being played from another tab or device.'
      case 'in_active_game':
        return 'You have an active game session in another tab.'
      default:
        return 'You have a conflicting session.'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50 max-w-md w-full mx-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Session Conflict</h2>
          <p className="text-gray-300 mb-6">
            {getConflictMessage()}
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => onResolve('cancel')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Cancel & Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

const GameResultPopup = ({
  isVisible,
  onComplete,
}: {
  isVisible: boolean
  onComplete: () => void
}) => {
  const [countdown, setCountdown] = useState(3)
  const [shouldComplete, setShouldComplete] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setCountdown(3)
      setShouldComplete(false)
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setShouldComplete(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isVisible])

  useEffect(() => {
    if (shouldComplete) {
      const timeoutId = setTimeout(() => {
        onComplete()
      }, 0)
      
      return () => clearTimeout(timeoutId)
    }
  }, [shouldComplete, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-[#2a2f3a] flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Calculating Match Result
          </h2>
          <p className="text-gray-300 mb-4">
            Please wait while we process your game data...
          </p>
        </div>
      </div>
    </div>
  )
}

const MatchmakingStatus = ({
  status,
}: {
  status: string
}) => {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
      <p className="text-white text-lg">{status}</p>
    </div>
  )
}

export default function Matchmaking({ onBack }: MatchmakingProps) {
  const [matchmakingStatus, setMatchmakingStatus] = useState<
    'idle' | 'preparing' | 'searching' | 'in_game' | 'waiting_to_start'
  >('idle')
  const [queuePosition, setQueuePosition] = useState(0)
  const [totalInQueue, setTotalInQueue] = useState(0)
  const [gameId, setGameId] = useState<string | null>(null)
  const [matchData, setMatchData] = useState<any>(null)
  const [opponent, setOpponent] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showResultPopup, setShowResultPopup] = useState(false)
  const [showCleanupOption, setShowCleanupOption] = useState(false)
  const [showSessionConflict, setShowSessionConflict] = useState(false)
  const [sessionConflictType, setSessionConflictType] = useState('')
  const [pendingRedirect, setPendingRedirect] = useState<{
    isWinner: boolean
    winnerName: string
    loserName: string
  } | null>(null)
  const [roomPreparationCountdown, setRoomPreparationCountdown] = useState(5)
  
  // Add refs to track component state
  const isActiveRef = useRef(true)
  const currentStatusRef = useRef(matchmakingStatus)
  const sessionIdRef = useRef<string>(Date.now().toString())

  const { user } = useAuthStore()
  const socket = getGameSocketInstance()
  const router = useRouter()

  // Update refs when state changes
  useEffect(() => {
    currentStatusRef.current = matchmakingStatus
  }, [matchmakingStatus])

  // Set component as inactive when unmounting
  useEffect(() => {
    return () => {
      isActiveRef.current = false
    }
  }, [])

  // Enhanced route change handling
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Handle page refresh/close for different matchmaking states
      if (matchmakingStatus === 'preparing' || matchmakingStatus === 'searching') {
        // Player leaving during matchmaking - cancel matchmaking
        if (socket && user?.email) {
          socket.emit('LeaveMatchmaking', { email: user.email })
        }
      } else if (matchmakingStatus === 'waiting_to_start' && gameId) {
        // Player leaving after match found but before game started
        e.preventDefault()
        e.returnValue = 'Leaving now will result in a loss. Are you sure?'
        
        if (socket && user?.email) {
          socket.emit('PlayerLeftBeforeGameStart', { 
            gameId: gameId, 
            leaver: user.email 
          })
        }
        
        return 'Leaving now will result in a loss. Are you sure?'
      } else if (matchmakingStatus === 'in_game' && gameId) {
        // Show confirmation dialog for active games
        e.preventDefault()
        e.returnValue =
          'Are you sure you want to leave the game? This will result in a loss.'

        // Emit leave event
        handleGameExit()

        return 'Are you sure you want to leave the game? This will result in a loss.'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [matchmakingStatus, gameId, socket, user])

  // Function to handle game exit (triggered by route change or manual exit)
  const handleGameExit = () => {
    if (socket && gameId && user?.email) {
      // If in game, notify server that player left
      if (matchmakingStatus === 'in_game') {
        socket.emit('LeaveGame', {
          gameId,
          playerEmail: user.email,
        })
      } else if (matchmakingStatus === 'searching') {
        socket.emit('LeaveMatchmaking', { email: user.email })
      } else if (matchmakingStatus === 'waiting_to_start') {
        // Player left after match found but before game started
        socket.emit('PlayerLeftBeforeGameStart', { 
          gameId: gameId, 
          leaver: user.email 
        })
      }
    }
  }

  // Handle matchmaking session conflict resolution
  const handleSessionConflictResolve = (action: 'force_takeover' | 'cancel') => {
    setShowSessionConflict(false)
    
    if (action === 'cancel') {
      onBack()
      return
    }

    if (socket && user?.email) {
      socket.emit('ResolveMatchmakingConflict', {
        action,
        email: user.email
      })
    }
  }

  // Handle result popup completion - ENHANCED
  const handleResultPopupComplete = () => {
    // Only process if component is still active and we're still in matchmaking context
    if (!isActiveRef.current) {
      return
    }

    setShowResultPopup(false)
    
    if (pendingRedirect) {
      const { isWinner, winnerName, loserName } = pendingRedirect
      
      // Clear all matchmaking state before redirecting
      setMatchmakingStatus('idle')
      setGameId(null)
      setMatchData(null)
      setOpponent(null)
      setIsHost(false)
      setPendingRedirect(null)
      
      // Navigate to result page
      if (isWinner) {
        router.push(
          `/play/result/win?winner=${encodeURIComponent(
            winnerName
          )}&loser=${encodeURIComponent(loserName)}`
        )
      } else {
        router.push(
          `/play/result/loss?winner=${encodeURIComponent(
            winnerName
          )}&loser=${encodeURIComponent(loserName)}`
        )
      }
    }
  }

  // Room preparation countdown effect
  useEffect(() => {
    if (matchmakingStatus === 'preparing') {
      const timer = setInterval(() => {
        setRoomPreparationCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // Start actual matchmaking after countdown
            if (socket && user?.email && isActiveRef.current) {
              socket.emit('JoinMatchmaking', { email: user.email })
              setMatchmakingStatus('searching')
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [matchmakingStatus, socket, user?.email])

  useEffect(() => {
    if (!socket || !user?.email) return

    // Start with room preparation phase (5-second delay)
    const startMatchmaking = () => {
      if (!isActiveRef.current) return
      setMatchmakingStatus('preparing')
      setRoomPreparationCountdown(5)
    }

    // Enhanced socket event listeners
    const handleMatchmakingResponse = (data: any) => {
      if (!isActiveRef.current) return

      if (data.status === 'success') {
        if (data.queuePosition) {
          setQueuePosition(data.queuePosition)
        }
        setErrorMessage('')
        setShowCleanupOption(false)
      } else {
        setMatchmakingStatus('idle')
        setErrorMessage(data.message || 'Failed to join matchmaking')

        // Handle enhanced session conflicts
        if (data.sessionConflict || data.conflictType) {
          setSessionConflictType(data.conflictType || 'unknown')
          setShowSessionConflict(true)
          return
        }

        // Show cleanup option if user is already in a game
        if (data.message && data.message.includes('already in a game')) {
          setShowCleanupOption(true)
          // Automatically try to clean up and retry
          setTimeout(() => {
            if (socket && user?.email && isActiveRef.current) {
              socket.emit('CleanupGameData', { email: user.email })
            }
          }, 1000)
        }
      }
    }

    const handleQueueStatusResponse = (data: any) => {
      if (!isActiveRef.current) return
      
      if (data.status === 'success') {
        setQueuePosition(data.queuePosition || 0)
        setTotalInQueue(data.totalInQueue || 0)
      }
    }

    const handleMatchFound = (data: any) => {
      if (!isActiveRef.current) return

      // Check if user is being matched with themselves
      if (data.hostEmail === data.guestEmail) {
        setErrorMessage(
          'Matchmaking error: Cannot match with yourself. Please try again.'
        )
        setMatchmakingStatus('idle')
        return
      }

      setMatchData(data)
      setGameId(data.gameId)
      setIsHost(data.hostEmail === user.email)

      // Use real player data with login and avatar
      const opponentData =
        data.hostEmail === user.email ? data.guestData : data.hostData
      setOpponent({
        name: opponentData?.username || opponentData?.login || 'Opponent',
        login: opponentData?.login || 'opponent',
        email: data.hostEmail === user.email ? data.guestEmail : data.hostEmail,
        avatar: opponentData?.avatar || '/avatar/Default.svg',
      })

      // Set status to waiting for game to start
      setMatchmakingStatus('waiting_to_start')
    }

    const handleGameStarting = (data: any) => {
      if (!isActiveRef.current) return
      
      setGameId(data.gameId)
      setMatchmakingStatus('in_game')
    }

    const handleGameEnded = (data: any) => {
      // CRITICAL: Only process if component is still active and in game state
      if (!isActiveRef.current || currentStatusRef.current !== 'in_game') {
        return
      }

      setShowResultPopup(true)

      // Set pending redirect data
      setPendingRedirect({
        isWinner: data.winner === user?.email,
        winnerName: data.winnerName || (data.winner === user?.email ? (user?.username || user?.email || 'You') : 'Opponent'),
        loserName: data.loserName || (data.loser === user?.email ? (user?.username || user?.email || 'You') : 'Opponent'),
      })
    }

    const handleMatchmakingPlayerLeft = (data: any) => {
      if (!isActiveRef.current) return

      // Handle when opponent leaves before game starts
      if (data.winner === user?.email) {
        setShowResultPopup(true)
        setPendingRedirect({
          isWinner: true,
          winnerName: user?.username || user?.email || 'You',
          loserName: 'Opponent',
        })
      } else {
        setErrorMessage('Opponent disconnected before the game started.')
        setMatchmakingStatus('idle')
      }
      
      setGameId(null)
      setMatchData(null)
      setOpponent(null)
      setIsHost(false)
    }

    const handleGameEndedByOpponentLeave = (data: any) => {
      if (!isActiveRef.current) return

      if (data.winner === user.email) {
        setShowResultPopup(true)
        setPendingRedirect({
          isWinner: true,
          winnerName: user?.username || user?.email || 'You',
          loserName: 'Opponent',
        })
      } else if (data.leaver === user.email) {
        setErrorMessage('You left the match and received a loss.')
        // Navigate back to play page after a delay
        setTimeout(() => {
          if (isActiveRef.current) {
            onBack()
          }
        }, 3000)
      }
      
      setMatchmakingStatus('idle')
      setGameId(null)
      setMatchData(null)
      setOpponent(null)
      setIsHost(false)
    }

    const handleCleanupResponse = (data: any) => {
      if (!isActiveRef.current) return

      if (data.status === 'success') {
        setErrorMessage('')
        setShowCleanupOption(false)

        // Automatically retry joining matchmaking after cleanup
        setTimeout(() => {
          if (socket && user?.email && isActiveRef.current) {
            startMatchmaking()
          }
        }, 1000)
      } else {
        setErrorMessage(data.message || 'Failed to clean up game data')
      }
    }

    // Handle matchmaking session conflicts
    const handleMatchmakingSessionConflict = (data: any) => {
      if (!isActiveRef.current) return

      if (data.type === 'another_session_matched') {
        setErrorMessage(data.message || 'Match found in another session')
        setMatchmakingStatus('idle')
        
        // Show notification that another session is handling the match
        setTimeout(() => {
          if (isActiveRef.current) {
            setErrorMessage('')
          }
        }, 5000)
      }
    }

    // Add event listeners
    socket.on('MatchmakingResponse', handleMatchmakingResponse)
    socket.on('QueueStatusResponse', handleQueueStatusResponse)
    socket.on('MatchFound', handleMatchFound)
    socket.on('GameStarting', handleGameStarting)
    socket.on('GameEnded', handleGameEnded)
    socket.on('CleanupResponse', handleCleanupResponse)
    socket.on('MatchmakingPlayerLeft', handleMatchmakingPlayerLeft)
    socket.on('GameEndedByOpponentLeave', handleGameEndedByOpponentLeave)
    socket.on('MatchmakingSessionConflict', handleMatchmakingSessionConflict)

    // Enhanced event listeners for session conflicts
    socket.on('MatchExpired', (data: any) => {
      if (!isActiveRef.current) return

      setMatchmakingStatus('idle')
      setGameId(null)
      setMatchData(null)
      setOpponent(null)
      setIsHost(false)
      setErrorMessage('Match expired. Please try again.')

      setTimeout(() => {
        if (isActiveRef.current) {
          onBack()
        }
      }, 2000)
    })

    socket.on('MatchDeclined', (data: any) => {
      if (!isActiveRef.current) return

      setMatchmakingStatus('idle')
      setGameId(null)
      setMatchData(null)
      setOpponent(null)
      setIsHost(false)
      setErrorMessage('Opponent declined the match.')

      setTimeout(() => {
        if (isActiveRef.current) {
          onBack()
        }
      }, 2000)
    })

    // Start matchmaking on mount with room preparation
    startMatchmaking()

    // Cleanup event listeners on unmount
    return () => {
      socket.off('MatchmakingResponse', handleMatchmakingResponse)
      socket.off('QueueStatusResponse', handleQueueStatusResponse)
      socket.off('MatchFound', handleMatchFound)
      socket.off('GameStarting', handleGameStarting)
      socket.off('GameEnded', handleGameEnded)
      socket.off('CleanupResponse', handleCleanupResponse)
      socket.off('MatchmakingPlayerLeft', handleMatchmakingPlayerLeft)
      socket.off('GameEndedByOpponentLeave', handleGameEndedByOpponentLeave)
      socket.off('MatchmakingSessionConflict', handleMatchmakingSessionConflict)
      socket.off('MatchExpired')
      socket.off('MatchDeclined')
    }
  }, [socket, user?.email, router, onBack])

  const handleLeaveMatchmaking = () => {
    if (socket && user?.email) {
      if (matchmakingStatus === 'waiting_to_start' && gameId) {
        // Notify backend that player left before game started
        socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email })
      } else if (matchmakingStatus === 'in_game' && gameId) {
        // Player left during game
        socket.emit('LeaveGame', {
          gameId,
          playerEmail: user.email,
        })
      } else {
        // Player left during search or preparation
        socket.emit('LeaveMatchmaking', { email: user.email })
      }
    }
    
    // Clear state and go back
    setMatchmakingStatus('idle')
    setGameId(null)
    setMatchData(null)
    setOpponent(null)
    setIsHost(false)
    
    setTimeout(() => {
      onBack()
    }, 100)
  }

  // If in game, show the game component
  if (matchmakingStatus === 'in_game' && gameId && opponent) {
    return (
      <div className="h-full text-white">
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <PingPongGame
              player1={user}
              player2={opponent}
              onExit={handleLeaveMatchmaking}
              gameId={gameId}
              socket={socket}
              isHost={isHost}
              opponent={opponent}
            />
          </div>
        </div>

        {/* Game Result Popup */}
        <GameResultPopup
          isVisible={showResultPopup}
          onComplete={handleResultPopupComplete}
        />
      </div>
    )
  }

  return (
    <div className="h-full text-white flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      {/* Main Content */}
      <div className="flex items-center justify-center w-full h-full px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
            Random Matchmaking
          </h1>

          {matchmakingStatus === 'preparing' && (
            <>
              <MatchmakingStatus
                status={`Preparing room... (${roomPreparationCountdown}s)`}
              />

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLeaveMatchmaking}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {matchmakingStatus === 'searching' && (
            <>
              <MatchmakingStatus status="Searching for opponent..." />

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLeaveMatchmaking}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Cancel Search
                </button>
              </div>
            </>
          )}

          {matchmakingStatus === 'waiting_to_start' && opponent && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Match Found!
                </h2>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="text-center">
                    <img
                      src={`/images/${user?.avatar}`}
                      alt={user?.username || user?.login || 'You'}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                    />
                    <p className="text-white font-medium">
                      {user?.username || user?.login || 'You'}
                    </p>
                  </div>
                  <div className="text-2xl text-white">VS</div>
                  <div className="text-center">
                    <img
                      src={`/images/${opponent.avatar}`}
                      alt={opponent.name || opponent.login || 'Opponent'}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                    />
                    <p className="text-white font-medium">
                      {opponent.name || opponent.login || 'Opponent'}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">
                  Game starting in 3 seconds...
                </p>
                <p className="text-yellow-400 text-sm mb-4">
                  ⚠️ Leaving now will result in a loss!
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleLeaveMatchmaking}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Leave (Loss)
                </button>
              </div>
            </>
          )}

          {errorMessage && (
            <div className="text-center mb-8">
              <p className="text-red-400 mb-4">{errorMessage}</p>
              {showCleanupOption && (
                <button
                  onClick={() => {
                    if (socket && user?.email) {
                      socket.emit('CleanupGameData', { email: user.email })
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors mr-4"
                >
                  Clean Up & Retry
                </button>
              )}
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {matchmakingStatus === 'idle' && !errorMessage && (
            <div className="text-center">
              <p className="text-gray-300 mb-8">Ready to find an opponent?</p>
              <button
                onClick={() => {
                  setMatchmakingStatus('preparing')
                  setRoomPreparationCountdown(5)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
              >
                Start Matchmaking
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Result Popup */}
      <GameResultPopup
        isVisible={showResultPopup}
        onComplete={handleResultPopupComplete}
      />

      {/* Session Conflict Modal */}
      <SessionConflictModal
        isVisible={showSessionConflict}
        conflictType={sessionConflictType}
        onResolve={handleSessionConflictResolve}
      />
    </div>
  )
}