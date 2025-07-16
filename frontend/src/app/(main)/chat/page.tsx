'use client'
import LeftSide from './components/LeftSide'
import Chat from './components/Chat'
import 'react-loading-skeleton/dist/skeleton.css'
import { useEffect, useState } from 'react'
import { chatSocket, useChatStore } from '@/(zustand)/useChatStore'
import { socketInstance } from '@/(zustand)/useAuthStore'
import { toast } from 'react-toastify'

interface GameInviteDeclinedInterface {
  declinedBy: string
  gameId: string
  guestLogin: string
  guestName: string
}

// gameId
// :
// "8d91781b-8f11-456c-acc8-76789bbe16c9"
// guestData
// :
// avatar
// :
// "1752664334848-f50ca54bbcde8aa3.png"
// id
// :
// 1
// login
// :
// "harlequin_overwhelming_sturgeon"
// username
// :
// "zabi"
// [[Prototype]]
// :
// Object
// guestEmail
// :
// "cbamiixsimo@gmail.com"
// message
// :
// "Invitation sent to zabi"
// status
// :
// "success"
// type
// :
// "invite_sent"

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
    isChatSocketConnected,
    connectChatSocket,
    disconnectChatSocket,
    handleChangeConversations,
    selectedConversationId,
    setIsChatSocketConnected,
    selectedConversation,
    tmp,
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
        <div className="flex items-center justify-center w-full">
          chat socket not connected
        </div>
      )}
    </div>
  )
}

export default page
