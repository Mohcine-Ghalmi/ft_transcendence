'use client'
import LeftSide from './components/LeftSide'
import Chat from './components/Chat'
import 'react-loading-skeleton/dist/skeleton.css'
import { useEffect, useState } from 'react'
import { chatSocket, useChatStore } from '@/(zustand)/useChatStore'

const page = () => {
  const {
    isChatSocketConnected,
    connectChatSocket,
    disconnectChatSocket,
    handleChangeConversations,
    selectedConversationId,
    setIsChatSocketConnected,
  } = useChatStore()
  const [isConnected, setIsSocketConnected] = useState(false)

  useEffect(() => {
    connectChatSocket()

    const checkSocket = () => {
      if (chatSocket?.connected) {
        setIsSocketConnected(true)
        chatSocket.on('changeConvOrder', handleChangeConversations)
      }
    }

    checkSocket()

    const timeout = setTimeout(checkSocket, 1000)

    return () => {
      clearTimeout(timeout)
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
