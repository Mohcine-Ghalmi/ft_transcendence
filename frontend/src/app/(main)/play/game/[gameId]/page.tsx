"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { useGameInvite } from '../../OneVsOne/GameInviteProvider'
import { PingPongGame } from '../PingPongGame'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
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

    // Emit a check to see if user is authorized for this game
    socket.emit('CheckGameAuthorization', { 
      gameId, 
      playerEmail: user.email 
    })
    
    // Set a timeout for authorization check
    const authTimeout = setTimeout(() => {
      if (!authorizationChecked && !isStartingGameRef.current) {
        setIsAuthorized(false)
        setAuthorizationChecked(true)
        window.location.href = '/play'
      }
    }, 1000) // 3 second timeout

    return () => {
      clearTimeout(authTimeout)
    }
  }, [socket, gameId, user?.email, authorizationChecked])

  useEffect(() => {
    if (!socket || !gameId) return

    const handleGameInviteAccepted = (data: any) => {
      if (data.gameId === gameId && data.status === 'ready_to_start') {
        setGameAccepted(true)
        
        // IMPROVED: Determine if current user is host correctly
        // The host receives guestData, the guest receives hostData
        let isCurrentUserHost = false;
        let opponentData = null;
        
        // More reliable host detection
        if (data.hostData && data.hostData.email === user?.email) {
          // This user is the guest (received hostData)
          isCurrentUserHost = false;
          opponentData = data.hostData;
        } else if (data.guestData && data.guestData.email === user?.email) {
          // This user is the host (received guestData)
          isCurrentUserHost = true;
          opponentData = data.guestData;
        } else {
          // Fallback: check if we have any data and determine based on what we received
          if (data.hostData && !data.guestData) {
            // We received hostData, so we must be the guest
            isCurrentUserHost = false;
            opponentData = data.hostData;
          } else if (data.guestData && !data.hostData) {
            // We received guestData, so we must be the host
            isCurrentUserHost = true;
            opponentData = data.guestData;
          } else {
            return;
          }
        }
        
        setIsHost(isCurrentUserHost)
        
        // Set opponent data with null checks and fallbacks
        if (opponentData && (opponentData.username || opponentData.login || opponentData.email)) {
          setOpponent({
            email: opponentData.email,
            username: opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar || '/mghalmi.jpg',
            login: opponentData.login || opponentData.nickname || opponentData.username || opponentData.email
          })
        }
      }
    }

    const handleGameStarted = (data: any) => {
      if (data.gameId === gameId) {
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
          
          // Also set host status if not already set
          if (!isHost && isCurrentUserHost) {
            setIsHost(true)
          }
        }
      }
    }

    const handleGameStateUpdate = (data: any) => {
      if (data.gameId === gameId) {
        setGameData(data)
      }
    }

    // Add listener for GameStartResponse to debug
    const handleGameStartResponse = (data: any) => {
      if (data.status !== 'success') {
        if (startGameTimeout) {
          clearTimeout(startGameTimeout)
          setStartGameTimeout(null)
        }
        setIsStartingGame(false)
      }
    }

    // Handle when a player leaves the game - FIXED
    const handlePlayerLeft = (data: any) => {
      if (data.gameId === gameId) {
        console.log('Player left:', data)
        
        // Only show alert and redirect if we're not the one leaving
        if (!isLeavingGameRef.current) {
          // Current player wins when opponent leaves
          const winnerName = user?.username || user?.name || 'You';
          const loserName = data.playerWhoLeft || 'Opponent';
          
          // Navigate to winner page
          router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
        }
      }
    }

    // Handle game ended - FIXED
    const handleGameEnded = (data: any) => {
      if (data.gameId === gameId) {
        console.log('Game ended:', data)
        
        // Determine winner and loser
        const isWinner = data.winner === user?.email;
        const winnerName = isWinner ? (user?.username || user?.name || 'You') : (data.winner || 'Opponent');
        const loserName = isWinner ? (data.loser || 'Opponent') : (user?.username || user?.name || 'You');
        
        // Navigate to appropriate result page
        if (isWinner) {
          router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
        } else {
          router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
        }
      }
    }

    // Handle game canceled - FIXED
    const handleGameCanceled = (data: any) => {
      if (data.gameId === gameId) {
        // Only show alert and redirect if we're not the one canceling
        if (!isLeavingGameRef.current) {
          // alert('The game was canceled.')
          setIsLeavingGame(true)
          router.push('/play')
        }
      }
    }

    // Handle game authorization response
    const handleGameAuthorizationResponse = (data: any) => {
      setAuthorizationChecked(true)
      
      if (data.status === 'success' && data.authorized) {
        setIsAuthorized(true)
        
        // Check if game is in a valid state
        if (data.gameStatus === 'canceled' || data.gameStatus === 'completed') {
          // alert('This game is no longer active.')
          router.push('/play')
          return
        }
      } else {
        setIsAuthorized(false)
        // Don't redirect if we're in the process of starting the game
        if (!isStartingGameRef.current) {
          // alert(data.message || 'You do not have access to this game.')
          router.push('/play')
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
          e.returnValue = 'Are you sure you want to leave the game? This will result in a loss.'
          return 'Are you sure you want to leave the game? This will result in a loss.'
        }
      }
    }

    const handleVisibilityChange = () => {
      // Only leave if the page is being unloaded, not just hidden
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
      // Set starting game flag to prevent redirects
      setIsStartingGame(true)
      
      socket.emit('StartGame', { gameId })
      
      // Don't set gameStarted immediately - wait for GameStarted event from server
      // setGameStarted(true); // REMOVED - wait for server confirmation
      
      // Set a timeout in case the GameStarted event doesn't arrive
      const timeout = setTimeout(() => {
        if (!isLeavingGame) {
          setGameStarted(true)
          setIsStartingGame(false) // Clear the flag
        }
        setStartGameTimeout(null)
      }, 1000) // 5 second timeout
      
      setStartGameTimeout(timeout)
    }
  }

  const handleCancelGame = () => {
    if (socket && gameId && !isLeavingGame) {
      setIsLeavingGame(true)
      socket.emit('LeaveGame', { gameId, playerEmail: user?.email })
    }
    router.push('/play')
  }

  const handleGameEnd = () => {
    // Set leaving flag to prevent duplicate events
    setIsLeavingGame(true)
    // Navigate back to play page
    router.push('/play')
  }

  // Check authorization first - redirect unauthorized users
  if (authorizationChecked && !isAuthorized) {
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
          </div>
        </div>
      </div>
    )
  }

  // If game is started but no opponent data, show a fallback
  if (gameStarted && !opponent && !isLeavingGame) {
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