"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { useGameInvite } from '../../OneVsOne/GameInviteProvider'
import { PingPongGame } from '../PingPongGame'

export default function GamePage() {
  const params = useParams()
  const gameId = params.gameId as string
  const { user } = useAuthStore()
  const { socket } = useGameInvite()
  
  const [gameData, setGameData] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [opponent, setOpponent] = useState<any>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameAccepted, setGameAccepted] = useState(false)
  const [startGameTimeout, setStartGameTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isLeavingGame, setIsLeavingGame] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authorizationChecked, setAuthorizationChecked] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  
  // Use refs to track the latest state in event handlers
  const gameStartedRef = useRef(gameStarted)
  const isLeavingGameRef = useRef(isLeavingGame)
  const isStartingGameRef = useRef(isStartingGame)
  
  useEffect(() => {
    gameStartedRef.current = gameStarted
  }, [gameStarted])
  
  useEffect(() => {
    isLeavingGameRef.current = isLeavingGame
  }, [isLeavingGame])

  useEffect(() => {
    isStartingGameRef.current = isStartingGame
  }, [isStartingGame])

  // Check game authorization on mount
  useEffect(() => {
    if (!socket || !gameId || !user?.email) return

    console.log('Checking game authorization for:', { gameId, userEmail: user.email })

    // Emit a check to see if user is authorized for this game
    socket.emit('CheckGameAuthorization', { 
      gameId, 
      playerEmail: user.email 
    })
    
    // Set a timeout for authorization check
    const authTimeout = setTimeout(() => {
      if (!authorizationChecked && !isStartingGameRef.current) {
        console.log('Authorization check timeout - redirecting to play page')
        setIsAuthorized(false)
        setAuthorizationChecked(true)
        window.location.href = '/play'
      } else if (isStartingGameRef.current) {
        console.log('Authorization check timeout but game is being started - not redirecting')
      }
    }, 3000) // 3 second timeout

    return () => {
      clearTimeout(authTimeout)
    }
  }, [socket, gameId, user?.email, authorizationChecked])

  useEffect(() => {
    if (!socket || !gameId) return

    console.log('Game page mounted with gameId:', gameId, 'socket:', !!socket, 'user:', user?.email)

    const handleGameInviteAccepted = (data: any) => {
      console.log('GameInviteAccepted received in game page:', data)
      if (data.gameId === gameId && data.status === 'ready_to_start') {
        console.log('Setting game as accepted')
        setGameAccepted(true)
        
        // IMPROVED: Determine if current user is host correctly
        // The host receives guestData, the guest receives hostData
        let isCurrentUserHost = false;
        let opponentData = null;
        
        console.log('Checking data structure - hostData:', data.hostData, 'guestData:', data.guestData);
        console.log('Current user email:', user?.email);
        
        // More reliable host detection
        if (data.hostData && data.hostData.email === user?.email) {
          // This user is the guest (received hostData)
          isCurrentUserHost = false;
          opponentData = data.hostData;
          console.log('User is GUEST, opponent is host:', opponentData);
        } else if (data.guestData && data.guestData.email === user?.email) {
          // This user is the host (received guestData)
          isCurrentUserHost = true;
          opponentData = data.guestData;
          console.log('User is HOST, opponent is guest:', opponentData);
        } else {
          // Fallback: check if we have any data and determine based on what we received
          if (data.hostData && !data.guestData) {
            // We received hostData, so we must be the guest
            isCurrentUserHost = false;
            opponentData = data.hostData;
            console.log('Fallback: User is GUEST (received hostData only)');
          } else if (data.guestData && !data.hostData) {
            // We received guestData, so we must be the host
            isCurrentUserHost = true;
            opponentData = data.guestData;
            console.log('Fallback: User is HOST (received guestData only)');
          } else {
            console.error('Could not determine host/guest status - invalid data structure');
            return;
          }
        }
        
        setIsHost(isCurrentUserHost)
        console.log('Final host determination - Is host:', isCurrentUserHost, 'user email:', user?.email, 'opponentData:', opponentData)
        
        // Set opponent data with null checks and fallbacks
        if (opponentData && (opponentData.username || opponentData.login || opponentData.email)) {
          setOpponent({
            email: opponentData.email,
            username: opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar || '/mghalmi.jpg',
            login: opponentData.login || opponentData.nickname || opponentData.username || opponentData.email
          })
          console.log('Opponent set from GameInviteAccepted:', opponentData)
        } else {
          console.error('Invalid opponent data received:', opponentData)
          // Don't return here, let the game continue with partial data
        }
      }
    }

    const handleGameStarted = (data: any) => {
      console.log('GameStarted received:', data)
      if (data.gameId === gameId) {
        console.log('Setting game as started - transitioning from waiting to playing')
        setGameStarted(true)
        setGameData(data)
        
        // Clear the starting game flag
        setIsStartingGame(false)
        
        // Clear the timeout since game started successfully
        if (startGameTimeout) {
          clearTimeout(startGameTimeout)
          setStartGameTimeout(null)
        }
        
        // Set opponent data if not already set from GameInviteAccepted
        if (!opponent && data.players) {
          const isCurrentUserHost = data.players.host === user?.email
          const opponentEmail = isCurrentUserHost ? data.players.guest : data.players.host
          setOpponent({
            email: opponentEmail,
            username: opponentEmail, // This should be fetched from user data
            avatar: '/mghalmi.jpg',
            login: opponentEmail
          })
          console.log('Opponent set from GameStarted fallback:', opponentEmail)
          
          // Also set host status if not already set
          if (!isHost && isCurrentUserHost) {
            setIsHost(true)
            console.log('Host status set from GameStarted event')
          }
        }
        
        // Initialize game state from server
        if (data.gameState) {
          console.log('Initializing game state from server:', data.gameState)
        }
        
        console.log('Game state updated - gameStarted:', true, 'opponent:', opponent, 'isHost:', isHost)
        
        // CRITICAL: Don't redirect here - let the component render the game
        // The host should stay on this page and see the game component
      }
    }

    const handleGameStateUpdate = (data: any) => {
      if (data.gameId === gameId) {
        setGameData(data)
        console.log('Game state update received:', data)
      }
    }

    // Add listener for GameStartResponse to debug
    const handleGameStartResponse = (data: any) => {
      console.log('GameStartResponse received:', data)
      if (data.status === 'success') {
        console.log('Game start was successful - waiting for GameStarted event')
        // Don't redirect or change state here - let the GameStarted event handle the transition
        // The GameStartResponse just confirms the server received the start request
        // CRITICAL: Don't redirect the host - they should stay on this page
      } else {
        console.error('Game start failed:', data.message)
        // Show error to user but don't redirect
        alert(`Failed to start game: ${data.message}`)
        // Clear the timeout since start failed
        if (startGameTimeout) {
          clearTimeout(startGameTimeout)
          setStartGameTimeout(null)
        }
        // Clear the starting game flag
        setIsStartingGame(false)
      }
    }

    // Handle when a player leaves the game - FIXED
    const handlePlayerLeft = (data: any) => {
      console.log('Player left the game:', data)
      if (data.gameId === gameId) {
        // Only show alert and redirect if we're not the one leaving
        if (!isLeavingGameRef.current) {
          alert('The other player left the game.')
          setIsLeavingGame(true)
          window.location.href = '/play'
        }
      }
    }

    // Handle game ended - FIXED
    const handleGameEnded = (data: any) => {
      console.log('Game ended:', data)
      if (data.gameId === gameId) {
        // Only redirect if we're not already leaving and the game was actually started
        if (!isLeavingGameRef.current && gameStartedRef.current) {
          setIsLeavingGame(true)
          window.location.href = '/play'
        }
      }
    }

    // Handle game canceled - FIXED
    const handleGameCanceled = (data: any) => {
      console.log('Game canceled:', data)
      if (data.gameId === gameId) {
        // Only show alert and redirect if we're not the one canceling
        if (!isLeavingGameRef.current) {
          alert('The game was canceled.')
          setIsLeavingGame(true)
          window.location.href = '/play'
        }
      }
    }

    // Handle game authorization response
    const handleGameAuthorizationResponse = (data: any) => {
      console.log('GameAuthorizationResponse received:', data)
      setAuthorizationChecked(true)
      
      if (data.status === 'success' && data.authorized) {
        console.log('User is authorized for this game')
        setIsAuthorized(true)
        
        // Check if game is in a valid state
        if (data.gameStatus === 'canceled' || data.gameStatus === 'completed') {
          console.log('Game is not active (status:', data.gameStatus, ') - redirecting to play page')
          alert('This game is no longer active.')
          window.location.href = '/play'
          return
        }
      } else {
        console.log('User is not authorized for this game - redirecting')
        setIsAuthorized(false)
        // Don't redirect if we're in the process of starting the game
        if (!isStartingGameRef.current) {
          alert(data.message || 'You do not have access to this game.')
          window.location.href = '/play'
        } else {
          console.log('Not redirecting - game is being started')
        }
      }
    }

    socket.on('GameInviteAccepted', handleGameInviteAccepted)
    socket.on('GameStarted', handleGameStarted)
    socket.on('GameStateUpdate', handleGameStateUpdate)
    socket.on('GameStartResponse', handleGameStartResponse)
    socket.on('PlayerLeft', handlePlayerLeft)
    socket.on('GameEnded', handleGameEnded)
    socket.on('GameCanceled', handleGameCanceled)
    socket.on('GameAuthorizationResponse', handleGameAuthorizationResponse)

    return () => {
      socket.off('GameInviteAccepted', handleGameInviteAccepted)
      socket.off('GameStarted', handleGameStarted)
      socket.off('GameStateUpdate', handleGameStateUpdate)
      socket.off('GameStartResponse', handleGameStartResponse)
      socket.off('PlayerLeft', handlePlayerLeft)
      socket.off('GameEnded', handleGameEnded)
      socket.off('GameCanceled', handleGameCanceled)
      socket.off('GameAuthorizationResponse', handleGameAuthorizationResponse)
      
      // Clean up timeout
      if (startGameTimeout) {
        clearTimeout(startGameTimeout)
      }
    }
  }, [socket, gameId, user?.email]) // Removed opponent from dependencies to avoid re-registering handlers

  // Handle page refresh and disconnection - IMPROVED
  useEffect(() => {
    let hasUnloaded = false

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only emit LeaveGame if we're actually in a game and haven't already left
      if (socket && gameId && user?.email && !isLeavingGameRef.current && !hasUnloaded) {
        hasUnloaded = true
        setIsLeavingGame(true)
        socket.emit('LeaveGame', { 
          gameId, 
          playerEmail: user.email 
        })
        
        // Show confirmation dialog if game is in progress
        if (gameStartedRef.current) {
          e.preventDefault()
          e.returnValue = 'Are you sure you want to leave the game?'
          return 'Are you sure you want to leave the game?'
        }
      }
    }

    const handleVisibilityChange = () => {
      // Removed automatic leave on visibility change as it's too aggressive
      // Only leave if the page is being unloaded
      if (document.visibilityState === 'hidden' && hasUnloaded) {
        if (socket && gameId && user?.email && !isLeavingGameRef.current) {
          setIsLeavingGame(true)
          socket.emit('LeaveGame', { 
            gameId, 
            playerEmail: user.email 
          })
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [socket, gameId, user?.email])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (startGameTimeout) {
        clearTimeout(startGameTimeout)
      }
    }
  }, [startGameTimeout])

  const handleStartGame = () => {
    if (socket && gameId && !isLeavingGame) {
      console.log('handleStartGame called - Debug info:', {
        socket: !!socket,
        gameId,
        isHost,
        userEmail: user?.email,
        gameAccepted,
        opponent: !!opponent
      })
      
      // Set starting game flag to prevent redirects
      setIsStartingGame(true)
      
      // Test socket connection
      console.log('Socket connected:', socket.connected);
      console.log('Socket ID:', socket.id);
      
      socket.emit('StartGame', { gameId })
      
      // Don't set gameStarted immediately - wait for GameStarted event from server
      // setGameStarted(true); // REMOVED - wait for server confirmation
      
      // Set a timeout in case the GameStarted event doesn't arrive
      const timeout = setTimeout(() => {
        console.log('Game start timeout - forcing game start')
        if (!isLeavingGame) {
          setGameStarted(true)
          setIsStartingGame(false) // Clear the flag
        }
        setStartGameTimeout(null)
      }, 5000) // 5 second timeout
      
      setStartGameTimeout(timeout)
    } else {
      console.error('handleStartGame failed - missing socket or gameId:', {
        socket: !!socket,
        gameId,
        isLeavingGame
      })
    }
  }

  const handleCancelGame = () => {
    if (socket && gameId && !isLeavingGame) {
      setIsLeavingGame(true)
      socket.emit('LeaveGame', { gameId, playerEmail: user?.email })
    }
    window.location.href = '/play'
  }

  const handleGameEnd = () => {
    // Set leaving flag to prevent duplicate events
    setIsLeavingGame(true)
    // Navigate back to play page
    window.location.href = '/play'
  }

  // Debug logging
  console.log('Game page render state:', {
    gameStarted,
    gameAccepted,
    opponent: !!opponent,
    isHost,
    gameId,
    userEmail: user?.email,
    isLeavingGame,
    isAuthorized,
    authorizationChecked,
    isStartingGame,
    currentPath: window.location.pathname
  })

  // Check authorization first - redirect unauthorized users
  if (authorizationChecked && !isAuthorized) {
    console.log('User not authorized - redirecting to play page')
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access this game.</p>
          <button 
            onClick={() => window.location.href = '/play'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Play
          </button>
        </div>
      </div>
    )
  }

  // Show loading while checking authorization
  if (!authorizationChecked) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Checking Game Access...</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4">Verifying your access to this game...</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug info:</p>
            <p>Game ID: {gameId}</p>
            <p>User: {user?.email}</p>
            <p>Socket connected: {socket ? 'Yes' : 'No'}</p>
            <p>Current path: {window.location.pathname}</p>
          </div>
        </div>
      </div>
    )
  }

  // If game is started, show the game
  if (gameStarted && opponent && !isLeavingGame) {
    console.log('Rendering game component')
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Game not found or you don't have permission to join</h1>
            <button 
              onClick={() => window.location.href = '/play'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Back to Play
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-7xl">
          <PingPongGame
            player1={user}
            player2={opponent}
            onExit={handleGameEnd}
            gameId={gameId}
            socket={socket}
            isHost={isHost}
            opponent={opponent}
          />
        </div>
      </div>
    )
  }

  // If game is accepted but not started, show waiting room
  if (gameAccepted && opponent && !isLeavingGame) {
    console.log('Rendering waiting room')
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">Game Ready!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
            {/* Player 1 - Current User */}
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
                {isHost ? "Host (You)" : "Player 1"}
              </h3>
              <div className="mb-8">
                <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-6">
                  <img
                    src={user?.avatar || '/mghalmi.jpg'}
                    alt={user?.username}
                    className="w-full h-full rounded-full object-cover border-4 border-[#4a5568]"
                  />
                </div>
                <h4 className="text-white font-semibold text-2xl md:text-3xl">
                  {user?.username}
                </h4>
                <p className="text-gray-400 text-lg md:text-xl">@{user?.login}</p>
              </div>
            </div>

            {/* Player 2 - Opponent */}
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
                {!isHost ? "Host" : "Player 2"}
              </h3>
              <div className="mb-8">
                <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-6">
                  <img
                    src={opponent.avatar}
                    alt={opponent.username}
                    className="w-full h-full rounded-full object-cover border-4 border-[#4a5568]"
                  />
                </div>
                <h4 className="text-white font-semibold text-2xl md:text-3xl">
                  {opponent.username}
                </h4>
                <p className="text-gray-400 text-lg md:text-xl">@{opponent.login}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-xl text-green-400 mb-4">🎮 Both players are ready!</p>
            <p className="text-gray-300">
              {isHost ? "You are the host. You can start the game when ready." : "Waiting for host to start the game..."}
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={isLeavingGame}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-colors"
              >
                Start Game
              </button>
            )}
            <button
              onClick={handleCancelGame}
              disabled={isLeavingGame}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Leave Game
            </button>
            
            {/* Debug button - remove in production */}
            <button
              onClick={() => {
                console.log('Debug: Testing socket connection...')
                if (socket) {
                  console.log('Socket connected:', socket.connected)
                  console.log('Socket ID:', socket.id)
                  console.log('Emitting test StartGame event...')
                  socket.emit('StartGame', { gameId })
                } else {
                  console.log('No socket available')
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Debug: Test Start
            </button>
            
            {/* Debug button to show current state */}
            <button
              onClick={() => {
                const debugInfo = {
                  isHost,
                  userEmail: user?.email,
                  opponentEmail: opponent?.email,
                  gameId,
                  socketConnected: socket?.connected,
                  socketId: socket?.id,
                  gameStarted,
                  gameAccepted,
                  isLeavingGame
                }
                console.log('Current state:', debugInfo)
                alert(`Debug Info:\nIs Host: ${isHost}\nUser Email: ${user?.email}\nOpponent: ${opponent?.email}\nGame ID: ${gameId}\nSocket Connected: ${socket?.connected}\nGame Started: ${gameStarted}\nGame Accepted: ${gameAccepted}`)
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Debug: Show State
            </button>
            
            {/* Debug button to check game room status */}
            <button
              onClick={() => {
                console.log('Debug: Checking game room status...')
                if (socket && gameId) {
                  socket.emit('DebugGameRoom', { gameId })
                  socket.once('DebugGameRoomResponse', (data) => {
                    console.log('DebugGameRoomResponse:', data)
                    if (data.status === 'success') {
                      alert(`Game Room Debug:\nExists: ${data.debugInfo.gameRoomExists}\nStatus: ${data.debugInfo.gameRoomData?.status}\nHost: ${data.debugInfo.gameRoomData?.hostEmail}\nGuest: ${data.debugInfo.gameRoomData?.guestEmail}\nHost Ready: ${data.debugInfo.hostReady}\nGuest Ready: ${data.debugInfo.guestReady}`)
                    } else {
                      alert(`Debug Error: ${data.message}`)
                    }
                  })
                } else {
                  alert('Socket or gameId not available')
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Debug: Check Game Room
            </button>
          </div>
          
          {/* Debug info - remove in production */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg text-left text-sm">
            <h4 className="text-white font-bold mb-2">Debug Info:</h4>
            <p className="text-gray-300">Is Host: {isHost ? 'Yes' : 'No'}</p>
            <p className="text-gray-300">User Email: {user?.email}</p>
            <p className="text-gray-300">Opponent Email: {opponent?.email}</p>
            <p className="text-gray-300">Game Accepted: {gameAccepted ? 'Yes' : 'No'}</p>
            <p className="text-gray-300">Game ID: {gameId}</p>
            <p className="text-gray-300">Socket Connected: {socket ? 'Yes' : 'No'}</p>
            <p className="text-gray-300">Socket ID: {socket?.id || 'N/A'}</p>
            <p className="text-gray-300">Game Started: {gameStarted ? 'Yes' : 'No'}</p>
            <p className="text-gray-300">Is Leaving: {isLeavingGame ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    )
  }

  // If game is started but no opponent data, show a fallback
  if (gameStarted && !opponent && !isLeavingGame) {
    console.log('Game started but no opponent data - showing fallback')
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Game Starting...</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4">Setting up the game...</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug info:</p>
            <p>Game ID: {gameId}</p>
            <p>Socket connected: {socket ? 'Yes' : 'No'}</p>
            <p>User: {user?.email}</p>
            <p>Game Started: {gameStarted ? 'Yes' : 'No'}</p>
            <p>Opponent: {opponent ? 'Set' : 'Not set'}</p>
            <p>Is Leaving: {isLeavingGame ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    )
  }

  // If we're in the process of leaving, show a leaving message
  if (isLeavingGame) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Leaving game...</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  // If still waiting for game to be accepted
  console.log('Rendering waiting screen')
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Waiting for game to start...</h1>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
        <p className="text-gray-400 mt-4">Please wait while the game is being set up...</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Debug info:</p>
          <p>Game ID: {gameId}</p>
          <p>Socket connected: {socket ? 'Yes' : 'No'}</p>
          <p>User: {user?.email}</p>
          <p>Is Leaving: {isLeavingGame ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}