// Friend Suggestions Component (Refactored)
'use client'
import React from 'react'
import { useSearchStore } from '../../(zustand)/useSearchStore'
import { useAuthStore } from '../../(zustand)/useAuthStore'
import { useRouter } from 'next/navigation'
import { useFriend } from '../../utils/useFriend'

const Friend = ({ user }) => {
  const { onlineUsers } = useAuthStore()
  const router = useRouter()

  const {
    handleFriendAction,
    getButtonText,
    isButtonDisabled,
    handleChatWithUser,
  } = useFriend(user)

  if (!user) return null

  return (
    <div
      key={user.id}
      onClick={() => router.push(`/profile/${user.login}`)}
      className="flex items-center gap-2 flex-shrink-0 hover:bg-gray-900 cursor-pointer duration-500 p-2 rounded-2xl"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
        <img
          src={`/images/${user.avatar}`}
          alt={user.username}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base md:text-md text-white font-medium truncate">
          {user.username}
        </p>
        <p
          className={`sm:text-[8px] ${
            onlineUsers.includes(user.email)
              ? 'text-green-400'
              : 'text-gray-400'
          }`}
        >
          {onlineUsers.includes(user.email) ? 'Online' : 'Offline'}
        </p>
      </div>
      <button
        onClick={handleFriendAction}
        disabled={isButtonDisabled()}
        className={`py-1 px-2 text-xs rounded-2xl ${
          isButtonDisabled()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#334D66] cursor-pointer hover:bg-[#2a3d52]'
        }`}
      >
        {getButtonText() === 'Friends' ? (
          <div onClick={handleChatWithUser}>Chat</div>
        ) : (
          getButtonText()
        )}
      </button>
    </div>
  )
}

export const FriendSuggestions = () => {
  const { randomFriendsSuggestions } = useSearchStore()

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl xl:w-[30%] w-full">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 xl:mb-6 flex-shrink-0">
        Friend Suggestions
      </h3>
      <div className="h-[390px] space-y-2 sm:space-y-3 lg:space-y-4 bg-[#121417] border border-gray-500 p-4 rounded-2xl">
        {randomFriendsSuggestions.length > 0 ? (
          randomFriendsSuggestions.map((friend, index) => (
            <Friend user={friend} key={index} />
          ))
        ) : (
          <div className="border border-gray-500 rounded-xl min-h-[300px] flex items-center justify-center text-gray-500">
            no friends Suggestions
          </div>
        )}
      </div>
    </div>
  )
}

// Example: Another component that uses the same friend logic
export const UserCard = ({ user, showAvatar = true }) => {
  const {
    handleFriendAction,
    getButtonText,
    isButtonDisabled,
    handleChatWithUser,
  } = useFriend(user)

  return (
    <div className="p-4 border border-gray-600 rounded-lg">
      {showAvatar && (
        <img
          src={`/images/${user.avatar}`}
          alt={user.username}
          className="w-16 h-16 rounded-full mx-auto mb-2"
        />
      )}
      <h3 className="text-white text-center mb-2">{user.username}</h3>
      <button
        onClick={
          getButtonText() === 'Friends'
            ? handleChatWithUser
            : handleFriendAction
        }
        disabled={isButtonDisabled()}
        className={`w-full py-2 px-4 text-sm rounded-lg ${
          isButtonDisabled()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {getButtonText() === 'Friends' ? 'Chat' : getButtonText()}
      </button>
    </div>
  )
}

// Example: Friend list item component
export const FriendListItem = ({ user }) => {
  const { handleChatWithUser } = useFriend(user)

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <img
          src={`/images/${user.avatar}`}
          alt={user.username}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-white">{user.username}</span>
      </div>
      <button
        onClick={handleChatWithUser}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
      >
        Chat
      </button>
    </div>
  )
}
