'use client'
import LeftSide from './components/LeftSide'
import Chat from './components/Chat'
import 'react-loading-skeleton/dist/skeleton.css'
import { useEffect, useState } from 'react'
import { chatSocket, useChatStore } from '@/(zustand)/useChatStore'
import { socketInstance } from '@/(zustand)/useAuthStore'
import { toast } from 'react-toastify'

export const ConnectingLoading = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center w-full h-full absolute top-0 left-0 z-50 bg-[#121417] overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse"></div>
      <div className="grid grid-cols-12 gap-px h-full">
        {[...Array(144)].map((_, i) => (
          <div key={i} className="border-cyan-500/10 border-r border-b"></div>
        ))}
      </div>
    </div>

    <div className="relative z-10">
      <div className="border border-gray-400/50 rounded-lg p-8 bg-[#121417]/80 backdrop-blur">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-gray-400 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-0 w-8 h-8 border-2 border-transparent rounded-full animate-ping border-t-gray-400/50"></div>
          </div>
        </div>

        <div className="text-gray-400 font-mono text-xl mb-3 text-center tracking-wide">
          {'> ESTABLISHING_CONNECTION...'}
        </div>

        <div className="text-gray-300/70 font-mono text-xs text-center">
          {text}
        </div>

        <div className="flex justify-center mt-4 space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-sm animate-pulse"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
)

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
      console.log(data)
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
