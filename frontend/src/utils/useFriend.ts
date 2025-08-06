import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/(zustand)/useChatStore'
import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { useSearchStore } from '@/(zustand)/useSearchStore'
import { toast } from 'react-toastify'

export const useFriend = (user) => {
  const [status, setStatus] = useState('')
  const { setNotifations, notifications, user: me } = useAuthStore()
  const { setSelectedConversationId } = useChatStore()
  const router = useRouter()

  useEffect(() => {
    setStatus(user?.status || '')
  }, [user?.status])

  const handleFriendAction = () => {
    if (!socketInstance?.connected) {
      toast.error('Not connected to server')
      return
    }

    if (!user) {
      toast.error('User not found')
      return
    }

    switch (status) {
      case '':
        setStatus('PENDING')
        socketInstance.emit('addFriend', user.email)
        break

      case 'PENDING':
        if (!user.fromEmail) {
          toast.warning('Cannot accept your own friend request')
          return
        }
        if (user.fromEmail !== me?.email) {
          setStatus('ACCEPTED')
          socketInstance.emit('acceptFriend', user.email)
        } else {
          toast.info('Friend request already sent')
        }
        break

      case 'REJECTED':
        if (!user.fromEmail) {
          toast.warning('Cannot retry friend request yet')
          return
        }
        setStatus('PENDING')
        socketInstance.emit('addFriend', user.email)
        break

      case 'ACCEPTED':
        handleChatWithUser()
        break

      default:
        break
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'PENDING':
        if (!user?.fromEmail) return 'Invite Sent'
        return user.fromEmail === me?.email ? 'Invite Sent' : 'Accept'
      case 'ACCEPTED':
        return 'Friends'
      case 'REJECTED':
        return 'Rejected'
      default:
        return 'Add Friend'
    }
  }

  const isButtonDisabled = () => {
    return status === 'PENDING' && user?.fromEmail === me?.email
  }

  const handleChatWithUser = () => {
    if (!user) return
    setSelectedConversationId(user.id)
    router.push('/chat')
  }

  return {
    status,
    handleFriendAction,
    getButtonText,
    isButtonDisabled,
    handleChatWithUser,
  }
}
