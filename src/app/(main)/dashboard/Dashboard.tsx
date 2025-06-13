"use client"
import { matchHistory, friends, friendSuggestions } from "../../../data/mockData";
import { ProfileSection } from "../../../components/dashboard/ProfileSection";
import { GameModeCards } from "../../../components/dashboard/GameModeCards";
import { MatchHistory } from "../../../components/dashboard/MatchHistory";
import { FriendsSection } from "../../../components/dashboard/FriendsSection";
import { FriendSuggestions } from "../../../components/dashboard/FriendSuggestions";
import { StatisticsChart } from "../../../components/dashboard/StatisticsChart";


export default function PingPongDashboard() {
  return (
    <div className="h-full text-white">

      {/* Main Dashboard Content */}
      <main className="pt-20 p-3 sm:p-4 lg:p-6 w-full min-h-screen">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Section */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <ProfileSection />
            <GameModeCards />
            <MatchHistory matchHistory={matchHistory} />
            <FriendsSection friends={friends} />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <FriendSuggestions friendSuggestions={friendSuggestions} />
            <StatisticsChart 
              title="Win/Loss Rate" 
              value="60%" 
              subtitle="Last 30 Days" 
              chartType="line" 
            />
            <StatisticsChart 
              title="Matches Played" 
              value="20" 
              subtitle="Last 30 Days" 
              chartType="bar" 
            />
          </div>
        </div>
      </main>
    </div>
  );
}