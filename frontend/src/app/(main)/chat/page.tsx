'use client'
import LeftSide from './components/LeftSide'
import Chat from './components/Chat'
import 'react-loading-skeleton/dist/skeleton.css'
import { useEffect, useState } from 'react'
import { chatSocket, useChatStore } from '@/(zustand)/useChatStore'
import { socketInstance } from '@/(zustand)/useAuthStore'
import { toast } from 'react-toastify'
import ConnectingLoading from '@/components/layout/ConnectingLoading'

interface GameInviteDeclinedInterface {
  declinedBy: string
  gameId: string
  guestLogin: string
  guestName: string
}

interface InviteToGameResponseInterface {
  gameId: string
  guestData: {
    avatar: string
    id: number
    login: string
    username: string
  }
  message: string
  status: string
  type: string
}

const page = () => {
  const {
    connectChatSocket,
    disconnectChatSocket,
    handleChangeConversations,
    selectedConversationId,
    selectedConversation,
  } = useChatStore()
  const [isConnected, setIsSocketConnected] = useState(false)

  useEffect(() => {
    if (!selectedConversationId || !selectedConversation) return

    const handleInviteToGameResponse = (
      data: InviteToGameResponseInterface
    ) => {
      if (!selectedConversationId || !selectedConversation) return

      if (data.type === 'invite_sent' && data.status === 'success') {
        toast.success(data.message)
      } else if (data.status === 'error') {
        toast.warning(data.message)
      }
    }

    if (socketInstance?.connected)
      socketInstance.on('InviteToGameResponse', handleInviteToGameResponse)

    return () => {
      socketInstance.off('InviteToGameResponse', handleInviteToGameResponse)
    }
  }, [selectedConversationId, selectedConversation])

  useEffect(() => {
    connectChatSocket()

    const handleGameInviteDeclined = (data: GameInviteDeclinedInterface) => {
      toast.warning(data.declinedBy + ' has declined your game invite')
    }

    const checkSocket = () => {
      if (chatSocket?.connected) {
        if (socketInstance?.connected) {
          socketInstance.on('GameInviteDeclined', handleGameInviteDeclined)
        }
        setIsSocketConnected(true)
        chatSocket.on('changeConvOrder', handleChangeConversations)
      }
    }

    checkSocket()

    const timeout = setTimeout(checkSocket, 1000)

    return () => {
      clearTimeout(timeout)
      if (socketInstance?.connected) {
        socketInstance.off('GameInviteDeclined', handleGameInviteDeclined)
      }
      if (chatSocket?.connected) {
        chatSocket.off('changeConvOrder', handleChangeConversations)
        disconnectChatSocket()
      }
    }
  }, [])
  return (
    <div className="flex h-[92vh] gap-6 p-6">
      {isConnected ? (
        <>
          <LeftSide />
          <Chat />
        </>
      ) : (
        <ConnectingLoading text="Please wait while we connect to the chat server..." />
      )}
    </div>
  )
}

export default page
