import { useEffect, useState } from 'react'
import { useAuthStore } from '../../(zustand)/useAuthStore'
import { useGameInvite } from '../../app/(main)/play/OneVsOne/GameInviteProvider'
import { useRouter } from 'next/navigation'
import { challengePlayer } from '@/utils/challengeUtils'

export const FriendsSection = () => {
  const { userDetails, onlineUsers, user } = useAuthStore()
  const { socket } = useGameInvite()
  const [friends, setFriends] = useState([])
  const router = useRouter();

  useEffect(() => {
    if (userDetails?.randomFriends?.length > 0) {
      const formattedFriends = userDetails.randomFriends.map((friend) => ({
        name: friend.name,
        avatar: `/images/${friend.avatar}`,
        status: onlineUsers.includes(friend.email) ? 'Online' : 'Offline',
      }))
      setFriends(userDetails.randomFriends)
    }
  }, [userDetails])

  const handleChallenge = async (friend) => {
    await challengePlayer(
        {
          email: friend.email,
          name: friend.username,
          username: friend.username,
          login: friend.login,
          avatar: friend.avatar
        },
        socket,
        user,
        router,
      )
  }

  return (
    <div className="rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6">
      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
        Friends
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {friends.map((friend, index) => (
          <div
            key={index}
            className="flex items-center gap-2 sm:gap-3 lg:gap-4 bg-gray-800/30 rounded-xl p-2 sm:p-3 lg:p-4 border border-gray-700/30"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 group">
              <img
                src={`/images/${friend.avatar}`}
                alt={friend.email}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                {friend.username}
              </p>
              <p
                className={`text-xs sm:text-sm lg:text-base xl:text-lg ${
                  onlineUsers.includes(friend.email)
                    ? 'text-green-400'
                    : 'text-gray-400'
                }`}
              >
                {onlineUsers.includes(friend.email) ? 'Online' : 'Offline'}
              </p>
            </div>
            <button 
              onClick={() => handleChallenge(friend)}
              disabled={!onlineUsers.includes(friend.email)}
              className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-colors ${
                onlineUsers.includes(friend.email)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Challenge
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
