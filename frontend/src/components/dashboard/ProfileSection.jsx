// Profile Section Component
import Image from 'next/image'
import { useAuthStore } from '../../(zustand)/useAuthStore'

export const ProfileSection = () => {
  const { user, onlineUsers } = useAuthStore()
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 bg-[#121417]/90 p-4 rounded-xl">
      <div className="w-24 h-24 sm:w-28 sm:h-28  bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
        <Image
          src={`/images/${user.avatar}`}
          alt="user profile"
          width={200}
          height={200}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
          {user.username}
        </h2>
        <p className="text-green-400 font-medium sm:text-xs">
          {onlineUsers.includes(useAuthStore.getState().user?.email)
            ? 'online'
            : 'offline'}
        </p>
        <p className="text-gray-400 text-sm sm:text-base lg:text-lg xl:text-xl">
          @{user.login}
        </p>
      </div>
      <div className="bg-[#121417] border border-gray-700 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4w-full sm:w-[35%] lg:w-[30%] h-20 sm:h-24  rounded-xl flex flex-row items-center justify-between">
        <span className="text-gray-300 text-sm sm:text-base lg:text-lg xl:text-xl mr-2">
          Current Ranking
        </span>
        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">
          #{user.level}
        </div>
      </div>
    </div>
  )
}
