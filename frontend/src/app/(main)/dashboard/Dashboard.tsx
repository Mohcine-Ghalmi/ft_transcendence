'use client'
import { ProfileSection } from '../../../components/dashboard/ProfileSection'
import { GameModeCards } from '../../../components/dashboard/GameModeCards'
import { FriendsSection } from '../../../components/dashboard/FriendsSection'
import { StatisticsChart } from '../../../components/dashboard/StatisticsChart'
import { useEffect } from 'react'
import { useSearchStore } from '@/(zustand)/useSearchStore'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { MatchHistory } from '../../../components/dashboard/MatchHistory'

export default function PingPongDashboard() {
  const { getRandomFriendsSuggestions } = useSearchStore()
  const { getUserDetails, userDetails, user } = useAuthStore()

  const total = userDetails?.wins + userDetails?.losses
  const winRate = total ? ((userDetails?.wins / total) * 100).toFixed(1) : 0

  useEffect(() => {
    if (user?.email) {
      getUserDetails(user.email)
      getRandomFriendsSuggestions()
    }
  }, [user?.email])

  return (
    <div className="h-full text-white">
      {/* Main Dashboard Content */}
      <div className="flex items-center justify-center px-4 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Left Section */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <ProfileSection />
            <GameModeCards />
            <div className="flex w-full gap-4">
              <MatchHistory />
              {/* <FriendSuggestions /> */}
            </div>
            <FriendsSection />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <StatisticsChart
              title="Win/Loss Rate"
              value={`${winRate}%`}
              subtitle="Last 30 Days"
              chartType="line"
            />
            <StatisticsChart
              title="Matches Played"
              value={(userDetails?.wins + userDetails?.losses) | 0}
              subtitle="Last 30 Days"
              chartType="bar"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
