'use client'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { useChatStore } from '@/(zustand)/useChatStore'
import { useAuthStore } from '@/(zustand)/useAuthStore'

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)

  if (isToday(date)) {
    return `Today, ${format(date, 'h:mmaaa')}`
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mmaaa')}`
  } else {
    return format(date, 'MMM d, h:mmaaa') // Example: Apr 9, 8:56PM
  }
}

interface FriendConversationType {
  id: number
  image: string
  sender: string
  senderId: number
  time: string
  text: string
  imageText: string
  isOnline: boolean
  seen: boolean
}

export const Conversation: React.FC<FriendConversationType> = ({
  id,
  image,
  sender,
  time,
  text,
  imageText,
  isOnline,
  senderId,
  seen,
}) => {
  const { setSelectedConversationId, selectedConversationId } = useChatStore()
  const { user } = useAuthStore()

  const isUserMessage = senderId === user.id
  const isSelected = selectedConversationId === id
  const isUnread = !seen && !isUserMessage

  return (
    <div
      onClick={() => {
        setSelectedConversationId(id)
      }}
      className={`flex relative items-center justify-center p-2 xl:py-4 xl:px-5 cursor-pointer transition duration-300 ease-in-out
        ${isUnread ? 'bg-[#272727]' : ''}
        hover:bg-[#2727273a]
        ${isSelected ? 'bg-[#27272780]' : ''}`}
    >
      <div className="w-full relative items-center flex xl:py-6">
        <div className="relative">
          <Image
            src={image}
            alt={`${sender} profile`}
            width={100}
            height={100}
            className="rounded-full w-[60px] h-[60px] object-cover"
          />
          <div
            className={`${
              isOnline ? 'bg-green-400' : 'bg-red-400'
            } w-[20px] h-[20px] rounded-full border-4 border-[#1A1A1A] absolute top-0 right-0`}
          ></div>
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium">{sender}</h3>
            {time && <span className="text-[10px] text-gray-400">{time}</span>}
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs flex text-gray-400 break-all max-w-[70%]">
              {isUserMessage && (
                <span className="text-gray-300 mr-1">You: </span>
              )}
              {imageText ? (
                <span className="flex items-center">
                  <i className="fa-solid fa-paperclip mr-1"></i>
                  attachment
                </span>
              ) : (
                <span>
                  {text && text.length > 30
                    ? text.substring(0, 30) + '...'
                    : text}
                </span>
              )}
            </div>

            {/* Seen status indicators */}
            {isUserMessage && (
              <div className="flex items-center justify-end">
                {seen ? (
                  <div className="flex items-center" title="Seen">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    <div className="text-[9px] text-blue-500">Seen</div>
                  </div>
                ) : (
                  <div className="flex items-center" title="Delivered">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                    <div className="text-[9px] text-gray-400">Sent</div>
                  </div>
                )}
              </div>
            )}

            {/* Unread indicator for recipient */}
            {isUnread && (
              <div
                className="w-3 h-3 bg-blue-500 rounded-full"
                title="Unread message"
              ></div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full border-t border-gray-800 absolute bottom-0"></div>
    </div>
  )
}

const NoConversation = () => {
  return (
    <div className="w-full  h-[80%]  flex flex-col items-center justify-center">
      <Image
        src="/EmptyConversation.svg"
        alt="EmptyConversation"
        width={0}
        height={0}
        className="w-[55%]"
      />
      <h2 className="m-6 text-xs md:text-xl">No Conversations Yet</h2>
      <p className="text-gray-400 text-center text-xs md:text-md">
        Start a new chat or invite others to join the conversation.
      </p>
    </div>
  )
}

const FriendsConversations = () => {
  const { user } = useAuthStore((state) => state)
  const { onlineUsers } = useAuthStore()
  const { conversations, getConversations, isLoading } = useChatStore()

  useEffect(() => {
    getConversations()
  }, [])

  return (
    <div className="bg-[#121417] rounded-xl border-[#768192]  h-full  border overflow-y-scroll">
      <h3 className="p-2 xl:p-5 text-xs  xl:text-xl">Friends</h3>
      {(conversations && conversations.length > 0) || isLoading ? (
        conversations.map((friend, index) => (
          <Conversation
            key={index}
            id={
              user.email === friend.sender.email
                ? friend.receiver.id
                : friend.sender.id
            }
            senderId={friend.senderId}
            image={
              user.email === friend.sender.email
                ? friend.receiver.avatar
                : friend.sender.avatar
            }
            sender={
              user.email === friend.sender.email
                ? `${friend.receiver.first_name} ${friend.receiver.last_name}`
                : `${friend.sender.first_name} ${friend.sender.last_name}`
            }
            text={friend.message}
            imageText={friend.image}
            time={formatDate(friend.date)}
            seen={friend.seen}
            isOnline={
              user.email === friend.sender.email
                ? onlineUsers.includes(friend.receiver.email)
                : onlineUsers.includes(friend.sender.email)
            }
          />
        ))
      ) : (
        <NoConversation />
      )}
    </div>
  )
}

const LeftSide = () => {
  const { selectedConversationId } = useChatStore()
  return (
    <div className="flex flex-col justify-between w-[25%]">
      <FriendsConversations />
    </div>
  )
}

export default LeftSide
