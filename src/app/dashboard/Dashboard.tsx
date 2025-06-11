// Header.jsx
"use client"
import { useState } from 'react';
import { Search, Bell } from 'lucide-react';

const Header = ({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery,
  notifications 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigationTabs = ['Home', 'Play', 'Leaderboard', 'Settings', 'Chat'];
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <header className="bg-[#1A1F26] border-b border-gray-800 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <h1 className="text-white font-semibold text-lg">PingPong</h1>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigationTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    activeTab === tab
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-base w-72 placeholder-gray-500"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <NotificationsDropdown 
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* Profile Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
              <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </>
  );
};

// NotificationsDropdown.jsx
const NotificationsDropdown = ({ notifications, onClose }) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-[#1A1F26] border border-gray-700 rounded-xl shadow-2xl z-50">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold text-white">Notifications</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
              notification.unread ? 'bg-gray-800/30' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                notification.unread ? 'bg-blue-500' : 'bg-gray-600'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-white">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-700">
        <button className="text-blue-400 text-sm hover:underline">
          View all notifications
        </button>
      </div>
    </div>
  );
};

// ProfileSection.jsx
const ProfileSection = ({ user }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 2xl:gap-12">
      <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
        <img src="/api/placeholder/96/96" alt={user.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
        <p className="text-green-400 font-medium mb-1">{user.status}</p>
        <p className="text-gray-400 text-sm">@{user.username}</p>
      </div>
      <div className="bg-gray-800/50 border border-gray-700/50 px-6 py-3 rounded-xl">
        <span className="text-gray-300 text-sm">Current Ranking</span>
        <div className="text-2xl font-bold text-white">#{user.ranking}</div>
      </div>
    </div>
  );
};

// GameModeCards.jsx
const GameModeCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-12">
      {/* Play 1v1 Card */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 relative overflow-hidden h-48">
        <div className="relative z-10">
          <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium inline-block mb-4">
            Play 1v1
          </div>
        </div>
        <div className="absolute bottom-6 right-6 transform rotate-12">
          <div className="w-16 h-10 bg-black/30 rounded-full relative">
            <div className="absolute inset-1 bg-black/50 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-6 bg-orange-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Tournament Card */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 relative overflow-hidden h-48">
        <div className="relative z-10">
          <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium inline-block mb-4">
            Tournament
          </div>
        </div>
        <div className="absolute bottom-6 right-6">
          <div className="w-12 h-8 bg-black/30 rounded border-b-4 border-black/40 relative">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black/40 rounded"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-cyan-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// MatchHistory.jsx
const MatchHistory = ({ matchHistory }) => {
  return (
    <div className="bg-[#1A1F26] rounded-2xl p-6 2xl:p-12 border border-gray-800/50">
      <h3 className="text-xl 2xl:text-3xl font-bold text-white mb-6">Match History</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] 2xl:min-w-[900px]">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="text-left py-3 font-medium">Date</th>
              <th className="text-left py-3 font-medium">Opponent</th>
              <th className="text-left py-3 font-medium">Result</th>
              <th className="text-left py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {matchHistory.map((match, index) => (
              <tr key={index} className="border-t border-gray-800/50">
                <td className="py-4 text-gray-400 text-sm">{match.date}</td>
                <td className="py-4 text-white font-medium">{match.opponent}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    match.result === 'Win' 
                      ? 'bg-green-900/50 text-green-400 border border-green-800' 
                      : 'bg-red-900/50 text-red-400 border border-red-800'
                  }`}>
                    {match.result}
                  </span>
                </td>
                <td className="py-4 text-white font-mono">{match.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// FriendsSection.jsx
const FriendsSection = ({ friends }) => {
  return (
    <div className="bg-[#1A1F26] rounded-2xl p-6 2xl:p-12 border border-gray-800/50">
      <h3 className="text-xl 2xl:text-3xl font-bold text-white mb-6">Friends</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 2xl:gap-8 max-h-[400px] 2xl:max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2">
        {friends.map((friend, index) => (
          <div key={index} className="flex items-center gap-3 bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{friend.name}</p>
              <p className={`text-xs ${
                friend.status === 'Online' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {friend.status}
              </p>
            </div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Challenge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// FriendSuggestions.jsx
const FriendSuggestions = ({ friendSuggestions }) => {
  return (
    <div className="bg-[#1A1F26] rounded-2xl p-6 2xl:p-12 border border-gray-800/50">
      <h3 className="text-lg 2xl:text-2xl font-bold text-white mb-4">Friend Suggestions</h3>
      <div className="space-y-4 max-h-[350px] 2xl:max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2">
        {friendSuggestions.map((friend, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{friend.name}</p>
              <p className={`text-xs ${
                friend.status === 'Online' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {friend.status}
              </p>
            </div>
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                friend.added 
                  ? 'bg-green-900/50 text-green-400 border border-green-800' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              disabled={friend.added}
            >
              {friend.added ? 'Friend added' : 'Add Friend'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// WinLossRate.jsx
const WinLossRate = () => {
  const chartPath = "M 10 60 Q 30 40 50 50 Q 70 30 90 35 Q 110 45 130 25 Q 150 35 170 20 Q 190 30 210 15";

  return (
    <div className="bg-[#1A1F26] rounded-2xl p-6 2xl:p-12 border border-gray-800/50">
      <h3 className="text-lg 2xl:text-2xl font-bold text-white mb-2">Win/Loss Rate</h3>
      <div className="text-4xl 2xl:text-6xl font-bold text-white mb-1">60%</div>
      <p className="text-gray-400 text-sm 2xl:text-lg mb-6">Last 30 Days</p>
      
      {/* Chart with SVG */}
      <div className="h-24 2xl:h-40 mb-4 relative">
        <svg className="w-full h-full" viewBox="0 0 220 80">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={chartPath + " L 210 80 L 10 80 Z"}
            fill="url(#chartGradient)"
          />
          <path
            d={chartPath}
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs 2xl:text-lg text-gray-400">
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Week 3</span>
        <span>Week 4</span>
      </div>
    </div>
  );
};

// MatchesPlayed.jsx
const MatchesPlayed = () => {
  const weeklyMatches = [12, 18, 15, 20];

  return (
    <div className="bg-[#1A1F26] rounded-2xl p-6 2xl:p-12 border border-gray-800/50">
      <h3 className="text-lg 2xl:text-2xl font-bold text-white mb-2">Matches Played</h3>
      <div className="text-4xl 2xl:text-6xl font-bold text-white mb-1">20</div>
      <p className="text-gray-400 text-sm 2xl:text-lg mb-6">Last 30 Days</p>
      
      {/* Bar Chart */}
      <div className="h-24 2xl:h-40 flex items-end justify-between gap-2 2xl:gap-4 mb-4">
        {weeklyMatches.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-gray-600 rounded-t-sm transition-all duration-300 hover:bg-gray-500"
              style={{ height: `${(value / 20) * 80}px` }}
            ></div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs 2xl:text-lg text-gray-400">
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Week 3</span>
        <span>Week 4</span>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function PingPongDashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const user = {
    name: 'Ethan Carter',
    status: 'Online',
    username: 'Sleeps',
    ranking: 5
  };

  const matchHistory = [
    { date: '2023-11-15', opponent: 'Liam Parker', result: 'Win', score: '2-1' },
    { date: '2023-11-12', opponent: 'Sophia Evans', result: 'Loss', score: '1-2' },
    { date: '2023-11-09', opponent: 'Noah Walker', result: 'Win', score: '2-0' },
    { date: '2023-11-06', opponent: 'Olivia Bennett', result: 'Win', score: '2-1' },
    { date: '2023-11-03', opponent: 'Ethan Carter', result: 'Loss', score: '0-2' },
  ];

  const friendSuggestions = [
    { name: 'Liam Parker', status: 'Online', avatar: '/api/placeholder/40/40', added: false },
    { name: 'Sophia Evans', status: 'Offline', avatar: '/api/placeholder/40/40', added: false },
    { name: 'Noah Walker', status: 'Online', avatar: '/api/placeholder/40/40', added: true },
    { name: 'Olivia Bennett', status: 'Offline', avatar: '/api/placeholder/40/40', added: false },
    { name: 'Ethan Carter', status: 'Online', avatar: '/api/placeholder/40/40', added: false },
  ];

  const friends = [
    { name: 'Noah', status: 'Offline', avatar: '/api/placeholder/40/40' },
    { name: 'Isabella', status: 'Online', avatar: '/api/placeholder/40/40' },
    { name: 'Ava', status: 'Online', avatar: '/api/placeholder/40/40' },
  ];

  const notifications = [
    { id: 1, type: 'friend_request', message: 'Liam Parker sent you a friend request', time: '2 minutes ago', unread: true },
    { id: 2, type: 'match_invite', message: 'Sophia Evans invited you to a match', time: '15 minutes ago', unread: true },
    { id: 3, type: 'achievement', message: 'You unlocked a new achievement!', time: '1 hour ago', unread: false },
    { id: 4, type: 'tournament', message: 'Tournament starting in 30 minutes', time: '2 hours ago', unread: false },
  ];

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications}
      />

      <main className="p-2 sm:p-4 lg:p-8 xl:p-16 2xl:p-24 max-w-[1920px] 2xl:max-w-[2560px] mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 2xl:gap-12">
          {/* Left Section */}
          <div className="xl:col-span-2 space-y-6 2xl:space-y-12">
            <ProfileSection user={user} />
            <GameModeCards />
            <MatchHistory matchHistory={matchHistory} />
            <FriendsSection friends={friends} />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 2xl:space-y-12">
            <FriendSuggestions friendSuggestions={friendSuggestions} />
            <WinLossRate />
            <MatchesPlayed />
          </div>
        </div>
      </main>
    </div>
  );
}