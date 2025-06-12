// Profile Section Component
import Image from "next/image";
import {user} from "../../data/mockData"

export const ProfileSection = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
        <Image
          src={user.avatar}
          alt={user.name}
          width={200}
          height={200}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{user.name}</h2>
        <p className="text-green-400 font-medium mb-1">{user.status}</p>
        <p className="text-gray-400 text-sm">@{user.username}</p>
      </div>
      <div className="bg-[#121417] border border-gray-700 px-4 sm:px-6 py-2 sm:py-3 w-[30%] h-24 rounded-xl flex flex-row items-center justify-between">
        <span className="text-gray-300 text-xs sm:text-2xl mr-2">Current Ranking</span>
        <div className="text-xs sm:text-2xl font-bold text-white">#{user.rank}</div>
      </div>
    </div>
  );
};