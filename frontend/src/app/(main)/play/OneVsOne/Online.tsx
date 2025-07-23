'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { axiosInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { PlayerCard } from './Locale'
import { useGameInvite } from './GameInviteProvider'
import { PingPongGame } from '../game/PingPongGame'
import CryptoJS from 'crypto-js'
import Image from 'next/image'

export const sendGameInvite = async (playerEmail, socket, user) => {
  if (!socket || !user?.email || !playerEmail) {
    return false
  }

  try {
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    if (!encryptionKey) {
      throw new Error('Encryption key not found')
    }

    const inviteData = {
      myEmail: user.email,
      hisEmail: playerEmail,
    }

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(inviteData),
      encryptionKey
    ).toString()

    socket.emit('InviteToGame', encrypted)

    return true
  } catch (error) {
    return false
  }
}

export const PlayerListItem = ({ player, onInvite, isInviting }) => {
  const isAvailable = player.GameStatus === 'Available'

  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#1a1d23] rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Image
            src={`/images/${player.avatar}`}
            alt={player.name}
            className="w-12 h-12 rounded-full object-cover"
            width={48}
            height={48}
          />
        </div>
        <div>
          <h3 className="text-white font-medium text-lg">{player.name}</h3>
          <p
            className={`text-sm ${
              player.GameStatus === 'Available'
                ? 'text-green-400'
                : player.GameStatus === 'In a match'
                ? 'text-yellow-400'
                : 'text-gray-400'
            }`}
          >
            {player.GameStatus}
          </p>
        </div>
      </div>

      <button
        onClick={() => onInvite(player)}
        disabled={!isAvailable || isInviting}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isAvailable && !isInviting
            ? 'bg-[#4a5568] hover:bg-[#5a6578] text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isInviting ? 'Inviting...' : 'Invite'}
      </button>
    </div>
  )
}

const WaitingPage = ({
  currentUser,
  opponent,
  onStartGame,
  onCancelGame,
  isHost,
  gameId,
}) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">
          Game Ready!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
          <PlayerCard
            player={currentUser}
            playerNumber={1}
            onAddPlayer={() => {}}
          />
          <PlayerCard
            player={opponent}
            playerNumber={2}
            onAddPlayer={() => {}}
          />
        </div>

        <div className="mb-8">
          <p className="text-xl text-green-400 mb-4">
            🎮 Both players are ready!
          </p>
          <p className="text-gray-300">
            {isHost
              ? "You are the host. Click 'Start Game' to begin!"
              : 'Waiting for host to start the game...'}
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          {isHost && (
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-colors"
            >
              Start Game
            </button>
          )}
          <button
            onClick={onCancelGame}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  )
}

const WaitingForResponseModal = ({ player, waitTime, onCancel }) => {
  return (
    <div className="flex flex-row items-center justify-center">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-white mb-12"></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12 md:mb-20">
          {/* Player 1 */}
          <PlayerCard player={player} playerNumber={1} onAddPlayer={() => {}} />

          {/* Player 2 - Waiting for Response */}
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <p className="text-white text-lg mb-8">
                Waiting for {player?.name} to respond...
              </p>

              {/* Progress Bar */}
              <div className="w-full mb-4">
                <div className="bg-gray-700 rounded-full">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-1000 ease-linear"
                    style={{ width: `${((30 - waitTime) / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                Estimated wait time: {waitTime} seconds
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OnlineMatch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [invitedPlayer, setInvitedPlayer] = useState(null)
  const [gameAccepted, setGameAccepted] = useState(false)
  const [waitTime, setWaitTime] = useState(30)
  const [showGame, setShowGame] = useState(false)
  const [friends, setFriends] = useState([])
  const [gameId, setGameId] = useState(null)
  const [isInviting, setIsInviting] = useState(false)
  const [gameState, setGameState] = useState('idle') // 'idle', 'waiting_response', 'waiting_to_start', 'in_game'
  const [isHost, setIsHost] = useState(false)
  const [sessionConflict, setSessionConflict] = useState(false)
  const [currentSessionGameId, setCurrentSessionGameId] = useState(null) // Track this session's game
  const [notification, setNotification] = useState({
    message: '',
    type: 'info',
  })

  const { user, onlineUsers } = useAuthStore()
  const { socket, receivedInvite, acceptInvite, declineInvite, clearInvite } =
    useGameInvite()
  const router = useRouter()

  const countdownIntervalRef = useRef(null)
  const [currentPath, setCurrentPath] = useState('')

  // Load game state from memory storage (not localStorage due to artifact restrictions)
  const [persistentGameState, setPersistentGameState] = useState({
    gameState: 'idle',
    gameId: null,
    opponent: null,
    isHost: false,
  })

  // Helper function to handle host leaving before game starts
  const handleHostLeaveBeforeStart = () => {
    if (
      isHost &&
      gameId &&
      gameState === 'waiting_to_start' &&
      socket &&
      user?.email
    ) {
      socket.emit('PlayerLeftBeforeGameStart', { gameId, leaver: user.email })
      socket.emit('LeaveGame', { gameId, playerEmail: user.email })
    } else if (
      !isHost &&
      gameId &&
      gameState === 'waiting_to_start' &&
      socket &&
      user?.email
    ) {
      socket.emit('LeaveGame', { gameId, playerEmail: user.email })
    }
  }

  // Helper function to check if this session should handle the event
  const isThisSessionEvent = (eventGameId) => {
    return currentSessionGameId === eventGameId || gameId === eventGameId
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  useEffect(() => {
    const checkExternalState = () => {
      const externalGameStateStr = sessionStorage.getItem('externalGameState')
      if (externalGameStateStr) {
        try {
          const externalGameState = JSON.parse(externalGameStateStr)

          setGameId(externalGameState.gameId)
          setCurrentSessionGameId(externalGameState.gameId)
          setGameState(externalGameState.gameState)
          setGameAccepted(externalGameState.gameAccepted)
          setIsHost(externalGameState.isHost)
          setInvitedPlayer(externalGameState.invitedPlayer)

          sessionStorage.removeItem('externalGameState')
        } catch (error) {
          sessionStorage.removeItem('externalGameState')
        }
      }
    }

    const timeoutId = setTimeout(checkExternalState, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  // Handle route changes and page navigation
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleRouteChange = () => {
      const newPath = window.location.pathname

      // Handle different game states when player leaves
      if (currentPath && newPath !== currentPath) {
        if (
          gameState === 'waiting_to_start' &&
          gameId &&
          socket &&
          user?.email
        ) {
          handleHostLeaveBeforeStart()
        } else if (gameState === 'in_game' && gameId && socket && user?.email) {
          // Player left during active game - mark as lost
          socket.emit('LeaveGame', {
            gameId,
            playerEmail: user.email,
            reason: 'player_left_page',
          })
        } else if (
          gameState === 'waiting_response' &&
          gameId &&
          socket &&
          user?.email
        ) {
          // Player left while waiting for response - cancel invite
          socket.emit('CancelGameInvite', {
            gameId,
            hostEmail: user.email,
          })
        }
      }

      setTimeout(() => setCurrentPath(newPath), 0)
    }

    const handleBeforeUnload = (e) => {
      // Handle page refresh/close for different game states
      if (gameState === 'waiting_to_start' && gameId && socket && user?.email) {
        handleHostLeaveBeforeStart()
      } else if (gameState === 'in_game' && gameId && socket && user?.email) {
        // Show confirmation dialog for active games
        e.preventDefault()
        e.returnValue =
          'Are you sure you want to leave the game? This will result in a loss.'

        // Emit leave event
        socket.emit('LeaveGame', {
          gameId,
          playerEmail: user.email,
          reason: 'player_closed_page',
        })

        return 'Are you sure you want to leave the game? This will result in a loss.'
      } else if (
        gameState === 'waiting_response' &&
        gameId &&
        socket &&
        user?.email
      ) {
        socket.emit('CancelGameInvite', {
          gameId,
          hostEmail: user.email,
        })
      }
    }

    const handleVisibilityChange = () => {
      // Handle when user navigates to another tab or minimizes browser
      if (document.visibilityState === 'hidden') {
        if (
          gameState === 'waiting_to_start' &&
          gameId &&
          socket &&
          user?.email
        ) {
          handleHostLeaveBeforeStart()
        } else if (gameState === 'in_game' && gameId && socket && user?.email) {
          // Player left during active game - mark as lost
          socket.emit('LeaveGame', {
            gameId,
            playerEmail: user.email,
            reason: 'player_changed_tab',
          })
        } else if (
          gameState === 'waiting_response' &&
          gameId &&
          socket &&
          user?.email
        ) {
          socket.emit('CancelGameInvite', {
            gameId,
            hostEmail: user.email,
          })
        }
      }
    }

    const handlePopState = () => {
      handleRouteChange()
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Also listen for pushState and replaceState (for programmatic navigation)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(history, args)
      handleRouteChange()
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args)
      handleRouteChange()
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [currentPath, gameState, gameId, isHost, socket, user])

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    // Auto-hide after 5 seconds
    setTimeout(() => setNotification({ message: '', type: 'info' }), 5000)
  }

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleInviteResponse = (data) => {
      setIsInviting(false)

      if (data.status === 'success' && data.type === 'invite_sent') {
        setGameId(data.gameId)
        setCurrentSessionGameId(data.gameId) // Track this session's game
        setInvitedPlayer({
          ...data.guestData,
          name: data.guestData.username || data.guestData.login,
          login: data.guestData.login,
          avatar: data.guestData.avatar || '/avatar/Default.svg',
          GameStatus: 'Available',
        })
        setGameState('waiting_response')
        setIsHost(true)
        setPersistentGameState({
          gameState: 'waiting_response',
          gameId: data.gameId,
          opponent: data.guestData,
          isHost: true,
        })
      } else if (data.status === 'error') {
        showNotification(data.message, 'error')
        resetGameState()
      }
    }

    // FIXED: Improved logic for handling game invite acceptance with session checking
    const handleGameInviteAccepted = (data) => {
      if (data.status === 'ready_to_start') {
        // Check if this is for our session
        if (!isThisSessionEvent(data.gameId)) {
          return
        }

        setGameAccepted(true)
        setGameState('waiting_to_start')
        setIsWaitingForResponse(false)
        clearCountdown()

        // Check if we're the host (we have isHostNotification flag OR we were in waiting_response state)
        const isCurrentSessionHost = data.isHostNotification || gameState === 'waiting_response'
        
        if (isCurrentSessionHost) {
          // We are the host - use guest data
          setIsHost(true)
          setInvitedPlayer({
            ...data.guestData,
            name: data.guestData.username || data.guestData.login,
            login: data.guestData.login,
            avatar: data.guestData.avatar || '/avatar/Default.svg',
            GameStatus: 'Available',
          })
        } else {
          // We are the guest - use host data
          setIsHost(false)
          setInvitedPlayer({
            ...data.hostData,
            name: data.hostData?.username || data.hostData?.login,
            login: data.hostData?.login,
            avatar: data.hostData?.avatar || '/avatar/Default.svg',
            GameStatus: 'Available',
          })
        }

        setPersistentGameState({
          gameState: 'waiting_to_start',
          gameId: data.gameId,
          opponent: isCurrentSessionHost ? data.guestData : data.hostData,
          isHost: isCurrentSessionHost,
        })
      }
    }

    const handleGameInviteDeclined = (data) => {
      if (!isThisSessionEvent(data.gameId)) return;

      setIsInviting(false)
      setInvitedPlayer(null)
      setIsWaitingForResponse(false)
      setWaitTime(0)
      clearCountdown()

      showNotification(
        `${data.guestLogin || data.guestName} declined your invitation.`,
        'error'
      )

      resetGameState()
      router.push('/play')
    }

    const handleGameInviteTimeout = (data) => {
      if (!isThisSessionEvent(data.gameId)) return;
      
      setIsInviting(false)
      setInvitedPlayer(null)
      setIsWaitingForResponse(false)
      setWaitTime(0)
      clearCountdown()

      showNotification('Game invitation expired.', 'error')
      resetGameState()
    }

    const handleGameInviteCanceled = (data) => {
      if (!isThisSessionEvent(data.gameId)) return;

      setIsInviting(false)
      setInvitedPlayer(null)
      setIsWaitingForResponse(false)
      setWaitTime(0)
      clearCountdown()

      showNotification('Game invitation was canceled by host.', 'error')
      resetGameState()
    }

    // FIXED: Add session conflict handlers
    const handleGameInviteCleanup = (data) => {
      // This is sent to sessions that didn't accept/decline
      if (data.gameId === gameId || data.gameId === currentSessionGameId) {
        // Another session handled this invite
        setSessionConflict(true)
        showNotification(data.message || 'Invite handled in another session', 'info')
        resetGameState()
      }
    }

    const handleSessionConflict = (data) => {
      setSessionConflict(true)
      showNotification('Another session is handling this game', 'warning')
      resetGameState()
    }

    const handlePlayerLeft = (data) => {
      if (!isThisSessionEvent(data.gameId)) return;

      setIsInviting(false)
      setInvitedPlayer(null)
      setIsWaitingForResponse(false)
      setWaitTime(0)
      clearCountdown()

      showNotification('Opponent left the game. You win!', 'success')
      resetGameState()

      if (socket && user?.email) {
        socket.emit('CleanupGameData', { email: user.email })
      }

      const winnerName = user?.username || user?.login || 'You'
      const loserName = data.playerWhoLeft || 'Opponent'
      router.push(
        `/play/result/win?winner=${encodeURIComponent(
          winnerName
        )}&loser=${encodeURIComponent(loserName)}`
      )
    }

    const handleGameEnded = (data) => {
      if (!isThisSessionEvent(data.gameId)) return;

      setIsInviting(false)
      setInvitedPlayer(null)
      setIsWaitingForResponse(false)
      setWaitTime(0)
      clearCountdown()

      const isWinner = data.winner === user?.email
      const winnerName = isWinner
        ? user?.username || user?.login || 'You'
        : data.winner || 'Opponent'
      const loserName = isWinner
        ? data.loser || 'Opponent'
        : user?.username || user?.login || 'You'

      showNotification(data.message || 'Game ended.', 'info')
      resetGameState()

      if (socket && user?.email) {
        socket.emit('CleanupGameData', { email: user.email })
      }

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

    const handleGameCanceled = (data) => {
      if (!isThisSessionEvent(data.gameId)) return;

      setIsInviting(false)
      setInvitedPlayer(null)
      setIsWaitingForResponse(false)
      setWaitTime(0)
      clearCountdown()

      showNotification('Game was canceled.', 'error')
      resetGameState()
      router.push('/play')
    }

    const handleGameStartResponse = (data) => {
      if (!isThisSessionEvent(gameId)) return;

      if (data.status === 'success') {
        if (!isHost) {
          const targetPath = `/play/game/${gameId}`
          window.location.href = targetPath
        } else {
          setShowGame(true)
        }
      }
    }

    const handleGameStarted = (data) => {
      if (!isThisSessionEvent(data.gameId)) return;

      if (data.gameId === gameId) {
        setGameState('in_game')
      }
    }

    const handleGameEndedByOpponentLeave = (data) => {
      if (!isThisSessionEvent(data.gameId)) return;

      setIsInviting(false)
      setInvitedPlayer(null)
      setIsWaitingForResponse(false)
      setWaitTime(0)
      clearCountdown()
      showNotification('Opponent left the game.', 'error')
      resetGameState()
      router.push('/play')
    }

    // Add event listeners
    socket.on('InviteToGameResponse', handleInviteResponse)
    socket.on('GameInviteAccepted', handleGameInviteAccepted)
    socket.on('GameInviteDeclined', handleGameInviteDeclined)
    socket.on('GameInviteTimeout', handleGameInviteTimeout)
    socket.on('GameInviteCanceled', handleGameInviteCanceled)
    socket.on('GameInviteCleanup', handleGameInviteCleanup)
    socket.on('SessionConflict', handleSessionConflict)
    socket.on('PlayerLeft', handlePlayerLeft)
    socket.on('GameEnded', handleGameEnded)
    socket.on('GameCanceled', handleGameCanceled)
    socket.on('GameStartResponse', handleGameStartResponse)
    socket.on('GameStarted', handleGameStarted)
    socket.on('GameEndedByOpponentLeave', handleGameEndedByOpponentLeave)

    return () => {
      socket.off('InviteToGameResponse', handleInviteResponse)
      socket.off('GameInviteAccepted', handleGameInviteAccepted)
      socket.off('GameInviteDeclined', handleGameInviteDeclined)
      socket.off('GameInviteTimeout', handleGameInviteTimeout)
      socket.off('GameInviteCanceled', handleGameInviteCanceled)
      socket.off('GameInviteCleanup', handleGameInviteCleanup)
      socket.off('SessionConflict', handleSessionConflict)
      socket.off('PlayerLeft', handlePlayerLeft)
      socket.off('GameEnded', handleGameEnded)
      socket.off('GameCanceled', handleGameCanceled)
      socket.off('GameStartResponse', handleGameStartResponse)
      socket.off('GameStarted', handleGameStarted)
      socket.off('GameEndedByOpponentLeave', handleGameEndedByOpponentLeave)
    }
  }, [
    socket,
    gameId,
    currentSessionGameId,
    clearInvite,
    user?.email,
    gameState,
    isHost,
    receivedInvite,
  ])

  // Handle page refresh and disconnection
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If we're in a game, notify the server that we're leaving
      if (socket && gameId && user?.email) {
        socket.emit('LeaveGame', {
          gameId,
          playerEmail: user.email,
        })
      }
    }

    const handleVisibilityChange = () => {
      // If page becomes hidden (user switches tabs or minimizes), treat as leaving
      if (document.hidden && socket && gameId && user?.email) {
        socket.emit('LeaveGame', {
          gameId,
          playerEmail: user.email,
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [socket, gameId, user?.email])

  // Handle accepting invite from context
  useEffect(() => {
    if (receivedInvite && gameState === 'idle') {
      setInvitedPlayer({
        ...receivedInvite.hostData,
        name: receivedInvite.hostData.username,
        GameStatus: 'Available',
      })
      setGameId(receivedInvite.gameId)
      setCurrentSessionGameId(receivedInvite.gameId) // Track this session's game
      setIsHost(false) // Guest is not host
      setPersistentGameState({
        gameState: 'idle',
        gameId: receivedInvite.gameId,
        opponent: receivedInvite.hostData,
        isHost: false,
      })
    }
  }, [receivedInvite, gameState])

  // Fetch friends effect
  useEffect(() => {
    async function fetchFriends() {
      if (!user?.email) return

      try {
        const res = await axiosInstance.get(
          `/api/users/friends?email=${user.email}`
        )

        const data = res.data

        if (data.friends && Array.isArray(data.friends)) {
          const formatted = data.friends
            .filter((f) => onlineUsers.includes(f.email)) // Check if user is in onlineUsers
            .map((f) => ({
              name: f.username,
              avatar: f.avatar,
              nickname: f.login,
              GameStatus: 'Available',
              ...f,
            }))
          setFriends(formatted)
        } else {
          setFriends([])
        }
      } catch (err) {
        setFriends([])
      }
    }
    fetchFriends()
  }, [user])

  const resetGameState = () => {
    setGameState('idle')
    setIsWaitingForResponse(false)
    setInvitedPlayer(null)
    setGameAccepted(false)
    setWaitTime(30)
    setGameId(null)
    setCurrentSessionGameId(null) // Reset session tracking
    setIsHost(false)
    setShowGame(false)
    setIsInviting(false)
    setSessionConflict(false)
    setPersistentGameState({
      gameState: 'idle',
      gameId: null,
      opponent: null,
      isHost: false,
    })
    clearCountdown()
  }

  const clearCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  const filteredPlayers = friends.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInvite = async (player) => {
    if (!socket) {
      return
    }

    setIsInviting(true)
    setInvitedPlayer(player)
    setIsWaitingForResponse(true)
    setGameAccepted(false)
    setWaitTime(30)
    clearCountdown()

    const success = await sendGameInvite(player.email, socket, user)

    if (success) {
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setWaitTime((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
            // If time runs out, cancel the invite automatically
            handleCancelInvite()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setIsInviting(false)
      resetGameState()
    }
  }

  const handleCancelInvite = () => {
    if (socket && gameId && user?.email) {
      socket.emit('CancelGameInvite', {
        gameId,
        hostEmail: user.email,
      })
    }
    resetGameState()
  }

  // FIXED: Simplified start game logic
  const handleStartGame = () => {
    if (socket && gameId) {
      socket.emit('StartGame', { gameId })
    }
  }

  const handleCancelGame = () => {
    if (socket && gameId) {
      socket.emit('CancelGame', { gameId })
    }
    resetGameState()
  }

  const handleGameEnd = () => {
    resetGameState()
  }

  // If waiting to start game, show waiting page
  if (gameState === 'waiting_to_start' && gameAccepted && invitedPlayer) {
    return (
      <WaitingPage
        currentUser={user}
        opponent={invitedPlayer}
        onStartGame={handleStartGame}
        onCancelGame={handleCancelGame}
        isHost={isHost}
        gameId={gameId}
      />
    )
  }

  return (
    <div className="h-full w-full text-white">
      {/* Show session conflict notification */}
      {sessionConflict && (
        <div className="fixed top-4 right-4 bg-yellow-600 text-white p-4 rounded-lg shadow-lg z-50">
          <p>Game is being handled in another session</p>
        </div>
      )}

      {/* Show notification */}
      {notification.message && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-600' : 
          notification.type === 'success' ? 'bg-green-600' : 
          notification.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        } text-white`}>
          <p>{notification.message}</p>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-7xl">
          {!gameAccepted && gameState === 'idle' && (
            <h1 className="text-center text-4xl md:text-5xl font-bold mb-8">
              1v1 Online Match
            </h1>
          )}

          {!showGame ? (
            gameState === 'idle' ? (
              <>
                {/* Search Bar */}
                <div className="relative mb-8">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for players"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#2a2f3a] text-white rounded-lg border-none outline-none focus:bg-[#3a3f4a] transition-colors text-lg"
                  />
                </div>

                {/* Online Players Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Online Players
                  </h2>
                  <div className="space-y-2">
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player, index) => (
                        <PlayerListItem
                          key={`${player.name}-${index}`}
                          player={player}
                          onInvite={handleInvite}
                          isInviting={
                            isInviting && invitedPlayer?.email === player.email
                          }
                        />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400 text-lg mb-4">
                          {searchQuery
                            ? 'No players found matching your search.'
                            : 'No friends online right now.'}
                        </p>
                        {!searchQuery && (
                          <div className="space-y-2">
                            <p className="text-gray-500 text-sm">
                              Make sure you have friends added to your account.
                            </p>
                            <button
                              onClick={() => window.location.reload()}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              Refresh
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Match Queue / Waiting for Response Interface
              <WaitingForResponseModal
                player={invitedPlayer}
                waitTime={waitTime}
                onCancel={handleCancelInvite}
              />
            )
          ) : (
            // Game Component for Host
            <PingPongGame
              player1={user}
              player2={invitedPlayer}
              onExit={handleGameEnd}
              gameId={gameId}
              socket={socket}
              isHost={isHost}
              opponent={invitedPlayer}
            />
          )}
        </div>
      </div>
    </div>
  )
}