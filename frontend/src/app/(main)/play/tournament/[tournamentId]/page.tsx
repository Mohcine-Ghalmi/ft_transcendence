"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { useTournamentInvite } from '../TournamentInviteProvider'
import { PingPongGame } from '../../game/PingPongGame'
import Image from 'next/image'

export default function TournamentGamePage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.tournamentId as string
  const { user } = useAuthStore()
  const { socket } = useTournamentInvite()
  
  const [tournamentData, setTournamentData] = useState<any>(null)
  const [currentMatch, setCurrentMatch] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authorizationChecked, setAuthorizationChecked] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [opponent, setOpponent] = useState<any>(null)
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null)
  
  // Use refs to track the latest state in event handlers
  const gameStartedRef = useRef(gameStarted)
  const isLeavingGameRef = useRef(false)
  
  useEffect(() => {
    gameStartedRef.current = gameStarted
  }, [gameStarted])

  // Join tournament on mount
  useEffect(() => {
    if (!socket || !tournamentId || !user?.email) return

    socket.emit('JoinTournament', { 
      tournamentId, 
      playerEmail: user.email 
    })
    
    // Set a timeout for authorization check
    const authTimeout = setTimeout(() => {
      if (!authorizationChecked) {
        setIsAuthorized(false)
        setAuthorizationChecked(true)
        router.push('/play/tournament')
      }
    }, 5000) // 5 second timeout

    return () => {
      clearTimeout(authTimeout)
    }
  }, [socket, tournamentId, user?.email, authorizationChecked, router])

  useEffect(() => {
    if (!socket || !tournamentId) return

    const handleTournamentJoinResponse = (data: any) => {
      setAuthorizationChecked(true)
      if (data.status === 'success') {
        setIsAuthorized(true)
        setTournamentData(data.tournament)
        setIsHost(data.tournament.hostEmail === user?.email)
        
        // Check if there's a current match for this player
        if (data.currentMatch) {
          setCurrentMatch(data.currentMatch)
          const otherPlayer = data.currentMatch.player1?.email === user?.email ? 
            data.currentMatch.player2 : data.currentMatch.player1
          if (otherPlayer) {
            setOpponent(otherPlayer)
            setWaitingForOpponent(true)
          }
        }
      } else {
        setIsAuthorized(false)
        router.push('/play/tournament')
      }
    }

    const handleTournamentUpdated = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
      }
    }

    const handleTournamentInviteAccepted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        // Show a brief notification that someone joined
        const playerName = data.newParticipant?.nickname || data.inviteeEmail
        setNotification({ message: `${playerName} joined the tournament!`, type: 'success' })
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentReady = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        // Tournament is full and ready to start
        if (data.tournament.hostEmail === user?.email) {
          // Host can start the tournament
          setIsHost(true)
        }
      }
    }

    const handleTournamentStarted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        
        // Check if current user is in the first match
        if (data.firstMatch) {
          const isInFirstMatch = data.firstMatch.player1?.email === user?.email || 
                                data.firstMatch.player2?.email === user?.email
          
          if (isInFirstMatch) {
            setCurrentMatch(data.firstMatch)
            const otherPlayer = data.firstMatch.player1?.email === user?.email ? 
              data.firstMatch.player2 : data.firstMatch.player1
            if (otherPlayer) {
              setOpponent(otherPlayer)
              setWaitingForOpponent(true)
            }
          }
        }
      }
    }

    const handleTournamentMatchStarted = (data: any) => {
      if (data.tournamentId === tournamentId && data.matchId === currentMatch?.id) {
        setWaitingForOpponent(false)
        setGameStarted(true)
      }
    }

    const handleTournamentMatchCompleted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setGameStarted(false)
        setCurrentMatch(null)
        setOpponent(null)
        setWaitingForOpponent(false)
        
        // Update tournament data
        if (data.tournament) {
          setTournamentData(data.tournament)
          
          // Check if there's a next match for this player
          const nextMatch = data.tournament.matches.find((m: any) => 
            (m.player1?.email === user?.email || m.player2?.email === user?.email) && 
            m.state === 'waiting'
          )
          
          if (nextMatch) {
            setCurrentMatch(nextMatch)
            const otherPlayer = nextMatch.player1?.email === user?.email ? 
              nextMatch.player2 : nextMatch.player1
            if (otherPlayer) {
              setOpponent(otherPlayer)
              setWaitingForOpponent(true)
            }
          }
        }
      }
    }

    const handleTournamentRoundAdvanced = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        setNotification({ message: `Round ${data.nextRound} has started!`, type: 'info' })
        setTimeout(() => setNotification(null), 3000)
        
        // Check if current user is in the next round
        const nextMatch = data.tournament.matches.find((m: any) => 
          (m.player1?.email === user?.email || m.player2?.email === user?.email) && 
          m.state === 'waiting'
        )
        
        if (nextMatch) {
          setCurrentMatch(nextMatch)
          const otherPlayer = nextMatch.player1?.email === user?.email ? 
            nextMatch.player2 : nextMatch.player1
          if (otherPlayer) {
            setOpponent(otherPlayer)
            setWaitingForOpponent(true)
          }
        }
      }
    }

    const handleTournamentCompleted = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        setGameStarted(false)
        setCurrentMatch(null)
        setOpponent(null)
        setWaitingForOpponent(false)
        
        const winnerName = data.winner?.nickname || data.winner?.email || 'Unknown'
        setNotification({ message: `Tournament completed! Winner: ${winnerName}`, type: 'success' })
        setTimeout(() => setNotification(null), 5000)
      }
    }

    const handleTournamentParticipantLeft = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        setNotification({ 
          message: `${data.leftPlayer?.nickname || 'A player'} left the tournament.`, 
          type: 'info' 
        })
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleTournamentCanceled = (data: any) => {
      if (data.tournamentId === tournamentId) {
        setTournamentData(data.tournament)
        setNotification({ 
          message: data.reason || 'Tournament was canceled.', 
          type: 'info' 
        })
        setTimeout(() => setNotification(null), 3000)
      }
    }

    const handleRedirectToPlay = (data: any) => {
      setNotification({ 
        message: data.message || 'Redirecting to play page...', 
        type: 'info' 
      })
      setTimeout(() => {
        router.push('/play')
      }, 2000)
    }

    const handleTournamentMatchGameStarted = (data: any) => {
      if (data.tournamentId === tournamentId && data.matchId === currentMatch?.id) {
        setWaitingForOpponent(false)
        setGameStarted(true)
        // Store the game data for the PingPongGame component
        setCurrentMatch({ ...currentMatch, gameId: data.gameId })
      }
    }

    // Add event listeners
    socket.on('TournamentJoinResponse', handleTournamentJoinResponse)
    socket.on('TournamentUpdated', handleTournamentUpdated)
    socket.on('TournamentReady', handleTournamentReady)
    socket.on('TournamentStarted', handleTournamentStarted)
    socket.on('TournamentMatchStarted', handleTournamentMatchStarted)
    socket.on('TournamentMatchCompleted', handleTournamentMatchCompleted)
    socket.on('TournamentRoundAdvanced', handleTournamentRoundAdvanced)
    socket.on('TournamentCompleted', handleTournamentCompleted)
    socket.on('TournamentParticipantLeft', handleTournamentParticipantLeft)
    socket.on('TournamentInviteAccepted', handleTournamentInviteAccepted)
    socket.on('TournamentCanceled', handleTournamentCanceled)
    socket.on('RedirectToPlay', handleRedirectToPlay)
    socket.on('TournamentMatchGameStarted', handleTournamentMatchGameStarted)

    // Cleanup event listeners
    return () => {
      socket.off('TournamentJoinResponse', handleTournamentJoinResponse)
      socket.off('TournamentUpdated', handleTournamentUpdated)
      socket.off('TournamentReady', handleTournamentReady)
      socket.off('TournamentStarted', handleTournamentStarted)
      socket.off('TournamentMatchStarted', handleTournamentMatchStarted)
      socket.off('TournamentMatchCompleted', handleTournamentMatchCompleted)
      socket.off('TournamentRoundAdvanced', handleTournamentRoundAdvanced)
      socket.off('TournamentCompleted', handleTournamentCompleted)
      socket.off('TournamentParticipantLeft', handleTournamentParticipantLeft)
      socket.off('TournamentInviteAccepted', handleTournamentInviteAccepted)
      socket.off('TournamentCanceled', handleTournamentCanceled)
      socket.off('RedirectToPlay', handleRedirectToPlay)
      socket.off('TournamentMatchGameStarted', handleTournamentMatchGameStarted)
    }
  }, [socket, tournamentId, user?.email, router, currentMatch])

  const handleStartTournament = () => {
    if (!socket || !tournamentId || !isHost) return

    setIsStartingGame(true)
    socket.emit('StartTournament', { tournamentId, hostEmail: user?.email })
  }

  const handleLeaveTournament = () => {
    if (!socket || !tournamentId) return

    isLeavingGameRef.current = true
    socket.emit('LeaveTournament', { tournamentId, playerEmail: user?.email })
    router.push('/play/tournament')
  }

  const handleStartMatch = () => {
    if (socket && currentMatch && user?.email) {
      socket.emit('StartTournamentMatchGame', {
        tournamentId,
        matchId: currentMatch.id,
        playerEmail: user.email
      });
    }
  };

  const handleGameEnd = (winner: any, loser: any) => {
    if (socket && currentMatch && user?.email) {
      // Determine winner and loser emails
      const winnerEmail = winner?.email || winner;
      const loserEmail = loser?.email || loser;
      
      // Report the tournament match result
      socket.emit('TournamentMatchResult', {
        tournamentId,
        matchId: currentMatch.id,
        winnerEmail,
        loserEmail,
        playerEmail: user.email
      });
      
      // Reset game state
      setGameStarted(false);
      setCurrentMatch(null);
      setOpponent(null);
      setWaitingForOpponent(false);
    }
  };

  // Loading state
  if (!authorizationChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1419]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining tournament...</p>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1419]">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">You are not authorized to join this tournament.</p>
          <button
            onClick={() => router.push('/play/tournament')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    )
  }

  // If in game, show the game component
  if (gameStarted && currentMatch && opponent) {
    return (
      <div className="h-full text-white">
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <PingPongGame
              player1={user}
              player2={opponent}
              onExit={(winner) => handleGameEnd(winner, opponent)}
              gameId={currentMatch.gameId}
              socket={socket}
              isHost={currentMatch.player1?.email === user?.email}
              opponent={opponent}
            />
          </div>
        </div>
      </div>
    );
  }

  // Waiting for opponent in current match
  if (waitingForOpponent && currentMatch && opponent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1419] px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">Match Ready!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12">
            {/* Current User */}
            <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
              <div className="w-24 h-24 rounded-full bg-[#2a2f3a] overflow-hidden mx-auto mb-4 border-2 border-blue-500">
                <Image 
                  src={user?.avatar || '/avatar/Default.svg'} 
                  alt={user?.name || 'You'} 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">You</h3>
              <p className="text-blue-400 text-lg">{user?.name || 'Player'}</p>
            </div>
            
            {/* Opponent */}
            <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
              <div className="w-24 h-24 rounded-full bg-[#2a2f3a] overflow-hidden mx-auto mb-4 border-2 border-green-500">
                <Image 
                  src={opponent?.avatar || '/avatar/Default.svg'} 
                  alt={opponent?.nickname || 'Opponent'} 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Opponent</h3>
              <p className="text-green-400 text-lg">{opponent?.nickname || opponent?.login || 'Waiting...'}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-xl text-green-400 mb-4">🎮 Match ready!</p>
            <p className="text-gray-300">
              Waiting for both players to be ready...
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleLeaveTournament}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Leave Tournament
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Tournament lobby or bracket view
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-7xl text-center">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            {tournamentData?.name || 'Tournament'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
              tournamentData?.status === 'lobby' ? 'bg-yellow-600/70' :
              tournamentData?.status === 'in_progress' ? 'bg-green-600/70' :
              'bg-gray-600/70'
            }`}>
              {tournamentData?.status === 'lobby' ? 'Waiting for Players' :
               tournamentData?.status === 'in_progress' ? 'In Progress' :
               'Completed'}
            </span>
            <button
              onClick={handleLeaveTournament}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Leave Tournament
            </button>
          </div>
        </div>

        {/* Tournament Status */}
        {tournamentData?.status === 'lobby' && (
          <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Tournament Lobby</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {tournamentData.participants.map((participant: any, index: number) => (
                <div key={participant.email} className="bg-[#2a2f3a] rounded-lg p-4 border border-gray-600">
                  <div className="w-16 h-16 rounded-full bg-[#3a3f4a] overflow-hidden mx-auto mb-3 border-2 border-green-500">
                    <Image 
                      src={participant.avatar} 
                      alt={participant.nickname} 
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white text-center font-medium truncate">{participant.nickname}</p>
                  {participant.isHost && (
                    <p className="text-blue-400 text-xs text-center">Host</p>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: tournamentData.size - tournamentData.participants.length }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-[#2a2f3a] rounded-lg p-4 border border-gray-600 border-dashed flex items-center justify-center">
                  <p className="text-gray-400 text-center">Waiting...</p>
                </div>
              ))}
            </div>
            
            {isHost && tournamentData.participants.length === tournamentData.size && (
              <div className="text-center">
                <button
                  onClick={handleStartTournament}
                  disabled={isStartingGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isStartingGame ? 'Starting Tournament...' : 'Start Tournament'}
                </button>
              </div>
            )}
            
            {!isHost && tournamentData.participants.length === tournamentData.size && (
              <p className="text-center text-gray-300">
                Waiting for host to start the tournament...
              </p>
            )}
            
            {tournamentData.participants.length < tournamentData.size && (
              <p className="text-center text-yellow-400">
                Waiting for {tournamentData.size - tournamentData.participants.length} more players...
              </p>
            )}
          </div>
        )}

        {/* Tournament Bracket */}
        {tournamentData?.status === 'in_progress' && tournamentData.matches && (
          <div className="bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-2xl font-semibold text-white mb-6">Tournament Bracket</h2>
            <div className="overflow-x-auto">
              <div className="flex space-x-8 min-w-max">
                {Array.from({ length: Math.log2(tournamentData.size) }).map((_, roundIndex) => (
                  <div key={roundIndex} className="flex flex-col space-y-4">
                    <h3 className="text-white font-medium text-center">Round {roundIndex + 1}</h3>
                    {tournamentData.matches
                      .filter((match: any) => match.round === roundIndex)
                      .map((match: any, matchIndex: number) => (
                        <div key={match.id} className="bg-[#2a2f3a] rounded-lg p-3 border border-gray-600 min-w-[200px]">
                          <div className="space-y-2">
                            <div className={`p-2 rounded ${match.player1 ? 'bg-[#3a3f4a]' : 'bg-gray-700'}`}>
                              <p className="text-white text-sm truncate">
                                {match.player1?.nickname || 'TBD'}
                              </p>
                            </div>
                            <div className={`p-2 rounded ${match.player2 ? 'bg-[#3a3f4a]' : 'bg-gray-700'}`}>
                              <p className="text-white text-sm truncate">
                                {match.player2?.nickname || 'TBD'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <span className={`text-xs px-2 py-1 rounded ${
                              match.state === 'waiting' ? 'bg-yellow-600/70 text-yellow-200' :
                              match.state === 'in_progress' ? 'bg-blue-600/70 text-blue-200' :
                              match.state === 'completed' ? 'bg-green-600/70 text-green-200' :
                              'bg-gray-600/70 text-gray-200'
                            }`}>
                              {match.state === 'waiting' ? 'Waiting' :
                               match.state === 'in_progress' ? 'Playing' :
                               match.state === 'completed' ? 'Completed' :
                               'Bye'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tournament Complete */}
        {tournamentData?.status === 'completed' && (
          <div className="rounded-lg p-6 border border-gray-700/50 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Tournament Complete!</h2>
            <p className="text-gray-300 mb-6">The tournament has finished.</p>
            <button
              onClick={() => router.push('/play/tournament')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Tournaments
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 