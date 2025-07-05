'use client'

import { useState, useEffect } from 'react'
import { MATCH_STATES } from '../../../../data/mockData'

export function MobileBracket({
  rounds,
  currentRound,
  getMatch,
  getMatchStateStyle,
  participants,
  getPlayerStyle,
  getPlayerBgStyle,
  onPlayMatch,
  tournamentSize,
}) {
  const getPlayerDisplayName = (player) => {
    if (!player) return 'TBD'
    if (player.nickname) return player.nickname
    return player.name || 'Unknown'
  }

  return (
    <div className="flex flex-col items-center mt-4 p-2 bg-gray-800/80 rounded-lg border border-gray-700 w-full">
      <h3 className="text-white text-xl mb-3 text-center">
        Tournament Bracket
      </h3>
      <div className="text-white text-sm mb-2">
        Current Round: {currentRound + 1}
      </div>

      {/* Mobile vertical bracket */}
      <div className="flex flex-col w-full space-y-4">
        {Array.from({ length: rounds }).map((_, roundIndex) => {
          const matchesInRound = tournamentSize / Math.pow(2, roundIndex + 1)

          return (
            <div key={`round-${roundIndex}`} className="w-full">
              <div className="text-indigo-300 text-sm font-medium mb-2 pl-1">
                {roundIndex === rounds - 1
                  ? 'Final'
                  : roundIndex === rounds - 2
                  ? 'Semi Finals'
                  : `Round ${roundIndex + 1}`}
              </div>

              <div className="flex flex-col space-y-3">
                {Array.from({ length: matchesInRound }).map((_, matchIndex) => {
                  const match = getMatch(roundIndex, matchIndex)
                  const matchStateClass = match
                    ? getMatchStateStyle(match.state)
                    : 'border-green-400/50 bg-gray-700/50'
                  const isCurrentRound = roundIndex === currentRound

                  // Get players for this match
                  let player1, player2

                  if (roundIndex === 0) {
                    // First round pulls directly from participants
                    const player1Index = matchIndex * 2
                    const player2Index = player1Index + 1
                    player1 =
                      player1Index < participants.length
                        ? participants[player1Index]
                        : null
                    player2 =
                      player2Index < participants.length
                        ? participants[player2Index]
                        : null
                  } else {
                    // Look for winners from previous round
                    const prevRound = roundIndex - 1
                    const prevMatchIndex1 = matchIndex * 2
                    const prevMatchIndex2 = prevMatchIndex1 + 1

                    const prevMatch1 = getMatch(prevRound, prevMatchIndex1)
                    const prevMatch2 = getMatch(prevRound, prevMatchIndex2)

                    if (
                      prevMatch1 &&
                      prevMatch1.state === MATCH_STATES.PLAYER1_WIN
                    ) {
                      player1 = prevMatch1.player1
                    } else if (
                      prevMatch1 &&
                      prevMatch1.state === MATCH_STATES.PLAYER2_WIN
                    ) {
                      player1 = prevMatch1.player2
                    }

                    if (
                      prevMatch2 &&
                      prevMatch2.state === MATCH_STATES.PLAYER1_WIN
                    ) {
                      player2 = prevMatch2.player1
                    } else if (
                      prevMatch2 &&
                      prevMatch2.state === MATCH_STATES.PLAYER2_WIN
                    ) {
                      player2 = prevMatch2.player2
                    }
                  }

                  const player1Style = match
                    ? getPlayerStyle(match, true)
                    : 'text-gray-300'
                  const player2Style = match
                    ? getPlayerStyle(match, false)
                    : 'text-gray-300'

                  const player1BgStyle = match
                    ? getPlayerBgStyle(match, true)
                    : ''
                  const player2BgStyle = match
                    ? getPlayerBgStyle(match, false)
                    : ''

                  const player1BorderColor = player1BgStyle.includes('bg-')
                    ? player1BgStyle.replace('bg-', 'border-')
                    : 'border-green-400/50'

                  const player2BorderColor = player2BgStyle.includes('bg-')
                    ? player2BgStyle.replace('bg-', 'border-')
                    : 'border-green-400/50'

                  return (
                    <div
                      key={`match-${roundIndex}-${matchIndex}`}
                      className={`flex flex-col ${matchStateClass} rounded overflow-hidden ${
                        isCurrentRound
                          ? 'hover:brightness-110 transition-all cursor-pointer'
                          : ''
                      }`}
                      onClick={() =>
                        isCurrentRound &&
                        match.player1 &&
                        match.player2 &&
                        onPlayMatch &&
                        onPlayMatch(match)
                      }
                    >
                      {/* Match header */}
                      <div className="bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700">
                        Match {matchIndex + 1}
                      </div>

                      {/* Players container */}
                      <div className="flex flex-col">
                        <div
                          className={`py-2 px-3 border-b ${player1BorderColor} ${player1BgStyle}`}
                        >
                          <div
                            className={`text-sm font-medium truncate ${player1Style}`}
                          >
                            {getPlayerDisplayName(player1)}
                          </div>
                        </div>
                        <div className="h-px bg-gray-600 w-full"></div>
                        <div
                          className={`py-2 px-3 ${player2BorderColor} ${player2BgStyle}`}
                        >
                          <div
                            className={`text-sm font-medium truncate ${player2Style}`}
                          >
                            {getPlayerDisplayName(player2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend for bracket */}
      <div className="flex flex-wrap items-center justify-center mt-4 text-xs space-x-2 space-y-1">
        <div className="flex items-center mt-1">
          <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
          <span className="text-gray-300">Waiting</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
          <span className="text-yellow-300">In Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
          <span className="text-green-300">Winner</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
          <span className="text-red-300">Eliminated</span>
        </div>
      </div>

      <div className="text-gray-400 text-xs mt-2">
        Click on a match to simulate the game
      </div>
    </div>
  )
}

export function DesktopBracket({
  currentRound,
  bracketHeight,
  rounds,
  roundWidth,
  tournamentSize,
  participants,
  getMatch,
  getMatchStateStyle,
  getPlayerStyle,
  getPlayerBgStyle,
  onPlayMatch,
  matchHeight,
}) {
  const getPlayerDisplayName = (player) => {
    if (!player) return 'TBD'
    if (player.nickname) return player.nickname
    return player.name || 'Unknown'
  }

  // Increase match height for better visibility
  const adjustedMatchHeight = matchHeight * 1.5

  return (
    <div className="flex flex-col items-center mt-4 p-4 overflow-x-auto w-full">
      <h3 className="text-white text-xl md:text-2xl mb-3 text-center">
        Tournament Bracket
      </h3>

      <div
        className="relative min-w-full"
        style={{
          height: `${bracketHeight * 1.5}px`,
          minWidth: `${(rounds * 2 + 1) * roundWidth}px`,
        }}
      >
        {/* Left side of the bracket */}
        {Array.from({ length: rounds }).map((_, roundIndex) => {
          const matchesInRound = tournamentSize / Math.pow(2, roundIndex + 1)

          return (
            <div
              key={`left-${roundIndex}`}
              className="absolute top-0 bottom-0 flex flex-col justify-around"
              style={{
                left: `${roundIndex * roundWidth}px`,
                width: `${roundWidth - 20}px`,
              }}
            >
              {Array.from({ length: matchesInRound / 2 }).map(
                (_, matchIndex) => {
                  const actualMatchIndex = matchIndex
                  const match = getMatch(roundIndex, actualMatchIndex)

                  const matchStateClass = match
                    ? getMatchStateStyle(match.state)
                    : 'border-indigo-400/50 bg-gray-700/50'
                  const isCurrentRound = roundIndex === currentRound

                  // Get players for this match
                  let player1, player2

                  if (roundIndex === 0) {
                    // First round pulls directly from participants
                    const player1Index = matchIndex * 2
                    const player2Index = player1Index + 1
                    player1 =
                      player1Index < participants.length
                        ? participants[player1Index]
                        : null
                    player2 =
                      player2Index < participants.length
                        ? participants[player2Index]
                        : null
                  } else {
                    // Look for winners from previous round
                    const prevRound = roundIndex - 1
                    const prevMatchIndex1 = matchIndex * 2
                    const prevMatchIndex2 = prevMatchIndex1 + 1

                    const prevMatch1 = getMatch(prevRound, prevMatchIndex1)
                    const prevMatch2 = getMatch(prevRound, prevMatchIndex2)

                    if (
                      prevMatch1 &&
                      prevMatch1.state === MATCH_STATES.PLAYER1_WIN
                    ) {
                      player1 = prevMatch1.player1
                    } else if (
                      prevMatch1 &&
                      prevMatch1.state === MATCH_STATES.PLAYER2_WIN
                    ) {
                      player1 = prevMatch1.player2
                    }

                    if (
                      prevMatch2 &&
                      prevMatch2.state === MATCH_STATES.PLAYER1_WIN
                    ) {
                      player2 = prevMatch2.player1
                    } else if (
                      prevMatch2 &&
                      prevMatch2.state === MATCH_STATES.PLAYER2_WIN
                    ) {
                      player2 = prevMatch2.player2
                    }
                  }

                  player1 = match && match.player1 ? match.player1 : player1
                  player2 = match && match.player2 ? match.player2 : player2

                  const player1Style = match
                    ? getPlayerStyle(match, true)
                    : 'text-gray-300'
                  const player2Style = match
                    ? getPlayerStyle(match, false)
                    : 'text-gray-300'

                  const player1BgStyle = match
                    ? getPlayerBgStyle(match, true)
                    : ''
                  const player2BgStyle = match
                    ? getPlayerBgStyle(match, false)
                    : ''

                  const player1BorderColor = player1BgStyle.includes('bg-')
                    ? player1BgStyle.replace('bg-', 'border-')
                    : 'border-indigo-400/50'

                  const player2BorderColor = player2BgStyle.includes('bg-')
                    ? player2BgStyle.replace('bg-', 'border-')
                    : 'border-indigo-400/50'

                  return (
                    <div
                      key={matchIndex}
                      className={`${matchStateClass} mb-6 rounded-lg shadow-lg overflow-hidden ${
                        isCurrentRound
                          ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform'
                          : ''
                      }`}
                      onClick={() =>
                        isCurrentRound &&
                        match.player1 &&
                        match.player2 &&
                        onPlayMatch &&
                        onPlayMatch(match)
                      }
                    >
                      {/* Match header */}
                      <div className="bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700">
                        Match {matchIndex + 1}
                      </div>

                      <div
                        className={`p-2 ${player1BgStyle} border-b border-gray-600`}
                        style={{ minHeight: `${adjustedMatchHeight / 2}px` }}
                      >
                        <div
                          className={`text-sm md:text-base truncate ${player1Style} font-medium`}
                        >
                          {getPlayerDisplayName(player1)}
                        </div>
                      </div>
                      <div
                        className={`p-2 ${player2BgStyle}`}
                        style={{ minHeight: `${adjustedMatchHeight / 2}px` }}
                      >
                        <div
                          className={`text-sm md:text-base truncate ${player2Style} font-medium`}
                        >
                          {getPlayerDisplayName(player2)}
                        </div>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          )
        })}

        {/* Center/Final */}
        <div
          className="absolute top-0 bottom-0 flex flex-col justify-center"
          style={{ left: `${rounds * roundWidth}px`, width: `${roundWidth}px` }}
        >
          {/* Final match */}
          {(() => {
            const finalMatch = getMatch(rounds - 1, 0)
            const isFinalCurrentRound = currentRound === rounds - 1

            return (
              <div
                className={`shadow-lg ${
                  finalMatch
                    ? getMatchStateStyle(finalMatch.state)
                    : 'border-yellow-400'
                } rounded-lg mx-1 overflow-hidden flex flex-col ${
                  isFinalCurrentRound
                    ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform'
                    : ''
                }`}
                onClick={() =>
                  isFinalCurrentRound &&
                  finalMatch &&
                  finalMatch.player1 &&
                  finalMatch.player2 &&
                  onPlayMatch &&
                  onPlayMatch(finalMatch)
                }
              >
                <div className="text-yellow-400 text-sm md:text-lg text-center font-bold bg-black p-2 border-b border-yellow-500/50">
                  FINAL
                </div>

                {/* Final Players */}
                {(() => {
                  const player1 = finalMatch?.player1
                  const player2 = finalMatch?.player2

                  const player1Style = finalMatch
                    ? getPlayerStyle(finalMatch, true)
                    : 'text-gray-300'
                  const player2Style = finalMatch
                    ? getPlayerStyle(finalMatch, false)
                    : 'text-gray-300'

                  const player1BgStyle = finalMatch
                    ? getPlayerBgStyle(finalMatch, true)
                    : ''
                  const player2BgStyle = finalMatch
                    ? getPlayerBgStyle(finalMatch, false)
                    : ''

                  return (
                    <>
                      <div
                        className={`p-3 ${player1BgStyle} border-b border-gray-600`}
                        style={{ minHeight: `${adjustedMatchHeight / 2}px` }}
                      >
                        <div
                          className={`text-sm md:text-base text-center font-medium ${player1Style}`}
                        >
                          {getPlayerDisplayName(player1)}
                        </div>
                      </div>
                      <div
                        className={`p-3 ${player2BgStyle}`}
                        style={{ minHeight: `${adjustedMatchHeight / 2}px` }}
                      >
                        <div
                          className={`text-sm md:text-base text-center font-medium ${player2Style}`}
                        >
                          {getPlayerDisplayName(player2)}
                        </div>
                      </div>
                    </>
                  )
                })()}

                {/* Champion */}
                {finalMatch &&
                  (finalMatch.state === MATCH_STATES.PLAYER1_WIN ||
                    finalMatch.state === MATCH_STATES.PLAYER2_WIN) && (
                    <div className="text-green-300 text-xs md:text-base border-t border-green-500/50 font-bold text-center p-2 bg-green-900/30">
                      Champion:{' '}
                      {finalMatch.state === MATCH_STATES.PLAYER1_WIN
                        ? getPlayerDisplayName(finalMatch.player1)
                        : getPlayerDisplayName(finalMatch.player2)}
                    </div>
                  )}
              </div>
            )
          })()}
        </div>

        {/* Right side of the bracket */}
        {Array.from({ length: rounds }).map((_, roundIndex) => {
          const matchesInRound = tournamentSize / Math.pow(2, roundIndex + 1)

          return (
            <div
              key={`right-${roundIndex}`}
              className="absolute top-0 bottom-0 flex flex-col justify-around"
              style={{
                left: `${rounds * 2 * roundWidth - roundIndex * roundWidth}px`,
                width: `${roundWidth - 20}px`,
              }}
            >
              {Array.from({ length: matchesInRound / 2 }).map(
                (_, matchIndex) => {
                  // For the right side, we need to shift the matchIndex to the second half of matches in this round
                  const actualMatchIndex = matchIndex + matchesInRound / 2
                  const match = getMatch(roundIndex, actualMatchIndex)

                  const matchStateClass = match
                    ? getMatchStateStyle(match.state)
                    : 'border-indigo-400/50 bg-gray-700/50'
                  const isCurrentRound = roundIndex === currentRound

                  // Get players for this match
                  let player1, player2

                  if (roundIndex === 0) {
                    // First round pulls directly from participants
                    const halfPoint = participants.length / 2
                    const player1Index = halfPoint + matchIndex * 2
                    const player2Index = player1Index + 1
                    player1 =
                      player1Index < participants.length
                        ? participants[player1Index]
                        : null
                    player2 =
                      player2Index < participants.length
                        ? participants[player2Index]
                        : null
                  } else {
                    // Look for winners from previous round (right side)
                    const prevRound = roundIndex - 1
                    const prevMatchesPerHalf = matchesInRound
                    const prevMatchIndex1 =
                      prevMatchesPerHalf / 2 + matchIndex * 2
                    const prevMatchIndex2 = prevMatchIndex1 + 1

                    const prevMatch1 = getMatch(prevRound, prevMatchIndex1)
                    const prevMatch2 = getMatch(prevRound, prevMatchIndex2)

                    if (
                      prevMatch1 &&
                      prevMatch1.state === MATCH_STATES.PLAYER1_WIN
                    ) {
                      player1 = prevMatch1.player1
                    } else if (
                      prevMatch1 &&
                      prevMatch1.state === MATCH_STATES.PLAYER2_WIN
                    ) {
                      player1 = prevMatch1.player2
                    }

                    if (
                      prevMatch2 &&
                      prevMatch2.state === MATCH_STATES.PLAYER1_WIN
                    ) {
                      player2 = prevMatch2.player1
                    } else if (
                      prevMatch2 &&
                      prevMatch2.state === MATCH_STATES.PLAYER2_WIN
                    ) {
                      player2 = prevMatch2.player2
                    }
                  }

                  // Use match players if available
                  player1 = match && match.player1 ? match.player1 : player1
                  player2 = match && match.player2 ? match.player2 : player2

                  const player1Style = match
                    ? getPlayerStyle(match, true)
                    : 'text-gray-300'
                  const player2Style = match
                    ? getPlayerStyle(match, false)
                    : 'text-gray-300'

                  const player1BgStyle = match
                    ? getPlayerBgStyle(match, true)
                    : ''
                  const player2BgStyle = match
                    ? getPlayerBgStyle(match, false)
                    : ''

                  const player1BorderColor = player1BgStyle.includes('bg-')
                    ? player1BgStyle.replace('bg-', 'border-')
                    : 'border-indigo-400/50'

                  const player2BorderColor = player2BgStyle.includes('bg-')
                    ? player2BgStyle.replace('bg-', 'border-')
                    : 'border-indigo-400/50'

                  return (
                    <div
                      key={matchIndex}
                      className={`${matchStateClass} mb-6 rounded-lg shadow-lg overflow-hidden ${
                        isCurrentRound
                          ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform'
                          : ''
                      }`}
                      onClick={() =>
                        isCurrentRound &&
                        match.player1 &&
                        match.player2 &&
                        onPlayMatch &&
                        onPlayMatch(match)
                      }
                    >
                      {/* Match header */}
                      <div className="bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700">
                        Match {actualMatchIndex + 1}
                      </div>

                      <div
                        className={`p-2 ${player1BgStyle} border-b border-gray-600`}
                        style={{ minHeight: `${adjustedMatchHeight / 2}px` }}
                      >
                        <div
                          className={`text-sm md:text-base truncate ${player1Style} font-medium`}
                        >
                          {getPlayerDisplayName(player1)}
                        </div>
                      </div>
                      <div
                        className={`p-2 ${player2BgStyle}`}
                        style={{ minHeight: `${adjustedMatchHeight / 2}px` }}
                      >
                        <div
                          className={`text-sm md:text-base truncate ${player2Style} font-medium`}
                        >
                          {getPlayerDisplayName(player2)}
                        </div>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          )
        })}
      </div>

      {/* Legend for bracket */}
      <div className="flex flex-wrap items-center justify-center mt-6 text-xs md:text-sm space-x-4 space-y-2 md:space-y-0">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-400 mr-2"></div>
          <span className="text-gray-300">Waiting</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
          <span className="text-yellow-300">In Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-400 mr-2"></div>
          <span className="text-green-300">Winner</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-400 mr-2"></div>
          <span className="text-red-300">Eliminated</span>
        </div>
      </div>

      <div className="text-gray-400 text-sm mt-3">
        Click on a match to simulate the game
      </div>
    </div>
  )
}

const TournamentBracket = ({
  participants,
  tournamentSize,
  matches,
  currentRound,
  onMatchUpdate,
  onPlayMatch = null, // <-- this prop is passed from LocalTournament
}) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [isTablet, setIsTablet] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth >= 768 && window.innerWidth < 1024
      : false
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const validTournamentSize = (() => {
    let size = 2
    while (size < participants.length) {
      size *= 2
    }
    return size
  })()

  const rounds = Math.log2(tournamentSize)

  const getSpacing = () => {
    if (windowWidth < 640)
      return { roundWidth: 80, matchHeight: 30, bracketHeight: rounds * 80 }
    if (windowWidth < 768)
      return { roundWidth: 90, matchHeight: 32, bracketHeight: rounds * 90 }
    if (windowWidth < 1024)
      return { roundWidth: 100, matchHeight: 35, bracketHeight: rounds * 100 }
    return { roundWidth: 120, matchHeight: 40, bracketHeight: rounds * 120 }
  }
  const { roundWidth, matchHeight, bracketHeight } = getSpacing()

  const getMatchStateStyle = (matchState) => {
    switch (matchState) {
      case MATCH_STATES.IN_PROGRESS:
        return 'border-yellow-400 bg-yellow-900/30'
      case MATCH_STATES.PLAYER1_WIN:
        return 'border-green-400 bg-green-900/30'
      case MATCH_STATES.PLAYER2_WIN:
        return 'border-green-400 bg-green-900/30'
      case MATCH_STATES.WAITING:
        return 'border-indigo-400/50 bg-gray-700/50'
      default:
        return 'border-indigo-400/50 bg-gray-700/50'
    }
  }

  const getPlayerStyle = (match, isPlayer1) => {
    if (!match || !match.state) return 'text-gray-300'

    const won =
      (match.state === MATCH_STATES.PLAYER1_WIN && isPlayer1) ||
      (match.state === MATCH_STATES.PLAYER2_WIN && !isPlayer1)

    const lost =
      (match.state === MATCH_STATES.PLAYER1_WIN && !isPlayer1) ||
      (match.state === MATCH_STATES.PLAYER2_WIN && isPlayer1)

    if (won) return 'text-green-400 font-bold'
    if (lost) return 'text-red-400 line-through'

    if (match.state === MATCH_STATES.IN_PROGRESS)
      return 'text-yellow-300 italic'
    return 'text-gray-300'
  }

  const getPlayerBgStyle = (match, isPlayer1) => {
    if (!match || !match.state) return ''

    const won =
      (match.state === MATCH_STATES.PLAYER1_WIN && isPlayer1) ||
      (match.state === MATCH_STATES.PLAYER2_WIN && !isPlayer1)

    const lost =
      (match.state === MATCH_STATES.PLAYER1_WIN && !isPlayer1) ||
      (match.state === MATCH_STATES.PLAYER2_WIN && isPlayer1)

    if (won) return 'bg-green-900/30'
    if (lost) return 'bg-red-900/30 border-red-400'

    if (match.state === MATCH_STATES.IN_PROGRESS)
      return 'bg-yellow-900/30 animate-pulse'
    return 'bg-gray-700/30'
  }

  const getMatchStatusText = (match) => {
    if (!match) return 'TBD'
    
    switch (match.state) {
      case MATCH_STATES.WAITING:
        return 'Waiting'
      case MATCH_STATES.IN_PROGRESS:
        return 'Playing'
      case MATCH_STATES.PLAYER1_WIN:
        return 'Completed'
      case MATCH_STATES.PLAYER2_WIN:
        return 'Completed'
      default:
        return 'TBD'
    }
  }

  const getMatchStatusColor = (match) => {
    if (!match) return 'bg-gray-600/70 text-gray-200'
    
    switch (match.state) {
      case MATCH_STATES.WAITING:
        return 'bg-yellow-600/70 text-yellow-200'
      case MATCH_STATES.IN_PROGRESS:
        return 'bg-blue-600/70 text-blue-200'
      case MATCH_STATES.PLAYER1_WIN:
      case MATCH_STATES.PLAYER2_WIN:
        return 'bg-green-600/70 text-green-200'
      default:
        return 'bg-gray-600/70 text-gray-200'
    }
  }

  const getMatch = (roundIndex, matchIndex) => {
    return matches.find(
      (m) => m.round === roundIndex && m.matchIndex === matchIndex
    )
  }

  // Remove simulateMatch and related logic.
  // Instead, use onPlayMatch(match) for current round matches.

  if (isMobile) {
    return (
      <MobileBracket
        rounds={rounds}
        currentRound={currentRound}
        getMatch={getMatch}
        getMatchStateStyle={getMatchStateStyle}
        participants={participants}
        getPlayerStyle={getPlayerStyle}
        getPlayerBgStyle={getPlayerBgStyle}
        onPlayMatch={onPlayMatch}
        tournamentSize={validTournamentSize}
      />
    )
  }

  return (
    <DesktopBracket
      currentRound={currentRound}
      bracketHeight={bracketHeight}
      rounds={rounds}
      roundWidth={roundWidth}
      tournamentSize={validTournamentSize}
      participants={participants}
      getMatch={getMatch}
      getMatchStateStyle={getMatchStateStyle}
      getPlayerStyle={getPlayerStyle}
      getPlayerBgStyle={getPlayerBgStyle}
      onPlayMatch={onPlayMatch}
      matchHeight={matchHeight}
    />
  )
}

export default TournamentBracket
