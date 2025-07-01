// Profile Section Component
import Image from 'next/image'
import { useAuthStore } from '../../(zustand)/useAuthStore'

export const ProfileSection = () => {
  const { user, onlineUsers } = useAuthStore()
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
        <Image
          src={`/images/${user.avatar}`}
          alt="user profile"
          width={200}
          height={200}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-1 lg:mb-2 xl:mb-3">
          {user.username}
        </h2>
        <p className="text-green-400 font-medium mb-1 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
          {onlineUsers.includes(useAuthStore.getState().user?.email)
            ? 'online'
            : 'offline'}
        </p>
        <p className="text-gray-400 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
          @{user.login}
        </p>
      </div>
      <div className="bg-[#121417] border border-gray-700 px-3 sm:px-4 lg:px-5 xl:px-6 py-2 sm:py-3 lg:py-4 xl:py-5 w-full sm:w-[35%] lg:w-[30%] h-20 sm:h-24 lg:h-28 xl:h-32 2xl:h-36 rounded-xl flex flex-row items-center justify-between">
        <span className="text-gray-300 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl mr-2">
          Current Ranking
        </span>
        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white">
          #{user.level}
        </div>
      </div>
    </div>
  )
}
