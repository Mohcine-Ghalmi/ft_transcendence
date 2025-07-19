'use client'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function LeaderboardPage() {
  const [data, setData] = useState([])
  const { userDetails, getUserDetails } = useAuthStore()

  useEffect(() => {
    if (!userDetails) {
      getUserDetails()
    }
    setData(userDetails?.LeaderBoardData || [])
  }, [userDetails])
  return (
    <div className="min-h-[92vh] flex flex-col text-white items-center">
      <div className="grid w-[80%] overflow-y-auto">
        <div className="grid grid-cols-4 items-center bg-gray-800 border border-gray-700 w-full p-4 gap-6">
          <span className="text-center">ID</span>
          <span>User</span>
          <span className="text-center">Win Rate %</span>
          <span className="text-center">Total Games</span>
        </div>
        {data.length > 0 ? (
          data.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-4 items-center border border-gray-700 w-full p-4 gap-6"
            >
              <span className="text-center">{user.id}</span>
              <div className="flex items-center gap-2">
                <Image
                  src={`/images/${user.avatar}`}
                  alt="avatar"
                  width={1000}
                  height={1000}
                  className="w-14 h-14 object-cover rounded-full"
                />
                <h3 className="text-xl">{user.username}</h3>
              </div>
              <span className="text-center">
                {user.win_rate_percentage ? user.win_rate_percentage : 0}%
              </span>
              <span className="text-center">
                {user.total_games ? user.total_games : 0}
              </span>
            </div>
          ))
        ) : (
          <div>No Data Yet</div>
        )}
      </div>
    </div>
  )
}
