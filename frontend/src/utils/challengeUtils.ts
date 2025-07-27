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

  // Set up global listeners
  socket.on('InviteToGameResponse', handleInviteResponse)
  socket.on('GameInviteAccepted', handleGameInviteAccepted)
  socket.on('GameInviteDeclined', handleGameInviteDeclined)
  socket.on('GameInviteTimeout', handleGameInviteTimeout)
  socket.on('GameInviteCanceled', handleGameInviteCanceled)
  
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
    toast.warning('Invitation already sent to this player. Please wait...')
    return false
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

// Function to clean up all invitations for a user (useful on logout)
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