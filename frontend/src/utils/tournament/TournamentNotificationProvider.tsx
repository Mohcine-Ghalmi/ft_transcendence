'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { getSocketInstance } from '@/(zustand)/useAuthStore'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { useRouter } from 'next/navigation'

interface TournamentNotification {
  id: string
  type:
    | 'tournament_started'
    | 'match_starting'
    | 'bracket_ready'
    | 'tournament_info'
    | 'match_timeout'
  title: string
  message: string
  countdown?: number
  tournamentId?: string
  matchId?: string
  showBracketLink?: boolean
  showJoinButton?: boolean
  autoClose?: boolean
  duration?: number
  autoRedirect?: boolean
  redirectTo?: string
  onJoin?: () => void
  onIgnore?: () => void
  onTimeout?: () => void
  isActiveSession?: boolean
}

interface TournamentNotificationContextType {
  notifications: TournamentNotification[]
  addNotification: (notification: Omit<TournamentNotification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const TournamentNotificationContext = createContext<
  TournamentNotificationContextType | undefined
>(undefined)

export const useTournamentNotifications = () => {
  const context = useContext(TournamentNotificationContext)
  if (!context) {
    throw new Error(
      'useTournamentNotifications must be used within a TournamentNotificationProvider'
    )
  }
  return context
}

const GlobalTournamentNotification = ({
  notification,
  onClose,
}: {
  notification: TournamentNotification
  onClose: () => void
}) => {
  const [countdown, setCountdown] = useState<number | null>(
    notification.countdown || null
  )
  const router = useRouter()
  const { user } = useAuthStore()
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    const socketInstance = getSocketInstance()
    if (socketInstance) {
      setSocket(socketInstance)
    }
  }, [])

  useEffect(() => {
    if (notification.countdown && notification.countdown > 0) {
      setCountdown(notification.countdown)

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)

            setTimeout(() => {
              if (notification.type === 'match_starting') {
                onClose()
              }
            }, 0)

            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [
    notification.countdown,
    notification.type,
    notification.tournamentId,
    notification.matchId,
    notification.onTimeout,
    notification.autoRedirect,
    notification.redirectTo,
    router,
    socket,
    user?.email,
    onClose,
    notification,
  ])

  const getIcon = () => {
    switch (notification.type) {
      case 'tournament_started':
        return '🏆'
      case 'match_starting':
        return '⚡'
      case 'bracket_ready':
        return '📋'
      case 'match_timeout':
        return '⏰'
      default:
        return '🎮'
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'tournament_started':
        return 'bg-green-600/90'
      case 'match_starting':
        return 'bg-yellow-600/90'
      case 'bracket_ready':
        return 'bg-blue-600/90'
      case 'match_timeout':
        return 'bg-red-600/90'
      default:
        return 'bg-gray-600/90'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <div
            className={`w-16 h-16 rounded-full ${getBackgroundColor()} flex items-center justify-center mx-auto mb-4`}
          >
            <span className="text-white text-2xl">{getIcon()}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {notification.title}
          </h2>
          <p className="text-gray-300 mb-4">{notification.message}</p>

          {countdown !== null && countdown !== undefined && countdown > 0 && (
            <div className="mb-4">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {countdown}
              </div>
              <p className="text-gray-300">seconds remaining...</p>
            </div>
          )}

          {notification.showBracketLink && notification.tournamentId && (
            <div className="mb-4">
              <button
                onClick={onClose}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-3"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const TournamentNotificationProvider = () => {
  const [notifications, setNotifications] = useState<TournamentNotification[]>(
    []
  )
  const [socket, setSocket] = useState<any>(null)
  const [activeSessionConflicts, setActiveSessionConflicts] = useState(
    new Set<string>()
  )
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const socketInstance = getSocketInstance()
    if (socketInstance) {
      setSocket(socketInstance)
    }
  }, [])

  const addNotification = (
    notification: Omit<TournamentNotification, 'id'>
  ) => {
    if (
      notification.tournamentId &&
      activeSessionConflicts.has(notification.tournamentId)
    ) {
      return
    }

    const id = Date.now().toString() + Math.random().toString(36)
    setNotifications((prev) => [
      ...prev,
      { ...notification, id, isActiveSession: true },
    ])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  useEffect(() => {
    if (!socket || !user?.email) return

    const handleTournamentStarted = (data: any) => {
      addNotification({
        type: 'tournament_started',
        title: 'Tournament Started!',
        message: `Tournament "${data.tournamentName}" has begun! You can view the bracket and join when your match starts.`,
        tournamentId: data.tournamentId,
        showBracketLink: true,
        autoClose: false,
      })
    }

    const handleMatchStartingSoon = (data: any) => {
      if (data.playerEmail === user?.email) {
        addNotification({
          type: 'match_starting',
          title: 'Your Match is Starting!',
          message: `Your tournament match will begin in 10 seconds. Get ready!`,
          countdown: 10,
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          showJoinButton: true,
          autoClose: false,
          autoRedirect: true,
          redirectTo: `/play/game/${data.matchId}`,
          onTimeout: () => {
            router.push(`/play/game/${data.matchId}`)
          },
        })
      }
    }

    const handleTournamentSessionConflict = (data: any) => {
      if (data.tournamentId) {
        setActiveSessionConflicts(
          (prev) => new Set([...prev, data.tournamentId])
        )

        setNotifications((prev) =>
          prev.filter((n) => n.tournamentId !== data.tournamentId)
        )
        if (data.type === 'match_starting_elsewhere') {
          addNotification({
            type: 'tournament_info',
            title: 'Match in Another Session',
            message:
              'Your tournament match is starting in another browser/tab.',
            autoClose: true,
            duration: 2000,
            isActiveSession: false,
          })
        } else if (data.type === 'match_started_elsewhere') {
          addNotification({
            type: 'tournament_info',
            title: 'Match Started Elsewhere',
            message:
              'Your tournament match has started in another browser/tab.',
            autoClose: true,
            duration: 2000,
            isActiveSession: false,
          })
        }
      }
    }

    const handleTournamentSessionTakenOver = (data: any) => {
      if (data.tournamentId) {
        setActiveSessionConflicts((prev) => {
          const newSet = new Set(prev)
          newSet.delete(data.tournamentId)
          return newSet
        })

        addNotification({
          type: 'tournament_info',
          title: 'Session Taken Over',
          message:
            'Your tournament session was taken over by another browser/tab.',
          autoClose: true,
          duration: 5000,
        })
      }
    }

    const handleTournamentSessionConflictResolved = (data: any) => {
      if (data.status === 'success' && data.action === 'takeover_completed') {
        clearAllNotifications()
        addNotification({
          type: 'tournament_info',
          title: 'Session Taken Over',
          message: 'Successfully took over tournament session.',
          autoClose: true,
          duration: 3000,
        })
        if (data.tournamentId) {
          setActiveSessionConflicts((prev) => {
            const newSet = new Set(prev)
            newSet.delete(data.tournamentId)
            return newSet
          })
        }
      }
    }

    const handleTournamentBracketReady = (data: any) => {
      addNotification({
        type: 'bracket_ready',
        title: 'Tournament Bracket Ready',
        message:
          'The tournament bracket is now available. Check your match schedule!',
        tournamentId: data.tournamentId,
        showBracketLink: true,
        autoClose: true,
        duration: 5000,
      })
    }

    const handleGlobalTournamentNotification = (data: any) => {
      if (
        data.type === 'match_starting' &&
        data.tournamentId &&
        data.matchId &&
        data.countdown
      ) {
        if (!activeSessionConflicts.has(data.tournamentId)) {
          addNotification({
            type: 'match_starting',
            title: data.title || '⚡ Your Match is Starting!',
            message:
              data.message ||
              `Your match will begin in ${data.countdown} seconds!`,
            countdown: data.countdown,
            tournamentId: data.tournamentId,
            matchId: data.matchId,
            autoClose: true,
            duration: data.countdown * 1000,
            showJoinButton: true,
            autoRedirect: true,
            redirectTo: `/play/game/${data.matchId}`,
            onTimeout: () => {
              router.push(`/play/game/${data.matchId}`)
            },
          })
        } else {
        }
      }
    }

    socket.on('GlobalTournamentStarted', handleTournamentStarted)
    socket.on('GlobalMatchStartingSoon', handleMatchStartingSoon)
    socket.on('GlobalTournamentBracketReady', handleTournamentBracketReady)
    socket.on(
      'GlobalTournamentNotification',
      handleGlobalTournamentNotification
    )
    socket.on('TournamentSessionConflict', handleTournamentSessionConflict)
    socket.on('TournamentSessionTakenOver', handleTournamentSessionTakenOver)
    socket.on(
      'TournamentSessionConflictResolved',
      handleTournamentSessionConflictResolved
    )

    return () => {
      socket.off('GlobalTournamentStarted', handleTournamentStarted)
      socket.off('GlobalMatchStartingSoon', handleMatchStartingSoon)
      socket.off('GlobalTournamentBracketReady', handleTournamentBracketReady)
      socket.off(
        'GlobalTournamentNotification',
        handleGlobalTournamentNotification
      )
      socket.off('TournamentSessionConflict', handleTournamentSessionConflict)
      socket.off('TournamentSessionTakenOver', handleTournamentSessionTakenOver)
      socket.off(
        'TournamentSessionConflictResolved',
        handleTournamentSessionConflictResolved
      )
    }
  }, [socket, user?.email, activeSessionConflicts])

  return (
    <>
      {notifications
        .filter((notification) => notification.isActiveSession !== false)
        .map((notification) => (
          <GlobalTournamentNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
    </>
  )
}

export const TournamentNotificationContextProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [notifications, setNotifications] = useState<TournamentNotification[]>(
    []
  )

  const addNotification = (
    notification: Omit<TournamentNotification, 'id'>
  ) => {
    const id = Date.now().toString() + Math.random().toString(36)
    setNotifications((prev) => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <TournamentNotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </TournamentNotificationContext.Provider>
  )
}
