// Friend Suggestions Component
'use client'
import React, { useState, useEffect } from 'react'
import { useSearchStore } from '../../(zustand)/useSearchStore'
import { socketInstance, useAuthStore } from '../../(zustand)/useAuthStore'
import { useRouter } from 'next/navigation'
import { useChatStore } from '../../(zustand)/useChatStore'

const Friend = ({ user }) => {
  const [status, setStatus] = useState()
  const { user: me, onlineUsers } = useAuthStore()
  const { setSelectedConversationId } = useChatStore()
  const router = useRouter()

  if (!user) return null

  const handleClick = () => {
    if (!socketInstance) return

    switch (status) {
      case '':
        setStatus('PENDING')
        socketInstance.emit('addFriend', user.email)
        break

      case 'PENDING':
        if (!user.fromEmail) return
        if (user.fromEmail !== me.email) {
          setStatus('ACCEPTED')
          socketInstance.emit('acceptFriend', user.email)
        }
        break

      case 'REJECTED':
        if (!user.fromEmail) return
        setStatus('PENDING')
        socketInstance.emit('rejectFriend', user.email)
        break

      case 'ACCEPTED':
        // socketInstance.emit('removeFriend', user.email)
        // setStatus('')
        break

      default:
        break
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'PENDING':
        if (!user.fromEmail) return 'Invite Sent'
        return user.fromEmail === me.email ? 'Invite Sent' : 'Accept'
      case 'ACCEPTED':
        return 'Friends'
      case 'REJECTED':
        return 'rejected'
      default:
        return 'Add Friend'
    }
  }

  const isButtonDisabled = () => {
    return status === 'PENDING' && user.fromEmail === me.email
  }

  const handleChatWithuser = () => {
    setSelectedConversationId(user.id)
    router.push('/chat')
  }

  useEffect(() => {
    setStatus(user.status || '')
  }, [user.status])

  return (
    <>
      <div
        key={user.id}
        className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
          <img
            src={`/images/${user.avatar}`}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white font-medium truncate">
            {user.username}
          </p>
          <p
            className={`text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl ${
              onlineUsers.includes(user.email)
                ? 'text-green-400'
                : 'text-gray-400'
            }`}
          >
            {onlineUsers.includes(user.email) ? 'Online' : 'Offline'}
          </p>
        </div>
        <button
          onClick={handleClick}
          disabled={isButtonDisabled()}
          className={`py-1 px-2 text-xs rounded-2xl ${
            isButtonDisabled()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#334D66] cursor-pointer hover:bg-[#2a3d52]'
          }`}
        >
          {getButtonText() === 'Friends' ? (
            <div onClick={() => handleChatWithuser()}>
              <Image
                src="/chat.svg"
                alt="chat"
                width={100}
                height={100}
                className="w-4 h-4"
              />
            </div>
          ) : (
            getButtonText()
          )}
        </button>
      </div>
    </>
  )
}

export const FriendSuggestions = () => {
  const { randomFriendsSuggestions } = useSearchStore()

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6">
      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 xl:mb-6 flex-shrink-0">
        Friend Suggestions
      </h3>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 sm:space-y-3 lg:space-y-4">
        {randomFriendsSuggestions.map((friend, index) => (
          <Friend user={friend} key={index} />
        ))}
      </div>
    </div>
  )
}
