'use client'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { toast } from 'react-toastify'
import { ConversationContainer, EmptyChat, More } from './server/ChatSide'
import CryptoJs from 'crypto-js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import {
  axiosInstance,
  socketInstance,
  useAuthStore,
} from '@/(zustand)/useAuthStore'
import {
  axiosChatInstance,
  chatSocket,
  useChatStore,
} from '@/(zustand)/useChatStore'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useClickOutside } from '@/components/lib/clickOutSide'
import { challengePlayer } from '@/utils/challengeUtils'
import { useGameInvite } from '../../play/OneVsOne/GameInviteProvider'

const ChatHeader = () => {
  const [more, setMore] = useState(false)
  const { onlineUsers } = useAuthStore()
  const { setSelectedConversationId, chatHeader: user } = useChatStore()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside(menuRef, () => setMore(false))

  const handleBlock = () => {
    if (socketInstance) {
      !user.isBlockedByMe
        ? socketInstance.emit('block:user', {
            hisEmail: user.email,
          })
        : socketInstance.emit('unblock:user', {
            hisEmail: user.email,
          })
    }
  }

  if (!user)
    return (
      <div className="flex justify-between items-center border border-[#293038] p-2  xl:p-6 bg-[#121417] rounded-2xl">
        <div className="flex items-center">
          <Skeleton
            count={1}
            height={100}
            width={100}
            borderRadius={90}
            baseColor="#1e1e1e"
            highlightColor="#333"
          />
          <div className="ml-5">
            <Skeleton
              count={2}
              height={20}
              width={100}
              baseColor="#1e1e1e"
              highlightColor="#333"
            />
          </div>
        </div>
      </div>
    )
  return (
    <div className="flex justify-between items-center border border-[#293038] p-2  xl:p-6 bg-[#121417] rounded-2xl">
      <div className="flex items-center">
        <div className="relative">
          <Image
            src={`/images/${user.avatar}`}
            width={100}
            height={100}
            alt="avatar"
            className="xl:w-[80px] xl:h-[80px] w-[40px] h-[40px]  rounded-full object-cover"
          />
          <div
            className={` ${
              onlineUsers.includes(user.email) ? 'bg-green-400' : 'bg-red-400'
            } w-[15px] h-[15px] rounded-full border-4 border-[#1A1A1A] absolute -top-1 -right-0`}
          ></div>
        </div>
        <div className="ml-2 xl:ml-6">
          <h3 className="text-xs xl:text-3xl">{user.username}</h3>
          <p
            className={`text-[8px] mt-3 xl:text-xs ${
              onlineUsers.includes(user.email)
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            <span className="text-gray-400 text-md mr-2">@{user.login}</span>
            {onlineUsers.includes(user.email) ? ' online' : ' offline'}
          </p>
        </div>
      </div>
      <div className="cursor-pointer" onClick={() => setMore(!more)}>
        <Image
          src="/more-horizontal.svg"
          alt="more-horizontal"
          width={100}
          height={100}
          className="w-[20px] xl:w-[60px]"
        />
      </div>
      <AnimatePresence>
        {more && (
          <motion.div
            key="more"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 rounded-2xl bg-[#1c1c1c00] w-full px-4 h-full"
          >
            <div
              ref={menuRef}
              className="cursor-pointer absolute top-0 right-0 xl:right-15 xl:top-10"
              onClick={() => setMore(false)}
            />
            <div className="border border-gray-500 bg-white absolute top-10 right-5 xl:right-10 xl:top-30 rounded-2xl">
              <div onClick={() => router.push(`/profile/${user.login}`)}>
                <More src="/user.svg" text="See profile" />
              </div>
              <div onClick={() => handleBlock()}>
                <More
                  src="/slash-block.svg"
                  text={user.isBlockedByMe ? 'Unblock' : 'Block'}
                />
              </div>
              <div onClick={() => setSelectedConversationId(undefined)}>
                <More src="/X.svg" text="Close Chat" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const SendMessageInput = ({
  message,
  isLoading,
  changeMessageValue,
  sendMessage,
  image,
  setImage,
}: {
  message: string
  isLoading: boolean
  changeMessageValue: (message: string) => void
  sendMessage: () => void
  image: File | null
  setImage: any
}) => {
  const { chatHeader } = useChatStore()
  const { user } = useAuthStore()
  const { socket } = useGameInvite()
  const router = useRouter()
  const [imagePath, setImagePath] = useState<string | null>(null)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // if (chatHeader.status === 'BLOCKED') return
    if (event.key === 'Enter') {
      setImagePath(null)
      sendMessage()
    }
  }

  const handleGameInviteInChat = async () => {
    await challengePlayer(
      {
        email: chatHeader.email,
        name: chatHeader.username,
        username: chatHeader.username,
        login: chatHeader.login,
        avatar: chatHeader.avatar,
      },
      socket,
      user,
      router
    )
  }

  const send = () => {
    setImagePath(null)
    sendMessage()
  }

  useEffect(() => {
    if (!image) return
    setImagePath(URL.createObjectURL(image))
  }, [image])

  return (
    <div className="relative flex">
      {imagePath && (
        <div className="shadow-xlanimate-fade-up absolute bottom-[100px] bg-gray-700 flex items-center justify-center w-[300px] h-[300px] rounded-2xl ">
          <Image
            src={imagePath}
            alt="selected image"
            width={0}
            height={0}
            className="w-full h-full object-cover rounded-2xl"
            quality={1}
          />
          <div
            className="bg-gray-500 rounded-full p-2 m-2  top-0 right-0 absolute cursor-pointer"
            onClick={() => {
              setImage(null)
              setImagePath(null)
            }}
          >
            <Image
              className="w-[20px]"
              src="/X.svg"
              alt="X"
              width={100}
              height={100}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between w-full rounded-2xl bg-[#121417] border-[#293038] border p-3">
        <input
          type="text"
          value={message}
          autoFocus={true}
          onChange={(e) => changeMessageValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message ..."
          className="outline-none w-full xl:p-4 xl:text-2xl p-2 text-xs"
          max={255}
        />
        <div className="flex items-center justify-around h-[40px] xl:gap-6 gap-2">
          <div>
            <label htmlFor="files">
              <Image
                className="w-[45px] h-full cursor-pointer"
                src="/addimage.svg"
                alt="image"
                width={100}
                height={100}
              />
            </label>
            <input
              type="file"
              id="files"
              value=""
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setImage(file)
              }}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div onClick={() => handleGameInviteInChat()}>
            <Image
              className="w-[50px] h-full cursor-pointer"
              src="/Game.svg"
              alt="game"
              width={100}
              height={100}
            />
          </div>
          <div
            onClick={() => send()}
            className={`${
              message || imagePath
                ? 'bg-blue-400 cursor-pointer'
                : 'bg-gray-400'
            } rounded-2xl flex items-center justify-center h-full w-[55px] px-2 py-4`}
          >
            {isLoading ? (
              <div className="w-[20px] h-[20px] xl:w-[35px] xl:h-[35px] flex items-center justify-center">
                <i className="animate-spin fa-solid fa-spinner"></i>
              </div>
            ) : (
              <Image
                className="w-[20px] h-[20px] xl:w-[35px] xl:h-[35px]"
                src="/send.svg"
                alt="emojis"
                width={100}
                height={100}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const Chat = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const {
    selectedConversationId,
    chatHeader,
    handleNewMessage,
    tmp,
    selectedConversation,
    isChatSocketConnected,
  } = useChatStore()

  const changeMessageValue = (message: string) => {
    if (message.length >= 255) return
    setMessage(message)
  }

  const hostImage = async (image: File) => {
    const formData = new FormData()
    formData.append('file', image)
    try {
      const res = await axiosInstance.post('/users/postImage', formData)
      setImage(null)
      return res.data.filename
    } catch (err: any) {
      setImage(null)
      toast.warning(err.response.data.message)
      return null
    }
  }

  const sendMessage = async () => {
    const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
    if (
      selectedConversationId === undefined ||
      (!message.trim() && !image) ||
      !key
    )
      return

    setIsLoading(true)
    const user = useAuthStore.getState().user

    const sendingText = {
      isSending: true,
      senderId: user.id,
      receiverId: selectedConversationId,
      message: message.trim(),
      image: image ? 'general-img-landscape.png' : null,
      date: new Date(),
      sender: { ...user },
      receiver: { id: selectedConversationId, ...chatHeader },
    }

    handleNewMessage(sendingText)
    try {
      let imagePath = null
      if (image) {
        imagePath = await hostImage(image)
        if (!imagePath) {
          setIsLoading(false)
          const newConv = selectedConversation.filter(
            (conv) => conv.isSending !== true
          )
          tmp(newConv)
          return
        }
      }

      const payload = CryptoJs.AES.encrypt(
        JSON.stringify({
          recieverId: selectedConversationId,
          senderEmail: user.email,
          senderId: user.id,
          message: message.trim(),
          image: imagePath,
        }),
        key
      ).toString()

      if (chatSocket?.connected) {
        chatSocket.emit('sendMessage', payload)

        setMessage('')
        setImage(null)
      } else {
        toast.error('Socket connection issue. Please try again.')
      }
    } catch (err) {
      toast.error('Failed to send message.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Chat isChatSocketConnected : ', isChatSocketConnected)

    const onFailedToSendMessage = (err) => {
      toast.error(err)
      setIsLoading(false)
    }

    const onMessageSent = () => {
      setIsLoading(false)
    }

    const setupListeners = () => {
      if (chatSocket?.connected) {
        chatSocket.on('failedToSendMessage', onFailedToSendMessage)
        chatSocket.on('messageSent', onMessageSent)
        chatSocket.on('newMessage', handleNewMessage)
      }
    }

    setupListeners()

    return () => {
      if (chatSocket) {
        chatSocket.off('failedToSendMessage', onFailedToSendMessage)
        chatSocket.off('messageSent', onMessageSent)
        chatSocket.off('newMessage', handleNewMessage)
      }
    }
  }, [selectedConversationId])

  return (
    <div
      className={`w-full ${
        !selectedConversationId ? 'max-xl:hidden' : 'flex'
      } xl:flex rounded-2xl  relative`}
    >
      {selectedConversationId === undefined ? (
        <EmptyChat
          text="Select a chat from the list to start exploring your messages or begin a
        new conversation"
        />
      ) : (
        <div className="flex flex-col justify-between h-full w-full">
          <ChatHeader />
          <ConversationContainer />
          <SendMessageInput
            message={message}
            isLoading={isLoading}
            changeMessageValue={changeMessageValue}
            sendMessage={sendMessage}
            image={image}
            setImage={setImage}
          />
        </div>
      )}
    </div>
  )
}

export default Chat
