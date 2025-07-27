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

// Track pending invitations to prevent duplicates
const pendingInvitations = new Map<string, { gameId: string; timestamp: number }>()

// Global event handlers management for multi-invite support
let globalEventHandlersSetup = false
const activeInvitations = new Map<string, {
  gameId: string
  player: ChallengePlayer
  user: any
  router: any
  onStatusChange?: (email: string, status: 'challenging' | 'idle') => void
  inviteKey: string
}>()

// Set up global event handlers once
const setupGlobalEventHandlers = (socket: any) => {
  if (globalEventHandlersSetup) return

  const handleInviteResponse = (data: any) => {
    console.log('Global invite response:', data)
    
    // Find the invitation this response is for
    for (const [gameId, invitation] of activeInvitations.entries()) {
      if (data.gameId === gameId || data.guestEmail === invitation.player.email) {
        if (data.status === 'success' && data.type === 'invite_sent') {
          console.log('Invite sent successfully for:', gameId)
          // Update the gameId if it was generated server-side
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
          cleanupInvitation(gameId)
        }
        break
      }
    }
  }

  const handleGameInviteAccepted = (data: any) => {
    console.log('Global game invite accepted:', data)
    
    const invitation = activeInvitations.get(data.gameId)
    if (!invitation) {
      console.log('No active invitation found for gameId:', data.gameId)
      return
    }

    if (data.status === 'ready_to_start') {
      console.log('Processing game acceptance for:', data.gameId)
      
      // Store game state for OneVsOne page
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
      
      // Clean up this specific invitation
      cleanupInvitation(data.gameId)
      
      // Immediate redirect
      console.log('Redirecting to game...')
      invitation.router.push('/play/OneVsOne?mode=Online')
    }
  }

  const handleGameInviteDeclined = (data: any) => {
    console.log('Global game invite declined:', data)
    
    const invitation = activeInvitations.get(data.gameId)
    if (invitation) {
      const friendName = invitation.player.username || invitation.player.name || invitation.player.email
      toast.error(`${friendName} declined your challenge`)
      cleanupInvitation(data.gameId)
    }
  }

  const handleGameInviteTimeout = (data: any) => {
    console.log('Global game invite timeout:', data)
    
    const invitation = activeInvitations.get(data.gameId)
    if (invitation) {
      const friendName = invitation.player.username || invitation.player.name || invitation.player.email
      toast.warning(`Challenge to ${friendName} timed out`)
      cleanupInvitation(data.gameId)
    }
  }

  const handleGameInviteCanceled = (data: any) => {
    console.log('Global game invite canceled:', data)
    
    const invitation = activeInvitations.get(data.gameId)
    if (invitation) {
      toast.info('Game invitation was canceled')
      cleanupInvitation(data.gameId)
    }
  }

  // NEW: Handle comprehensive invitation cleanup
  const handleGameInvitationsCleanup = (data: any) => {
    console.log('Global invitations cleanup:', data)
    
    if (data.reason === 'player_accepted_other_invitation') {
      // Clean up all active invitations since the player accepted another game
      const invitationsToCleanup = Array.from(activeInvitations.keys())
      
      for (const gameId of invitationsToCleanup) {
        cleanupInvitation(gameId)
      }
      
      // Show notification about cleanup
      toast.info(data.message || `${data.acceptingPlayer} accepted a game invitation. All pending challenges have been cleared.`)
    }
  }

  // NEW: Handle individual invitation cleanup
  const handleGameInviteCleanup = (data: any) => {
    console.log('Game invite cleanup:', data)
    
    if (data.gameId === 'multiple') {
      // Multiple invitations cleanup
      const invitationsToCleanup = Array.from(activeInvitations.keys())
      for (const gameId of invitationsToCleanup) {
        cleanupInvitation(gameId)
      }
    } else if (data.gameId) {
      // Single invitation cleanup
      cleanupInvitation(data.gameId)
    }
    
    // Show appropriate message based on cleanup reason
    switch (data.action) {
      case 'accepted':
        // Don't show message for accepted invitations (handled elsewhere)
        break
      case 'declined':
        // Don't show message for declined invitations (handled elsewhere)
        break
      case 'canceled':
        toast.info('Invitation was canceled')
        break
      case 'timeout':
        toast.warning('Invitation expired')
        break
      case 'auto_cleanup':
        // Don't show individual messages for auto cleanup (bulk message shown instead)
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

  // Set up global listeners
  socket.on('InviteToGameResponse', handleInviteResponse)
  socket.on('GameInviteAccepted', handleGameInviteAccepted)
  socket.on('GameInviteDeclined', handleGameInviteDeclined)
  socket.on('GameInviteTimeout', handleGameInviteTimeout)
  socket.on('GameInviteCanceled', handleGameInviteCanceled)
  
  // NEW: Add comprehensive cleanup listeners
  socket.on('GameInvitationsCleanup', handleGameInvitationsCleanup)
  socket.on('GameInviteCleanup', handleGameInviteCleanup)
  
  globalEventHandlersSetup = true
  console.log('Global event handlers set up')
}

// Clean up a specific invitation
const cleanupInvitation = (gameId: string) => {
  const invitation = activeInvitations.get(gameId)
  if (invitation) {
    pendingInvitations.delete(invitation.inviteKey)
    invitation.onStatusChange?.(invitation.player.email, 'idle')
    activeInvitations.delete(gameId)
    console.log('Cleaned up invitation:', gameId)
  }
}

// NEW: Clean up all invitations for a user
export const cleanupAllUserInvitations = () => {
  const invitationsToCleanup = Array.from(activeInvitations.keys())
  
  for (const gameId of invitationsToCleanup) {
    cleanupInvitation(gameId)
  }
  
  // Also clear pending invitations
  pendingInvitations.clear()
  
  console.log(`Cleaned up ${invitationsToCleanup.length} active invitations`)
}

// NEW: Force clear all cached invitation data (call this when returning to play page)
export const forceClearInvitationCache = () => {
  pendingInvitations.clear()
  activeInvitations.clear()
  console.log('Force cleared all invitation cache')
}

// NEW: Check if invitation is actually still valid on server
export const validateInvitationStatus = async (socket: any, inviteKey: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false) // Assume invalid if no response
    }, 2000)

    // Listen for validation response
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

  // Set up global event handlers if not already done
  setupGlobalEventHandlers(socket)

  // Create a unique key for this invitation pair
  const inviteKey = `${user.email}:${player.email}`
  
  // Check if there's already a pending invitation to this player
  const existing = pendingInvitations.get(inviteKey)
  if (existing && Date.now() - existing.timestamp < 30000) { // 30 seconds
    // NEW: Validate if the invitation is actually still valid on server
    const isValid = await validateInvitationStatus(socket, inviteKey)
    if (isValid) {
      toast.warning('Invitation already sent to this player. Please wait...')
      return false
    } else {
      // Server says it's not valid, clean up local cache
      console.log('Server validation failed, cleaning up stale invitation:', inviteKey)
      pendingInvitations.delete(inviteKey)
      
      // Also clean up any related active invitations
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

    // Generate gameId and track this invitation
    const newGameId = crypto.randomUUID()
    pendingInvitations.set(inviteKey, { gameId: newGameId, timestamp: Date.now() })

    // Store this active invitation
    activeInvitations.set(newGameId, {
      gameId: newGameId,
      player,
      user,
      router,
      onStatusChange,
      inviteKey
    })

    // Auto cleanup after 35 seconds (longer than server timeout)
    setTimeout(() => {
      if (activeInvitations.has(newGameId)) {
        console.log('Auto cleanup - invitation timed out:', newGameId)
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
    
    console.log('Sending invitation to:', player.email, 'gameId:', newGameId)
    socket.emit('InviteToGame', encrypted)

    return true
  } catch (error) {
    console.error('Failed to send challenge:', error)
    pendingInvitations.delete(inviteKey)
    onStatusChange?.(player.email, 'idle')
    return false
  }
}

// Helper function to clear stale invitations (call this periodically)
export const clearStaleInvitations = () => {
  const now = Date.now()
  
  // Clear stale pending invitations
  for (const [key, data] of pendingInvitations.entries()) {
    if (now - data.timestamp > 60000) { // 1 minute
      pendingInvitations.delete(key)
    }
  }
  
  // Clear stale active invitations
  for (const [gameId, invitation] of activeInvitations.entries()) {
    const pendingData = pendingInvitations.get(invitation.inviteKey)
    if (!pendingData || now - pendingData.timestamp > 60000) {
      cleanupInvitation(gameId)
    }
  }
}

// Function to cancel a specific invitation
export const cancelInvitation = (socket: any, gameId: string, hostEmail: string) => {
  if (!socket || !gameId || !hostEmail) return

  socket.emit('CancelGameInvite', {
    gameId,
    hostEmail
  })
  
  // Clean up local tracking
  cleanupInvitation(gameId)
}

// Function to get all active invitations for a user
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

// NEW: Clean up stale invitations on server
export const cleanupStaleInvitations = (socket: any, userEmail: string) => {
  if (!socket || !userEmail) return

  socket.emit('CleanupStaleInvitations', { userEmail })
  
  // Also force clear local cache
  forceClearInvitationCache()
}

// NEW: Initialize invitation system (call this when user enters play page)
export const initializeInvitationSystem = (socket: any, userEmail: string) => {
  if (!socket || !userEmail) return

  console.log('Initializing invitation system for user:', userEmail)
  
  // Setup event handlers
  setupGlobalEventHandlers(socket)
  setupGameStateCleanup(socket)
  
  // Clean up any stale data
  cleanupStaleInvitations(socket, userEmail)
  
  // Set up periodic cleanup
  const cleanupInterval = setInterval(() => {
    clearStaleInvitations()
  }, 30000) // Every 30 seconds
  
  // Return cleanup function
  return () => {
    clearInterval(cleanupInterval)
    forceClearInvitationCache()
  }
}

// Function to clean up all invitations for a user (useful on logout) all invitations for a user (useful on logout)
export const cleanupAllInvitations = (userEmail: string) => {
  const toDelete = []
  for (const [gameId, invitation] of activeInvitations.entries()) {
    if (invitation.user.email === userEmail) {
      toDelete.push(gameId)
    }
  }
  
  toDelete.forEach(gameId => cleanupInvitation(gameId))
  console.log('Cleaned up all invitations for user:', userEmail)
}

// NEW: Setup cleanup listeners for when user accepts/joins games
export const setupGameStateCleanup = (socket: any) => {
  if (!socket) return

  // Clean up all invitations when user joins a game
  socket.on('GameStarted', () => {
    console.log('Game started - cleaning up all pending invitations')
    cleanupAllUserInvitations()
  })

  socket.on('MatchFound', () => {
    console.log('Match found - cleaning up all pending invitations')
    cleanupAllUserInvitations()
  })

  socket.on('GameInviteAccepted', (data: any) => {
    if (data.isHostNotification) {
      console.log('Host received acceptance - cleaning up other invitations')
      cleanupAllUserInvitations()
    }
  })

  // Clean up when user goes to game page
  socket.on('PlayerReady', () => {
    console.log('Player ready - cleaning up all pending invitations')
    cleanupAllUserInvitations()
  })

  // NEW: Clean up when game ends
  socket.on('GameEnded', () => {
    console.log('Game ended - cleaning up all pending invitations')
    cleanupAllUserInvitations()
  })

  // NEW: Clean up when player leaves game
  socket.on('PlayerLeft', () => {
    console.log('Player left - cleaning up all pending invitations')
    cleanupAllUserInvitations()
  })

  // NEW: Clean up when game is canceled
  socket.on('GameCanceled', () => {
    console.log('Game canceled - cleaning up all pending invitations')
    cleanupAllUserInvitations()
  })

  // NEW: Clean up when returning to play page after game
  socket.on('GameSessionEnded', () => {
    console.log('Game session ended - cleaning up all pending invitations')
    cleanupAllUserInvitations()
  })

  // NEW: Clean up when match ends (matchmaking)
  socket.on('MatchEnded', () => {
    console.log('Match ended - cleaning up all pending invitations')
    cleanupAllUserInvitations()
  })
}

// NEW: Get invitation status for UI updates
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

// NEW: Check if user has any pending invitations
export const hasPendingInvitations = (userEmail: string): boolean => {
  for (const [gameId, invitation] of activeInvitations.entries()) {
    if (invitation.user.email === userEmail) {
      return true
    }
  }
  return false
}