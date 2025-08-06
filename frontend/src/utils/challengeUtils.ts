import { useRouter } from 'next/navigation'
import CryptoJS from 'crypto-js'
import { toast } from 'react-toastify'

export interface ChallengePlayer {
  email: string
  name?: string
  username?: string
  login?: string
  avatar?: string
}

const pendingInvitations = new Map<string, { gameId: string; timestamp: number }>()
let globalEventHandlersSetup = false
const activeInvitations = new Map<string, {
  gameId: string
  player: ChallengePlayer
  user: any
  router: any
  onStatusChange?: (email: string, status: 'challenging' | 'idle') => void
  inviteKey: string
}>()

export const getInvitedPlayersEmails = (userEmail: string): string[] => {
  const invitedEmails: string[] = []

  for (const [gameId, invitation] of activeInvitations.entries()) {
    if (invitation.user.email === userEmail) {
      invitedEmails.push(invitation.player.email)
    }
  }

  return invitedEmails
}

export const isPlayerInvited = (userEmail: string, playerEmail: string): boolean => {
  const inviteKey = `${userEmail}:${playerEmail}`
  return pendingInvitations.has(inviteKey) ||
         Array.from(activeInvitations.values()).some(
           invitation => invitation.user.email === userEmail &&
                        invitation.player.email === playerEmail
         )
}
const setupGlobalEventHandlers = (socket: any) => {
  if (globalEventHandlersSetup) return

  const handleInviteResponse = (data: any) => {

    for (const [gameId, invitation] of activeInvitations.entries()) {
      if (data.gameId === gameId || data.guestEmail === invitation.player.email) {
        if (data.status === 'success' && data.type === 'invite_sent') {
          if (data.gameId && data.gameId !== gameId) {
            const invitationData = activeInvitations.get(gameId)
            if (invitationData) {
              activeInvitations.delete(gameId)
              activeInvitations.set(data.gameId, {
                ...invitationData,
                gameId: data.gameId
              })
            }
          }
        } else if (data.status === 'error') {
          toast.warning(data.message)

          if (!data.message.includes('already sent an invitation')) {
            cleanupInvitation(gameId)
          }
        }
        break
      }
    }
  }

  const handleGameInviteAccepted = (data: any) => {

    const invitation = activeInvitations.get(data.gameId)
    if (!invitation) {
      return
    }

    if (data.status === 'ready_to_start') {
      const gameState = {
        gameId: data.gameId,
        gameState: 'waiting_to_start',
        gameAccepted: true,
        isHost: true,
        invitedPlayer: {
          ...data.guestData,
          name: data.guestData.username || data.guestData.login,
          login: data.guestData.login,
          avatar: data.guestData.avatar || '/avatar/Default.svg',
          GameStatus: 'Available',
        },
      }

      sessionStorage.setItem('externalGameState', JSON.stringify(gameState))
      cleanupInvitation(data.gameId)
      invitation.router.push('/play/OneVsOne?mode=Online')
    }
  }

  const handleGameInviteDeclined = (data: any) => {

    const invitation = activeInvitations.get(data.gameId)
    if (invitation) {
      const friendName = invitation.player.username || invitation.player.name || invitation.player.email
      toast.error(`${friendName} declined your challenge`)
      cleanupInvitation(data.gameId)
    }
  }

  const handleGameInviteTimeout = (data: any) => {

    const invitation = activeInvitations.get(data.gameId)
    if (invitation) {
      const friendName = invitation.player.username || invitation.player.name || invitation.player.email
      toast.warning(`Challenge to ${friendName} timed out`)
      cleanupInvitation(data.gameId)
    }
  }

  const handleGameInviteCanceled = (data: any) => {

    const invitation = activeInvitations.get(data.gameId)
    if (invitation) {
      toast.info('Game invitation was canceled')
      cleanupInvitation(data.gameId)
    }
  }

  const handleGameInvitationsCleanup = (data: any) => {

    if (data.reason === 'player_accepted_other_invitation') {
      const invitationsToCleanup = Array.from(activeInvitations.keys())

      for (const gameId of invitationsToCleanup) {
        cleanupInvitation(gameId)
      }

      toast.info(data.message || `${data.acceptingPlayer} accepted a game invitation. All pending challenges have been cleared.`)
    }
  }

  const handleGameInviteCleanup = (data: any) => {
    if (data.gameId === 'multiple') {
      const invitationsToCleanup = Array.from(activeInvitations.keys())
      for (const gameId of invitationsToCleanup) {
        cleanupInvitation(gameId)
      }
    } else if (data.gameId) {
      cleanupInvitation(data.gameId)
    }

    switch (data.action) {
      case 'accepted':
        break
      case 'declined':
        break
      case 'canceled':
        toast.info('Invitation was canceled')
        break
      case 'timeout':
        toast.warning('Invitation expired')
        break
      case 'auto_cleanup':
        break
      case 'host_unavailable':
        toast.info(data.message || 'Host is no longer available')
        break
      default:
        if (data.message) {
          toast.info(data.message)
        }
    }
  }

  socket.on('InviteToGameResponse', handleInviteResponse)
  socket.on('GameInviteAccepted', handleGameInviteAccepted)
  socket.on('GameInviteDeclined', handleGameInviteDeclined)
  socket.on('GameInviteTimeout', handleGameInviteTimeout)
  socket.on('GameInviteCanceled', handleGameInviteCanceled)
  socket.on('GameInvitationsCleanup', handleGameInvitationsCleanup)
  socket.on('GameInviteCleanup', handleGameInviteCleanup)

  globalEventHandlersSetup = true
}

const cleanupInvitation = (gameId: string) => {
  const invitation = activeInvitations.get(gameId)
  if (invitation) {
    pendingInvitations.delete(invitation.inviteKey)
    invitation.onStatusChange?.(invitation.player.email, 'idle')
    activeInvitations.delete(gameId)
  }
}
export const cleanupAllUserInvitations = () => {
  const invitationsToCleanup = Array.from(activeInvitations.keys())

  for (const gameId of invitationsToCleanup) {
    cleanupInvitation(gameId)
  }
  pendingInvitations.clear()

}

export const forceClearInvitationCache = () => {
  pendingInvitations.clear()
  activeInvitations.clear()
}

export const validateInvitationStatus = async (socket: any, inviteKey: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false)
    }, 2000)

    const handleValidation = (data: any) => {
      if (data.inviteKey === inviteKey) {
        clearTimeout(timeout)
        socket.off('InvitationValidation', handleValidation)
        resolve(data.isValid)
      }
    }

    socket.on('InvitationValidation', handleValidation)
    socket.emit('ValidateInvitation', { inviteKey })
  })
}

export const challengePlayer = async (
  player: ChallengePlayer,
  socket: any,
  user: any,
  router: any,
  onStatusChange?: (email: string, status: 'challenging' | 'idle') => void
) => {
  if (!socket || !user?.email || !player?.email) {
    return false
  }

  setupGlobalEventHandlers(socket)
  const inviteKey = `${user.email}:${player.email}`
  const existing = pendingInvitations.get(inviteKey)
  if (existing && Date.now() - existing.timestamp < 30000) {
    const isValid = await validateInvitationStatus(socket, inviteKey)
    if (isValid) {
      toast.warning('Invitation already sent to this player. Please wait...')
      return false
    } else {
      pendingInvitations.delete(inviteKey)

      for (const [gameId, invitation] of activeInvitations.entries()) {
        if (invitation.inviteKey === inviteKey) {
          activeInvitations.delete(gameId)
          break
        }
      }
    }
  }

  try {
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    if (!encryptionKey) {
      throw new Error('Encryption key not found')
    }
    const newGameId = crypto.randomUUID()
    pendingInvitations.set(inviteKey, { gameId: newGameId, timestamp: Date.now() })
    activeInvitations.set(newGameId, {
      gameId: newGameId,
      player,
      user,
      router,
      onStatusChange,
      inviteKey
    })

    setTimeout(() => {
      if (activeInvitations.has(newGameId)) {
        const friendName = player.username || player.email
        toast.warning(`Challenge to ${friendName} timed out`)
        cleanupInvitation(newGameId)
      }
    }, 35000)

    const inviteData = {
      myEmail: user.email,
      hisEmail: player.email,
    }

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(inviteData),
      encryptionKey
    ).toString()

    socket.emit('InviteToGame', encrypted)

    return true
  } catch (error) {
    pendingInvitations.delete(inviteKey)
    onStatusChange?.(player.email, 'idle')
    return false
  }
}
export const clearStaleInvitations = () => {
  const now = Date.now()
  for (const [key, data] of pendingInvitations.entries()) {
    if (now - data.timestamp > 60000) {
      pendingInvitations.delete(key)
    }
  }
  for (const [gameId, invitation] of activeInvitations.entries()) {
    const pendingData = pendingInvitations.get(invitation.inviteKey)
    if (!pendingData || now - pendingData.timestamp > 60000) {
      cleanupInvitation(gameId)
    }
  }
}

export const cancelInvitation = (socket: any, gameId: string, hostEmail: string) => {
  if (!socket || !gameId || !hostEmail) return

  socket.emit('CancelGameInvite', {
    gameId,
    hostEmail
  })
  cleanupInvitation(gameId)
}
export const getActiveInvitations = (userEmail: string) => {
  const userInvitations = []
  for (const [gameId, invitation] of activeInvitations.entries()) {
    if (invitation.user.email === userEmail) {
      userInvitations.push({
        gameId,
        playerEmail: invitation.player.email,
        playerName: invitation.player.username || invitation.player.name || invitation.player.email,
        timestamp: pendingInvitations.get(invitation.inviteKey)?.timestamp
      })
    }
  }
  return userInvitations
}

export const cleanupStaleInvitations = (socket: any, userEmail: string) => {
  if (!socket || !userEmail) return

  socket.emit('CleanupStaleInvitations', { userEmail })
  forceClearInvitationCache()
}
export const initializeInvitationSystem = (socket: any, userEmail: string) => {
  if (!socket || !userEmail) return

  setupGlobalEventHandlers(socket)
  setupGameStateCleanup(socket)
  cleanupStaleInvitations(socket, userEmail)
  const cleanupInterval = setInterval(() => {
    clearStaleInvitations()
  }, 30000)

  return () => {
    clearInterval(cleanupInterval)
    forceClearInvitationCache()
  }
}
export const cleanupAllInvitations = (userEmail: string) => {
  const toDelete = []
  for (const [gameId, invitation] of activeInvitations.entries()) {
    if (invitation.user.email === userEmail) {
      toDelete.push(gameId)
    }
  }

  toDelete.forEach(gameId => cleanupInvitation(gameId))
}

export const setupGameStateCleanup = (socket: any) => {
  if (!socket) return
  socket.on('GameStarted', () => {
    cleanupAllUserInvitations()
  })

  socket.on('MatchFound', () => {
    cleanupAllUserInvitations()
  })

  socket.on('GameInviteAccepted', (data: any) => {
    if (data.isHostNotification) {
      cleanupAllUserInvitations()
    }
  })

  socket.on('PlayerReady', () => {
    cleanupAllUserInvitations()
  })

  socket.on('GameEnded', () => {
    cleanupAllUserInvitations()
  })

  socket.on('PlayerLeft', () => {
    cleanupAllUserInvitations()
  })

  socket.on('GameCanceled', () => {
    cleanupAllUserInvitations()
  })

  socket.on('GameSessionEnded', () => {
    cleanupAllUserInvitations()
  })
  socket.on('MatchEnded', () => {
    cleanupAllUserInvitations()
  })
}

export const getInvitationStatus = (gameId: string) => {
  const invitation = activeInvitations.get(gameId)
  if (!invitation) return null

  const pendingData = pendingInvitations.get(invitation.inviteKey)
  return {
    gameId,
    player: invitation.player,
    timestamp: pendingData?.timestamp,
    isActive: true
  }
}

export const hasPendingInvitations = (userEmail: string): boolean => {
  for (const [gameId, invitation] of activeInvitations.entries()) {
    if (invitation.user.email === userEmail) {
      return true
    }
  }
  return false
}