'use client'
import LeftSide from './components/LeftSide'
import Chat from './components/Chat'
import 'react-loading-skeleton/dist/skeleton.css'
import { useEffect } from 'react'
import { chatSocket, useChatStore } from '@/(zustand)/useChatStore'

const page = () => {
  const {
    isChatSocketConnected,
    connectChatSocket,
    disconnectChatSocket,
    handleChangeConversations,
  } = useChatStore()
  useEffect(() => {
    connectChatSocket()
    chatSocket.on('changeConvOrder', handleChangeConversations)
    return () => {
      if (chatSocket) {
        chatSocket.off('changeConvOrder', handleChangeConversations)
        // offUpdateChat()
        disconnectChatSocket()
      }
    }
  }, [])
  return (
    <div className="flex h-[92vh] gap-6 p-6">
      {isChatSocketConnected ? (
        <>
          <LeftSide />
          <Chat />
        </>
      ) : (
        <>chat socket not connected</>
      )}
    </div>
  )
}

export default page
