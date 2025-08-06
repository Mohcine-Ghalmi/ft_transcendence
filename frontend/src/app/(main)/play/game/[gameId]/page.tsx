'use client'
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
  const [startGameTimeout, setStartGameTimeout] =
    useState<NodeJS.Timeout | null>(null)
  const [isLeavingGame, setIsLeavingGame] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authorizationChecked, setAuthorizationChecked] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [isTournamentMatch, setIsTournamentMatch] = useState(false)
  const [currentSessionGameId, setCurrentSessionGameId] = useState<
    string | null
  >(null)

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

  useEffect(() => {
    if (!socket || !gameId || !user?.email) return

    socket.emit('CheckGameAuthorization', {
      gameId,
      playerEmail: user.email,
    })

    const authTimeout = setTimeout(() => {
      if (!authorizationChecked && !isStartingGameRef.current) {
        setIsAuthorized(false)
        setAuthorizationChecked(true)
        setTimeout(() => {
          router.push('/play')
        }, 0)
      }
    }, 3000)

    return () => {
      clearTimeout(authTimeout)
    }
  }, [socket, gameId, user?.email, authorizationChecked])

  useEffect(() => {
    if (!socket || !gameId) return

    const handleMatchFound = (data: any) => {
      if (data.gameId === gameId || data.gameRoomId === gameId) {
        setIsAuthorized(true)
        setAuthorizationChecked(true)
        setGameAccepted(true)
        setCurrentSessionGameId(data.gameId || data.gameRoomId)
        if (data.isTournament || data.tournamentId) {
          setIsTournamentMatch(true)
        }
        if (data.hostData && data.guestData) {
          const isCurrentUserHost = data.hostEmail === user?.email
          const opponentData = isCurrentUserHost
            ? data.guestData
            : data.hostData

          setOpponent({
            email: opponentData.email,
            username:
              opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar,
            login:
              opponentData.login ||
              opponentData.nickname ||
              opponentData.username ||
              opponentData.email,
          })

          setIsHost(isCurrentUserHost)
        }
      }
    }

    const handleGameFound = (data: any) => {
      if (data.gameId === gameId || data.gameRoomId === gameId) {
        setIsAuthorized(true)
        setAuthorizationChecked(true)
        setGameAccepted(true)
        setCurrentSessionGameId(data.gameId || data.gameRoomId)
        if (data.opponent) {
          setOpponent({
            email: data.opponent.email,
            username:
              data.opponent.username ||
              data.opponent.login ||
              data.opponent.email,
            avatar: data.opponent.avatar,
            login:
              data.opponent.login ||
              data.opponent.nickname ||
              data.opponent.username ||
              data.opponent.email,
          })
        }
        if (data.gameRoom) {
          setIsHost(data.gameRoom.hostEmail === user?.email)
        }
      }
    }

    const handleGameStarting = (data: any) => {
      if (data.gameId === gameId) {
        setIsAuthorized(true)
        setAuthorizationChecked(true)
        setGameAccepted(true)
        setGameStarted(true)
        setGameData(data)
        setCurrentSessionGameId(data.gameId)
        if (data.isTournament || data.tournamentId) {
          setIsTournamentMatch(true)
        }
        if (data.hostData && data.guestData) {
          const isCurrentUserHost = data.hostEmail === user?.email
          const opponentData = isCurrentUserHost
            ? data.guestData
            : data.hostData

          setOpponent({
            email: opponentData.email,
            username:
              opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar,
            login:
              opponentData.login ||
              opponentData.nickname ||
              opponentData.username ||
              opponentData.email,
          })

          setIsHost(isCurrentUserHost)
        }
        if (startGameTimeout) {
          clearTimeout(startGameTimeout)
          setStartGameTimeout(null)
        }
        setIsStartingGame(false)
      }
    }

    const handleGameInviteAccepted = (data: any) => {
      if (data.gameId === gameId && data.status === 'ready_to_start') {
        setGameAccepted(true)
        setCurrentSessionGameId(data.gameId)
        let isCurrentUserHost = false
        let opponentData = null

        if (data.hostData && data.hostData.email !== user?.email) {
          isCurrentUserHost = false
          opponentData = data.hostData
        } else if (data.guestData && data.guestData.email !== user?.email) {
          isCurrentUserHost = true
          opponentData = data.guestData
        } else {
          if (data.hostData && !data.guestData) {
            isCurrentUserHost = false
            opponentData = data.hostData
          } else if (data.guestData && !data.hostData) {
            isCurrentUserHost = true
            opponentData = data.guestData
          } else {
            return
          }
        }

        setIsHost(isCurrentUserHost)

        if (
          opponentData &&
          (opponentData.username || opponentData.login || opponentData.email)
        ) {
          setOpponent({
            email: opponentData.email,
            username:
              opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar,
            login:
              opponentData.login ||
              opponentData.nickname ||
              opponentData.username ||
              opponentData.email,
          })
        }
      }
    }

    const handleGameStarted = (data: any) => {
      if (data.gameId === gameId) {
        setGameStarted(true)
        setGameData(data)
        setCurrentSessionGameId(data.gameId)
        if (data.isTournament || data.tournamentId) {
          setIsTournamentMatch(true)
        }

        setIsStartingGame(false)
        if (startGameTimeout) {
          clearTimeout(startGameTimeout)
          setStartGameTimeout(null)
        }
        if (data.hostData && data.guestData) {
          const isCurrentUserHost =
            data.players?.host === user?.email || data.hostEmail === user?.email
          const opponentData = isCurrentUserHost
            ? data.guestData
            : data.hostData

          setOpponent({
            email: opponentData.email,
            username:
              opponentData.username || opponentData.login || opponentData.email,
            avatar: opponentData.avatar,
            login:
              opponentData.login ||
              opponentData.nickname ||
              opponentData.username ||
              opponentData.email,
          })

          setIsHost(isCurrentUserHost)
        } else if (!opponent && data.players) {
          const isCurrentUserHost = data.players.host === user?.email
          const opponentEmail = isCurrentUserHost
            ? data.players.guest
            : data.players.host
          setOpponent({
            email: opponentEmail,
            username: opponentEmail,
            avatar: user?.avatar,
            login: opponentEmail,
          })

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

    const handleGameStartResponse = (data: any) => {
      if (data.status !== 'success') {
        if (startGameTimeout) {
          clearTimeout(startGameTimeout)
          setStartGameTimeout(null)
        }
        setIsStartingGame(false)
      }
    }

    const handlePlayerLeft = (data: any) => {
      if (data.gameId === gameId) {
        if (!isLeavingGameRef.current) {
          if (
            data.isTournament ||
            data.isTournamentMatch ||
            isTournamentMatch
          ) {
            router.push(`/play/tournament/${data.tournamentId}`)
          } else {
            const winnerName = user?.username || user?.login || 'You'
            const loserName = data.playerWhoLeft || 'Opponent'
            router.push(
              `/play/result/win?winner=${encodeURIComponent(
                winnerName
              )}&loser=${encodeURIComponent(loserName)}`
            )
          }
        }
      }
    }

    const handleGameEnded = (data: any) => {
      if (data.gameId === gameId) {
        if (data.isTournament || data.isTournamentMatch || isTournamentMatch) {
          setTimeout(() => {
            router.push(`/play/tournament/${data.tournamentId}`)
          }, 1000)
        } else {
          const isWinner = data.winner === user?.email
          const winnerName = isWinner
            ? user?.username || user?.login || 'You'
            : data.winner || 'Opponent'
          const loserName = isWinner
            ? data.loser || 'Opponent'
            : user?.username || user?.login || 'You'

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
    }

    const handleGameCanceled = (data: any) => {
      if (data.gameId === gameId) {
        if (!isLeavingGameRef.current) {
          setIsLeavingGame(true)
          setTimeout(() => {
            router.push('/play')
          }, 0)
        }
      }
    }

    const handleGameAuthorizationResponse = (data: any) => {
      setAuthorizationChecked(true)

      if (data.status === 'success' && data.authorized) {
        setIsAuthorized(true)
        setCurrentSessionGameId(gameId)
        if (data.gameStatus === 'canceled' || data.gameStatus === 'completed') {
          setTimeout(() => {
            router.push('/play')
          }, 0)
          return
        }

        if (
          (data.gameStatus === 'playing' ||
            data.gameStatus === 'accepted' ||
            data.gameStatus === 'waiting') &&
          (data.isTournament || data.tournamentId) &&
          data.gameRoom
        ) {
          setIsTournamentMatch(true)

          setGameAccepted(true)
          if (data.gameStatus === 'playing' || data.gameState) {
            setGameStarted(true)
          }
          setIsHost(data.isHost || data.gameRoom.hostEmail === user?.email)
          const opponentEmail = data.isHost
            ? data.gameRoom.guestEmail
            : data.gameRoom.hostEmail

          const opponentData = data.opponent || {}
          setOpponent({
            email: opponentEmail,
            username:
              opponentData.username ||
              opponentData.login ||
              opponentEmail.split('@')[0],
            avatar: opponentData.avatar,
            login:
              opponentData.login ||
              opponentData.username ||
              opponentEmail.split('@')[0],
          })

          if (data.gameState || data.gameStatus === 'playing') {
            setGameData({
              gameId: data.gameRoom.gameId || gameId,
              isTournament: data.isTournament || !!data.tournamentId,
              tournamentId: data.tournamentId,
              matchId: data.matchId,
              gameState: data.gameState,
              players: {
                host: data.gameRoom.hostEmail,
                guest: data.gameRoom.guestEmail,
              },
              hostData: {
                email: data.gameRoom.hostEmail,
                username: data.gameRoom.hostEmail.split('@')[0],
                avatar: user?.avatar,
                login: data.gameRoom.hostEmail.split('@')[0],
              },
              guestData: {
                email: data.gameRoom.guestEmail,
                username: data.gameRoom.guestEmail.split('@')[0],
                avatar: user?.avatar,
                login: data.gameRoom.guestEmail.split('@')[0],
              },
            })
          }

          return
        }
      } else {
        setIsAuthorized(false)
        if (!isStartingGameRef.current) {
          setTimeout(() => {
            if (!gameAccepted && !gameStarted) {
              router.push('/play')
            }
          }, 2000)
        }
      }
    }

    const handleTournamentPlayerForfeited = (data: any) => {
      if (
        data.tournamentId &&
        (isTournamentMatch || gameData?.tournamentId === data.tournamentId)
      ) {
        const userWasInMatch =
          data.affectedMatch &&
          (data.affectedMatch.player1?.email === user?.email ||
            data.affectedMatch.player2?.email === user?.email)

        if (userWasInMatch) {
          setTimeout(() => {
            router.push(`/play/tournament/${data.tournamentId}`)
          }, 1000)
        }
      }
    }

    socket.on('MatchFound', handleMatchFound)
    socket.on('GameFound', handleGameFound)
    socket.on('GameStarting', handleGameStarting)
    socket.on('GameInviteAccepted', handleGameInviteAccepted)
    socket.on('GameStarted', handleGameStarted)
    socket.on('GameStateUpdate', handleGameStateUpdate)
    socket.on('GameStartResponse', handleGameStartResponse)
    socket.on('PlayerLeft', handlePlayerLeft)
    socket.on('GameEnded', handleGameEnded)
    socket.on('GameCanceled', handleGameCanceled)
    socket.on('GameAuthorizationResponse', handleGameAuthorizationResponse)
    socket.on('TournamentPlayerForfeited', handleTournamentPlayerForfeited)

    return () => {
      socket.off('MatchFound', handleMatchFound)
      socket.off('GameFound', handleGameFound)
      socket.off('GameStarting', handleGameStarting)
      socket.off('GameInviteAccepted', handleGameInviteAccepted)
      socket.off('GameStarted', handleGameStarted)
      socket.off('GameStateUpdate', handleGameStateUpdate)
      socket.off('GameStartResponse', handleGameStartResponse)
      socket.off('PlayerLeft', handlePlayerLeft)
      socket.off('GameEnded', handleGameEnded)
      socket.off('GameCanceled', handleGameCanceled)
      socket.off('GameAuthorizationResponse', handleGameAuthorizationResponse)
      socket.off('TournamentPlayerForfeited', handleTournamentPlayerForfeited)

      if (startGameTimeout) {
        clearTimeout(startGameTimeout)
      }
    }
  }, [socket, gameId, user?.email])

  useEffect(() => {
    let hasUnloaded = false

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        socket &&
        gameId &&
        user?.email &&
        !isLeavingGameRef.current &&
        !hasUnloaded
      ) {
        hasUnloaded = true
        setIsLeavingGame(true)

        const leaveData = {
          gameId,
          playerEmail: user.email,
          reason: 'page_refresh',
          sessionId: socket.id,
        }

        if (isTournamentMatch && gameData?.tournamentId) {
          ;(leaveData as any).tournamentId = gameData.tournamentId
          ;(leaveData as any).isTournamentMatch = true
        }

        socket.emit('LeaveGame', leaveData)

        if (gameStartedRef.current) {
          e.preventDefault()
          const message = isTournamentMatch
            ? 'Are you sure you want to leave the tournament match? You will be eliminated and your opponent will advance.'
            : 'Are you sure you want to leave the game? This will result in a loss.'
          e.returnValue = message
          return message
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnloaded) {
        if (socket && gameId && user?.email && !isLeavingGameRef.current) {
          setIsLeavingGame(true)

          const leaveData = {
            gameId,
            playerEmail: user.email,
            reason: 'tab_change',
            sessionId: socket.id,
          }

          if (isTournamentMatch && gameData?.tournamentId) {
            ;(leaveData as any).tournamentId = gameData.tournamentId
            ;(leaveData as any).isTournamentMatch = true
          }

          socket.emit('LeaveGame', leaveData)
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

  useEffect(() => {
    return () => {
      if (startGameTimeout) {
        clearTimeout(startGameTimeout)
      }
    }
  }, [startGameTimeout])

  const handleStartGame = () => {
    if (socket && gameId && !isLeavingGame) {
      setIsStartingGame(true)

      socket.emit('StartGame', { gameId })
      const timeout = setTimeout(() => {
        if (!isLeavingGame) {
          setGameStarted(true)
          setIsStartingGame(false)
        }
        setStartGameTimeout(null)
      }, 1000)

      setStartGameTimeout(timeout)
    }
  }

  const handleCancelGame = () => {
    if (socket && gameId && !isLeavingGame) {
      setTimeout(() => {
        setIsLeavingGame(true), 0
      })

      const leaveData = {
        gameId,
        playerEmail: user?.email,
        reason: 'player_cancelled_game',
        sessionId: socket?.id,
      }

      if (isTournamentMatch && gameData?.tournamentId) {
        ;(leaveData as any).tournamentId = gameData.tournamentId
        ;(leaveData as any).isTournamentMatch = true
      }

      socket.emit('LeaveGame', leaveData)
    }
  }

  const handleGameEnd = () => {
    setIsLeavingGame(true)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleRouteChange = () => {
      const newPath = window.location.pathname
      if (currentPath && newPath !== currentPath) {
        const isActiveSession = currentSessionGameId === gameId

        if (isActiveSession && gameId && socket && user?.email) {
          handleCancelGame()

          const leaveData = {
            gameId,
            playerEmail: user.email,
            reason: 'player_left_page',
            sessionId: socket.id,
          }

          if (isTournamentMatch && gameData?.tournamentId) {
            ;(leaveData as any).tournamentId = gameData.tournamentId
            ;(leaveData as any).isTournamentMatch = true
          }

          socket.emit('LeaveGame', leaveData)
        } else if (
          isActiveSession &&
          gameAccepted &&
          gameId &&
          socket &&
          user?.email
        ) {
          const leaveData = {
            gameId,
            playerEmail: user.email,
            reason: 'player_left_waiting_page',
            sessionId: socket.id,
          }

          if (isTournamentMatch && gameData?.tournamentId) {
            ;(leaveData as any).tournamentId = gameData.tournamentId
            ;(leaveData as any).isTournamentMatch = true
          }

          if (isHost) {
            socket.emit('PlayerLeftBeforeGameStart', {
              gameId,
              leaver: user.email,
              sessionId: socket.id,
            })
            socket.emit('LeaveGame', leaveData)
          } else {
            socket.emit('LeaveGame', leaveData)
          }
        }
      }

      setTimeout(() => setCurrentPath(newPath), 0)
    }

    const handleBeforeUnload = (e) => {
      const isActiveSession = currentSessionGameId === gameId

      if (isActiveSession && gameId && socket && user?.email) {
        e.preventDefault()
        const message = isTournamentMatch
          ? 'Are you sure you want to leave the tournament match? You will be eliminated and your opponent will advance.'
          : 'Are you sure you want to leave the game? This will result in a loss.'
        e.returnValue = message

        const leaveData = {
          gameId,
          playerEmail: user.email,
          reason: 'player_closed_page',
          sessionId: socket.id,
        }

        if (isTournamentMatch && gameData?.tournamentId) {
          ;(leaveData as any).tournamentId = gameData.tournamentId
          ;(leaveData as any).isTournamentMatch = true
        }

        socket.emit('LeaveGame', leaveData)

        return message
      } else if (
        isActiveSession &&
        gameAccepted &&
        gameId &&
        socket &&
        user?.email
      ) {
        const leaveData = {
          gameId,
          playerEmail: user.email,
          reason: 'player_closed_waiting_room',
          sessionId: socket.id,
        }

        if (isTournamentMatch && gameData?.tournamentId) {
          ;(leaveData as any).tournamentId = gameData.tournamentId
          ;(leaveData as any).isTournamentMatch = true
        }

        if (isHost) {
          socket.emit('PlayerLeftBeforeGameStart', {
            gameId,
            leaver: user.email,
            sessionId: socket.id,
          })
          socket.emit('LeaveGame', leaveData)
        } else {
          socket.emit('LeaveGame', leaveData)
        }
      }
    }

    const handleVisibilityChange = () => {
      const isActiveSession = currentSessionGameId === gameId

      if (document.visibilityState === 'hidden' && isActiveSession) {
        if (gameId && socket && user?.email) {
          handleCancelGame()

          const leaveData = {
            gameId,
            playerEmail: user.email,
            reason: 'player_changed_tab',
            sessionId: socket.id,
          }

          if (isTournamentMatch && gameData?.tournamentId) {
            ;(leaveData as any).tournamentId = gameData.tournamentId
            ;(leaveData as any).isTournamentMatch = true
          }

          socket.emit('LeaveGame', leaveData)
        } else if (gameAccepted && gameId && socket && user?.email) {
          handleCancelGame()

          const leaveData = {
            gameId,
            playerEmail: user.email,
            reason: 'player_changed_tab_waiting',
            sessionId: socket.id,
          }

          if (isTournamentMatch && gameData?.tournamentId) {
            ;(leaveData as any).tournamentId = gameData.tournamentId
            ;(leaveData as any).isTournamentMatch = true
          }

          if (isHost) {
            socket.emit('PlayerLeftBeforeGameStart', {
              gameId,
              leaver: user.email,
              sessionId: socket.id,
            })
            socket.emit('LeaveGame', leaveData)
          } else {
            socket.emit('LeaveGame', leaveData)
          }
        }
      }
    }

    const handlePopState = () => {
      handleRouteChange()
    }

    // Listen for route changes
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

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
  }, [
    currentPath,
    gameAccepted,
    gameId,
    isHost,
    socket,
    user,
    currentSessionGameId,
    isLeavingGame,
    isTournamentMatch,
    gameData?.tournamentId,
  ]) // Add currentSessionGameId to dependencies

  if (authorizationChecked && !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Access Denied</h1>
          <p className="text-gray-400 mb-4">
            You don't have permission to access this game.
          </p>
          {/* <button
            onClick={() => window.location.href = '/play'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Play
          </button> */}
        </div>
      </div>
    )
  }

  if (!authorizationChecked) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Checking Game Access...
          </h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4">
            Verifying your access to this game...
          </p>
        </div>
      </div>
    )
  }

  if (gameStarted && opponent && !isLeavingGame) {
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">
              Game not found or you don't have permission to join
            </h1>
            <button
              onClick={() => setTimeout(() => router.push('/play'), 0)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Back to Play
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] px-4">
        <div className="w-full max-w-7xl">
          <PingPongGame
            player1={user}
            player2={opponent}
            onExit={handleGameEnd}
            gameId={gameId}
            socket={socket}
            isHost={isHost}
            opponent={opponent}
            isTournamentMode={
              isTournamentMatch ||
              gameData?.isTournament ||
              gameData?.tournamentId
                ? true
                : false
            }
          />
        </div>
      </div>
    )
  }

  if (gameAccepted && opponent && !isLeavingGame) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">
            {isTournamentMatch ? 'Tournament Match Ready!' : 'Game Ready!'}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
                {isHost ? 'Host (You)' : 'Player 1'}
              </h3>
              <div className="mb-8">
                <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-6">
                  <img
                    src={`/images/${user?.avatar}`}
                    alt={user?.username}
                    className="w-full h-full rounded-full object-cover border-4 border-[#4a5568]"
                  />
                </div>
                <h4 className="text-white font-semibold text-2xl md:text-3xl">
                  {user?.username}
                </h4>
                <p className="text-gray-400 text-lg md:text-xl">
                  @{user?.login}
                </p>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
                {!isHost ? 'Host' : 'Player 2'}
              </h3>
              <div className="mb-8">
                <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-6">
                  <img
                    src={`/images/${opponent.avatar}`}
                    alt={opponent.username}
                    className="w-full h-full rounded-full object-cover border-4 border-[#4a5568]"
                  />
                </div>
                <h4 className="text-white font-semibold text-2xl md:text-3xl">
                  {opponent.username}
                </h4>
                <p className="text-gray-400 text-lg md:text-xl">
                  @{opponent.login}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xl text-green-400 mb-4">
              🎮 Both players are ready!
            </p>
            <p className="text-gray-300">
              {isTournamentMatch
                ? 'Tournament match starting automatically...'
                : isHost
                ? 'You are the host. You can start the game when ready.'
                : 'Waiting for host to start the game...'}
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            {!isTournamentMatch && isHost && (
              <button
                onClick={handleStartGame}
                disabled={isLeavingGame}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-colors"
              >
                Start Game
              </button>
            )}
            {!isTournamentMatch && (
              <button
                onClick={handleCancelGame}
                disabled={isLeavingGame}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors"
              >
                Leave Game
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (gameStarted && !opponent && !isLeavingGame) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Game Starting...
          </h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4">Setting up the game...</p>
        </div>
      </div>
    )
  }

  if (isLeavingGame) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Leaving game...
          </h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          Waiting for game to start...
        </h1>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
        <p className="text-gray-400 mt-4">
          Please wait while the game is being set up...
        </p>
      </div>
    </div>
  )
}
