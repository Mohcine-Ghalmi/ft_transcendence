'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { chatSocket, useChatStore } from '@/(zustand)/useChatStore'
import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { Search } from 'lucide-react'
import { toast } from 'react-toastify'
import { useSearchStore } from '@/(zustand)/useSearchStore'

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
  status: string
  isBlockedByMe: boolean
  isBlockedByHim: boolean
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
  status,
  isBlockedByMe,
  isBlockedByHim,
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
      className={`flex relative items-center justify-center border-[#293038] border-1 m-2 rounded-2xl px-5 cursor-pointer transition duration-300 ease-in-out ${
        isUnread ? 'bg-[#293038]' : ''
      }
      hover:bg-[#2930386b]
      ${isSelected ? 'bg-[#293038]' : ''}
      } `}
    >
      <div className="w-full relative items-center flex py-4 xl:py-6">
        <div className="relative">
          <Image
            src={`/images/${image}`}
            alt={`${sender} profile`}
            width={100}
            height={100}
            className="rounded-full xl:w-[60px] xl:h-[60px] w-[40px] h-[40px] object-cover"
          />
          <div
            className={`${
              isOnline ? 'bg-green-400' : 'bg-red-400'
            } xl:w-[15px] xl:h-[15px] w-[10px] h-[10px] rounded-full border-1 border-[#293038] absolute top-0 right-0`}
          ></div>
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex justify-between items-center">
            <h3 className="xl:text-md text-xs font-medium">{sender}</h3>
            {time && (
              <span className="xl:text-[10px] text-[8px] text-gray-400">
                {time}
              </span>
            )}
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
      {/* <div className="w-full border-t border-gray-800 absolute bottom-0"></div> */}
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

const InChatSearch = () => {
  const [search, setSearch] = useState('')
  const { user, onlineUsers } = useAuthStore()
  const { setSelectedConversationId } = useChatStore()
  const [isSearching, setIsSearching] = useState(false)

  const {
    searchedChatUsers: searchedUsers,
    setSearchedChatUsers: setSearchedUsers,
  } = useSearchStore()

  const handleChatSearch = async () => {
    if (!search.trim()) return
  }

  useEffect(() => {
    if (!socketInstance || !chatSocket) return

    setIsSearching(true)

    const setsearchedUsersData = async (searchedUsers) => {
      const data = await searchedUsers
      if (data.length > 0) setSearchedUsers(data)
      else setSearchedUsers([])
    }

    const searchForUsers = async () => {
      setSearchedUsers([])

      if (!search.trim()) return
      chatSocket.emit('searchForUser', {
        email: user.email,
        searchedUser: search.trim(),
      })
    }

    const timeoutId = setTimeout(() => {
      searchForUsers()
      setIsSearching(false)
    }, 300)
    if (chatSocket) {
      chatSocket.on('searchingInFriends', setsearchedUsersData)
      chatSocket.on('searchError', (err) => {
        toast.warning(err)
      })

      return () => {
        clearTimeout(timeoutId)
        if (chatSocket) {
          chatSocket.off('searchingInFriends', setsearchedUsersData)
          chatSocket.off('searchError')
        }
      }
    }
  }, [search, socketInstance, user.email])

  const handleUserClick = (id: number) => {
    setSearch('')
    setSearchedUsers([])
    setSelectedConversationId(id)
  }

  return (
    <div className="relative">
      <div className="flex items-center relative  m-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-2 sm:left-3" />
        <input
          type="text"
          placeholder="Search With Login"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleChatSearch()}
          className="pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm w-full placeholder-gray-500 text-white"
        />
      </div>
      {/* searched users */}
      {isSearching ? (
        <div className="absolute w-full z-10 h-[500px] overflow-y-auto animate-fade-up duration-700">
          <div className="w-[95%] items-center mx-auto bg-[#0b1014] rounded-2xl flex flex-col gap-4 p-2">
            <div className="w-[20px] h-[20px] xl:w-[35px] xl:h-[35px] flex items-center gap-4 justify-center">
              Searching <i className="animate-spin fa-solid fa-spinner"></i>
            </div>
          </div>
        </div>
      ) : (
        searchedUsers.length > 0 && (
          <div className="absolute w-full z-10 h-[500px] overflow-y-auto animate-fade-up duration-700">
            <div className="w-[95%] mx-auto bg-[#0b1014] rounded-2xl flex flex-col gap-4 p-2">
              {searchedUsers.map((conv) => (
                <div
                  onClick={() => handleUserClick(conv.user.id)}
                  className="relative w-full h-[100px] flex items-center rounded-2xl border border-[#293038] bg-[#121417] px-4 cursor-pointer hover:bg-[#293038d7] duration-300"
                  key={conv.id}
                >
                  <div className="relative">
                    <Image
                      src={`/images/${conv.user.avatar}`}
                      alt={`profile`}
                      width={100}
                      height={100}
                      className="rounded-full w-[60px] h-[60px] object-cover"
                    />
                    <div
                      className={`${
                        onlineUsers.includes(conv.user.email)
                          ? 'bg-green-400'
                          : 'bg-red-400'
                      } w-[20px] h-[20px] rounded-full border-4 border-[#293038] absolute top-0 right-0`}
                    ></div>
                  </div>
                  <div className="ml-4">
                    <h2>{conv.user.username}</h2>
                    <h3 className="text-xs text-gray-500">
                      @{conv.user.login}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
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
    <div className="bg-[#121417] rounded-xl border-[#293038]  h-full  border overflow-y-auto">
      <InChatSearch />
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
                ? `${friend.receiver.username}`
                : `${friend.sender.username}`
            }
            isBlockedByHim={friend.isBlockedByHim}
            isBlockedByMe={friend.isBlockedByMe}
            status={friend.status}
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
  return (
    <div className="flex flex-col justify-between w-[700px]">
      <FriendsConversations />
    </div>
  )
}

export default LeftSide
