import { useEffect, useState } from 'react'
import { useAuthStore } from '../../(zustand)/useAuthStore'
import { useGameInvite } from '../../app/(main)/play/OneVsOne/GameInviteProvider'
import { useRouter } from 'next/navigation'
import { challengePlayer, clearStaleInvitations } from '@/utils/challengeUtils'
import { toast } from 'react-toastify'

export const FriendsSection = () => {
  const { userDetails, onlineUsers, user } = useAuthStore()
  const { socket } = useGameInvite()
  const [friends, setFriends] = useState([])
  const [challengingFriends, setChallengingFriends] = useState(new Set()) // Track which friends are being challenged
  const router = useRouter()

  useEffect(() => {
    if (userDetails?.randomFriends?.length > 0) {
      setFriends(userDetails.randomFriends)
    }
  }, [userDetails])

  // Socket event listeners for game invite responses
  useEffect(() => {
    if (!socket) return

    const handleGameInviteDeclined = (data) => {
      const declinedByEmail = data.declinedBy || data.guestEmail

      if (declinedByEmail) {
        // Find the friend who declined
        const declinedFriend = friends.find(
          (friend) => friend.email === declinedByEmail
        )
        const friendName = declinedFriend?.username || declinedByEmail

        // Show toast notification
        toast.error(`${friendName} declined your challenge`)

        // Reset challenge button
        setChallengingFriends((prev) => {
          const newSet = new Set(prev)
          newSet.delete(declinedByEmail)
          return newSet
        })
      }
    }

    const handleGameInviteTimeout = (data) => {
      const guestEmail = data.guestEmail

      if (guestEmail) {
        // Find the friend who timed out
        const timeoutFriend = friends.find(
          (friend) => friend.email === guestEmail
        )
        const friendName =
          timeoutFriend?.username || data.guestName || guestEmail

        // Show toast notification
        toast.warning(`Challenge to ${friendName} timed out`)

        // Reset challenge button for this specific friend
        setChallengingFriends((prev) => {
          const newSet = new Set(prev)
          newSet.delete(guestEmail)
          return newSet
        })
      } else {
        // Fallback: reset all challenging states if no specific email
        setChallengingFriends(new Set())
        toast.warning('Game invitation timed out')
      }
    }

    const handleGameInviteCanceled = (data) => {
      // This handles when someone else cancels the invite
      toast.info('Game invitation was canceled')
      setChallengingFriends(new Set())
    }

    // Add event listeners
    socket.on('GameInviteDeclined', handleGameInviteDeclined)
    socket.on('GameInviteTimeout', handleGameInviteTimeout)
    socket.on('GameInviteCanceled', handleGameInviteCanceled)

    // Cleanup
    return () => {
      socket.off('GameInviteDeclined', handleGameInviteDeclined)
      socket.off('GameInviteTimeout', handleGameInviteTimeout)
      socket.off('GameInviteCanceled', handleGameInviteCanceled)
    }
  }, [socket, friends])

  // Clear stale invitations periodically
  useEffect(() => {
    const interval = setInterval(clearStaleInvitations, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleChallenge = async (friend) => {
    // Prevent multiple clicks for the same friend
    if (challengingFriends.has(friend.email)) {
      return
    }

    // Add friend to challenging set
    setChallengingFriends((prev) => new Set([...prev, friend.email]))

    try {
      const success = await challengePlayer(
        {
          email: friend.email,
          name: friend.username,
          username: friend.username,
          login: friend.login,
          avatar: friend.avatar,
        },
        socket,
        user,
        router,
        // Callback to handle status changes
        (email, status) => {
          if (status === 'idle') {
            setChallengingFriends((prev) => {
              const newSet = new Set(prev)
              newSet.delete(email)
              return newSet
            })
          }
        }
      )

      if (!success) {
        // Remove from challenging set if failed immediately
        setChallengingFriends((prev) => {
          const newSet = new Set(prev)
          newSet.delete(friend.email)
          return newSet
        })
      }
      // Note: Don't automatically remove on success - let the callback handle it
    } catch (error) {
      // Remove from challenging set on error
      setChallengingFriends((prev) => {
        const newSet = new Set(prev)
        newSet.delete(friend.email)
        return newSet
      })
    }
  }

  return (
    <div className="rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
        Friends
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {friends.length > 0 ? (
          friends.map((friend, index) => {
            const isOnline = onlineUsers.includes(friend.email)
            const isChallenging = challengingFriends.has(friend.email)
            const isDisabled = !isOnline || isChallenging

            return (
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
                      isOnline ? 'text-green-400' : 'text-gray-400'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
                <button
                  onClick={() => handleChallenge(friend)}
                  disabled={isDisabled}
                  className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-colors ${
                    isDisabled
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isChallenging ? 'Inviting...' : 'Challenge'}
                </button>
              </div>
            )
          })
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 bg-gray-800/30 rounded-xl p-2 sm:p-3 lg:p-4 border border-gray-700/30 justify-center">
            no friends Suggestions
          </div>
        )}
      </div>
    </div>
  )
}
