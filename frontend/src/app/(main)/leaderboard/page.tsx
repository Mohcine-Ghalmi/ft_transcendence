'use client'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState([])
  const { userDetails, getUserDetails } = useAuthStore()

  useEffect(() => {
    const getData = async () => {
      await getUserDetails(user.email)
    }
    getData()
  }, [])

  useEffect(() => {
    if (!userDetails) return
    setData(userDetails?.LeaderBoardData || [])
  }, [userDetails])

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return '🥇'
      case 1:
        return '🥈'
      case 2:
        return '🥉'
      default:
        return `#${index + 1}`
    }
  }

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600'
      case 1:
        return 'from-gray-300 to-gray-500'
      case 2:
        return 'from-amber-600 to-amber-800'
      default:
        return 'from-blue-500 to-blue-700'
    }
  }

  const getWinRateColor = (winRate) => {
    if (winRate >= 80) return 'text-green-400'
    if (winRate >= 60) return 'text-yellow-400'
    if (winRate >= 40) return 'text-orange-400'
    return 'text-red-400'
  }
  const router = useRouter()
  const handlVisitProfile = (username: string) => {
    router.push(`/profile/${username}`)
  }

  return (
    <div className="min-h-[92vh] bg-gradient-to-br text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {data.length > 0 ? (
            <div className="space-y-4">
              {data.length >= 3 && (
                <div className="hidden md:grid grid-cols-3 gap-4 mb-8">
                  <div
                    className="order-1 flex flex-col items-center cursor-pointer hover:scale-105 duration-500"
                    onClick={() => handlVisitProfile(data[1].login)}
                  >
                    <div className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-full p-2 mb-2 shadow-lg">
                      <span className="text-3xl">🥈</span>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 w-full text-center border border-gray-700">
                      <Image
                        src={`/images/${data[1].avatar}`}
                        alt="avatar"
                        width={80}
                        height={80}
                        className="w-16 h-16 object-cover rounded-full mx-auto mb-2 border-4 border-gray-400"
                      />
                      <h3 className="font-bold text-lg">{data[1].username}</h3>
                      <p
                        className={`text-2xl font-bold ${getWinRateColor(
                          data[1].win_rate_percentage || 0
                        )}`}
                      >
                        {data[1].win_rate_percentage || 0}%
                      </p>
                      <p className="text-gray-400 text-sm">
                        {data[1].total_games || 0} games
                      </p>
                    </div>
                  </div>

                  <div
                    className="order-2 flex flex-col items-center cursor-pointer hover:scale-105 duration-500"
                    onClick={() => handlVisitProfile(data[0].login)}
                  >
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-2 mb-2 shadow-xl animate-pulse">
                      <span className="text-4xl">👑</span>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur rounded-xl p-6 w-full text-center border border-yellow-400/50 shadow-xl">
                      <Image
                        src={`/images/${data[0].avatar}`}
                        alt="avatar"
                        width={100}
                        height={100}
                        className="w-20 h-20 object-cover rounded-full mx-auto mb-3 border-4 border-yellow-400"
                      />
                      <h3 className="font-bold text-xl text-yellow-400">
                        {data[0].username}
                      </h3>
                      <p
                        className={`text-3xl font-bold ${getWinRateColor(
                          data[0].win_rate_percentage || 0
                        )}`}
                      >
                        {data[0].win_rate_percentage || 0}%
                      </p>
                      <p className="text-gray-300 text-sm">
                        {data[0].total_games || 0} games
                      </p>
                    </div>
                  </div>

                  <div
                    className="order-3 flex flex-col items-center cursor-pointer hover:scale-105 duration-500"
                    onClick={() => handlVisitProfile(data[2].login)}
                  >
                    <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-full p-2 mb-2 shadow-lg">
                      <span className="text-3xl">🥉</span>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 w-full text-center border border-gray-700">
                      <Image
                        src={`/images/${data[2].avatar}`}
                        alt="avatar"
                        width={80}
                        height={80}
                        className="w-16 h-16 object-cover rounded-full mx-auto mb-2 border-4 border-amber-600"
                      />
                      <h3 className="font-bold text-lg">{data[2].username}</h3>
                      <p
                        className={`text-2xl font-bold ${getWinRateColor(
                          data[2].win_rate_percentage || 0
                        )}`}
                      >
                        {data[2].win_rate_percentage || 0}%
                      </p>
                      <p className="text-gray-400 text-sm">
                        {data[2].total_games || 0} games
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-800/30 backdrop-blur h-[85vh]  md:h-[60vh] overflow-y-auto rounded-xl border border-gray-700 shadow-xl">
                <div className="bg-gradient-to-r from-slate-900 via-stale-400 to-slate-900 px-6 py-4">
                  <div className="grid grid-cols-5 gap-4 font-bold text-white xl:text-md text-xs">
                    <span className="text-center">Rank</span>
                    <span className="col-span-2">Player</span>
                    <span className="text-center">Win Rate</span>
                    <span className="text-center">Games Played</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-700">
                  {data.map((user, index) => (
                    <div
                      key={user.id}
                      onClick={() => handlVisitProfile(user.login)}
                      className={`px-6 py-4 hover:bg-slate-700/50 transition-all cursor-pointer duration-200 ${
                        index < 3
                          ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/30'
                          : ''
                      }`}
                    >
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="text-center">
                          <span
                            className={`inline-flex items-center justify-center xl:w-10 xl:h-10 w-5 h-5 rounded-full bg-gradient-to-r ${getRankColor(
                              index
                            )} text-white font-bold text-xs xl:text-lg shadow-lg`}
                          >
                            {index < 3 ? getRankIcon(index) : index + 1}
                          </span>
                        </div>

                        <div className="col-span-2 flex items-center gap-3">
                          <Image
                            src={`/images/${user.avatar}`}
                            alt="avatar"
                            width={50}
                            height={50}
                            className="xl:w-12 xl:h-12 w-7 h-7 object-cover rounded-full border-2 border-gray-600"
                          />
                          <div>
                            <h3 className="font-semibold xl:text-lg text-xs">
                              {user.username}
                            </h3>
                            <p className="text-gray-400 xl:text-sm text-[8px]">
                              {user.login}
                            </p>
                          </div>
                        </div>

                        <div className="text-center">
                          <span
                            className={`xl:text-2xl text-xs font-bold ${getWinRateColor(
                              user.win_rate_percentage || 0
                            )}`}
                          >
                            {user.win_rate_percentage || 0}%
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="xl:text-lg text-xs font-semibold text-gray-300">
                            {user.total_games || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-2">No Champions Yet!</h2>
              <p className="text-gray-400">
                Start playing to see the leaderboard come alive!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
