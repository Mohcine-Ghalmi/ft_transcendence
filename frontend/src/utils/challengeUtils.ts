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

  // Create a unique key for this invitation pair
  const inviteKey = `${user.email}:${player.email}`
  
  // Check if there's already a pending invitation
  const existing = pendingInvitations.get(inviteKey)
  if (existing && Date.now() - existing.timestamp < 30000) { // 30 seconds
    toast.warning('Invitation already sent. Please wait...')
    return false
  }

  try {
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    if (!encryptionKey) {
      throw new Error('Encryption key not found')
    }

    let gameId: string | null = null
    let cleanup: (() => void) | null = null
    let invitationAccepted = false
    let eventHandled = false // Prevent multiple event handling

    // Generate gameId and track this invitation
    const newGameId = crypto.randomUUID()
    pendingInvitations.set(inviteKey, { gameId: newGameId, timestamp: Date.now() })

    const resetChallengeState = () => {
      if (!eventHandled) {
        eventHandled = true
        pendingInvitations.delete(inviteKey)
        onStatusChange?.(player.email, 'idle')
        cleanup?.()
      }
    }

    const handleInviteResponse = (data: any) => {
      if (data.status === 'success' && data.type === 'invite_sent') {
        gameId = data.gameId
        console.log('Invite sent successfully:', gameId)
      } else if (data.status === 'error') {
        toast.warning(data.message)
        resetChallengeState()
      }
    }

    const handleGameInviteAccepted = (data: any) => {
      console.log('Game invite accepted:', data)
      
      // Only process if this is for our current game and not already accepted
      if (data.status === 'ready_to_start' && data.gameId === gameId && !invitationAccepted && !eventHandled) {
        invitationAccepted = true
        eventHandled = true
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
        
        // Clean up tracking
        pendingInvitations.delete(inviteKey)
        onStatusChange?.(player.email, 'idle')
        cleanup?.()
        
        // Immediate redirect - don't wait
        console.log('Redirecting to game...')
        router.push('/play/OneVsOne?mode=Online')
      }
    }

    const handleGameInviteDeclined = (data: any) => {
      console.log('Game invite declined:', data)
      if (data.gameId === gameId && !eventHandled) {
        // Show toast notification for declined invitation
        const friendName = player.username || player.name || player.email
        toast.error(`${friendName} declined your challenge`)
        
        resetChallengeState()
      }
    }

    const handleGameInviteTimeout = (data: any) => {
      console.log('Game invite timeout:', data)
      if (data.gameId === gameId && !eventHandled) {
        // Show toast notification for timeout
        const friendName = player.username || player.name || player.email
        toast.warning(`Challenge to ${friendName} timed out`)
        
        resetChallengeState()
      }
    }

    const handleGameInviteCanceled = (data: any) => {
      console.log('Game invite canceled:', data)
      if (data.gameId === gameId && !eventHandled) {
        toast.info('Game invitation was canceled')
        resetChallengeState()
      }
    }

    // Set up event listeners
    socket.on('InviteToGameResponse', handleInviteResponse)
    socket.on('GameInviteAccepted', handleGameInviteAccepted)
    socket.on('GameInviteDeclined', handleGameInviteDeclined)
    socket.on('GameInviteTimeout', handleGameInviteTimeout)
    socket.on('GameInviteCanceled', handleGameInviteCanceled)
    
    cleanup = () => {
      console.log('Cleaning up socket listeners')
      socket.off('InviteToGameResponse', handleInviteResponse)
      socket.off('GameInviteAccepted', handleGameInviteAccepted)
      socket.off('GameInviteDeclined', handleGameInviteDeclined)
      socket.off('GameInviteTimeout', handleGameInviteTimeout)
      socket.off('GameInviteCanceled', handleGameInviteCanceled)
    }

    // Auto cleanup after 35 seconds (longer than server timeout)
    setTimeout(() => {
      if (!invitationAccepted && !eventHandled) {
        console.log('Auto cleanup - invitation not processed')
        toast.warning(`Challenge to ${player.username || player.email} timed out`)
        resetChallengeState()
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
    
    console.log('Sending invitation...')
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
  for (const [key, data] of pendingInvitations.entries()) {
    if (now - data.timestamp > 60000) { // 1 minute
      pendingInvitations.delete(key)
    }
  }
}