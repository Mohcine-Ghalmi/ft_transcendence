"use client"
import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (!socket || !gameId) return

    console.log('Game page mounted with gameId:', gameId, 'socket:', !!socket, 'user:', user?.email)

    const handleGameInviteAccepted = (data: any) => {
      console.log('GameInviteAccepted received:', data)
      if (data.gameId === gameId && data.status === 'ready_to_start') {
        console.log('Setting game as accepted')
        setGameAccepted(true)
        // Determine if current user is host
        const isCurrentUserHost = data.acceptedBy !== user?.email
        setIsHost(isCurrentUserHost)
        console.log('Is host:', isCurrentUserHost, 'user email:', user?.email, 'acceptedBy:', data.acceptedBy)
        
        // Set opponent data
        const opponentData = isCurrentUserHost ? data.guestData : data.hostData
        setOpponent({
          email: opponentData.email,
          username: opponentData.username,
          avatar: opponentData.avatar || '/mghalmi.jpg',
          login: opponentData.login
        })
        console.log('Opponent set:', opponentData)
      }
    }

    const handleGameStarted = (data: any) => {
      console.log('GameStarted received:', data)
      if (data.gameId === gameId) {
        console.log('Setting game as started - transitioning from waiting to playing')
        setGameStarted(true)
        setGameData(data)
        
        // Set opponent data if not already set
        if (!opponent && data.players) {
          const isCurrentUserHost = data.players.host === user?.email
          const opponentEmail = isCurrentUserHost ? data.players.guest : data.players.host
          // We'll need to get opponent data from the game state or context
          // For now, we'll use a placeholder
          setOpponent({
            email: opponentEmail,
            username: opponentEmail, // This should be fetched from user data
            avatar: '/mghalmi.jpg',
            login: opponentEmail
          })
        }
        
        console.log('Game state updated - gameStarted:', true, 'opponent:', opponent)
      }
    }

    const handleGameStateUpdate = (data: any) => {
      if (data.gameId === gameId) {
        setGameData(data)
      }
    }

    // Add listener for GameStartResponse to debug
    const handleGameStartResponse = (data: any) => {
      console.log('GameStartResponse received:', data)
    }

    socket.on('GameInviteAccepted', handleGameInviteAccepted)
    socket.on('GameStarted', handleGameStarted)
    socket.on('GameStateUpdate', handleGameStateUpdate)
    socket.on('GameStartResponse', handleGameStartResponse)

    return () => {
      socket.off('GameInviteAccepted', handleGameInviteAccepted)
      socket.off('GameStarted', handleGameStarted)
      socket.off('GameStateUpdate', handleGameStateUpdate)
      socket.off('GameStartResponse', handleGameStartResponse)
    }
  }, [socket, gameId, user?.email, opponent])

  const handleStartGame = () => {
    if (socket && gameId) {
      console.log('Emitting StartGame for gameId:', gameId)
      socket.emit('StartGame', { gameId })
    }
  }

  const handleCancelGame = () => {
    if (socket && gameId) {
      socket.emit('LeaveGame', { gameId, playerEmail: user?.email })
    }
    window.location.href = '/play'
  }

  const handleGameEnd = () => {
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
    userEmail: user?.email
  })

  // If game is started, show the game
  if (gameStarted) {
    console.log('Rendering game component')
    if (!user || !opponent) {
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
  if (gameAccepted && opponent) {
    console.log('Rendering waiting room')
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">Game Ready!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
            {/* Player 1 - Current User */}
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
                Player 1
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
                Player 2
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
              {isHost ? "You can start the game when ready." : "Waiting for host to start the game..."}
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            {isHost && (
              <button
                onClick={handleStartGame}
                className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-colors"
              >
                Start Game
              </button>
            )}
            <button
              onClick={handleCancelGame}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Leave Game
            </button>
            
            {/* Debug button - remove in production */}
            <button
              onClick={() => {
                console.log('Manual game start triggered')
                setGameStarted(true)
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Debug: Force Start
            </button>
          </div>
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
        </div>
      </div>
    </div>
  )
} 