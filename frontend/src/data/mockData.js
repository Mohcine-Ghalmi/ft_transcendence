export const user = {
  name: 'Mohcine Ghalmi',
  nickname: 'SLEEPS',
  avatar: '/mghalmi.jpg',
  status: 'Online',
  email: 'SLEEPS@example.com',
  level: 12,
  xp: 70,
  rank: 4,
}

export const matchHistory = [
  { date: '2023-11-15', opponent: 'Liam Parker', result: 'Win', score: '7-1' },
  {
    date: '2023-11-12',
    opponent: 'Sophia Evans',
    result: 'Loss',
    score: '1-7',
  },
  { date: '2023-11-09', opponent: 'Noah Walker', result: 'Win', score: '7-0' },
  {
    date: '2023-11-06',
    opponent: 'Olivia Bennett',
    result: 'Win',
    score: '7-1',
  },
  {
    date: '2023-11-03',
    opponent: 'Ethan Carter',
    result: 'Loss',
    score: '4-7',
  },
]

export let friendSuggestions = [
  {
    name: 'Liam Parker',
    status: 'Online',
    avatar: '/mghalmi.jpg',
    added: false,
  },
  {
    name: 'Sophia Evans',
    status: 'Offline',
    avatar: '/mghalmi.jpg',
    added: false,
  },
  {
    name: 'Noah Walker',
    status: 'Online',
    avatar: '/mghalmi.jpg',
    added: false,
  },
  {
    name: 'Olivia Bennett',
    status: 'Offline',
    avatar: '/mghalmi.jpg',
    added: false,
  },
  {
    name: 'Ethan Carter',
    status: 'Online',
    avatar: '/mghalmi.jpg',
    added: false,
  },
]

export const friends = [
  {
    name: 'Noah',
    status: 'Offline',
    avatar: '/mghalmi.jpg',
    nickname: 'noah123',
  },
  {
    name: 'Isabella',
    status: 'Online',
    avatar: '/mghalmi.jpg',
    nickname: 'isabella456',
  },
  { name: 'Ava', status: 'Online', avatar: '/mghalmi.jpg', nickname: 'ava789' },
]

export const onlineFriends = [
  {
    name: 'Sophia Clark',
    nickname: 'SLEEPS00',
    GameStatus: 'Available',
    avatar: '/mghalmi.jpg',
    email: 'sophia@example.com',
  },
  {
    name: 'Ethan Bennett',
    nickname: 'SLEEPS00',
    GameStatus: 'In a match',
    avatar: '/mghalmi.jpg',
    email: 'ethan@example.com',
  },
  {
    name: 'Olivia Carter',
    nickname: 'SLEEPS00',
    GameStatus: 'Available',
    avatar: '/mghalmi.jpg',
    email: 'olivia@example.com',
  },
  {
    name: 'Liam Davis',
    nickname: 'SLEEPS00',
    GameStatus: 'Available',
    avatar: '/mghalmi.jpg',
    email: 'liam@example.com',
  },
  {
    name: 'Ava Evans',
    nickname: 'SLEEPS00',
    GameStatus: 'In a match',
    avatar: '/mghalmi.jpg',
    email: 'ava@example.com',
  },
]

export const notifications = [
  {
    id: 1,
    type: 'friend_request',
    message: 'Liam Parker sent you a friend request',
    time: '2 minutes ago',
    unread: true,
  },
  {
    id: 2,
    type: 'match_invite',
    message: 'Sophia Evans invited you to a match',
    time: '15 minutes ago',
    unread: true,
  },
  {
    id: 3,
    type: 'achievement',
    message: 'You unlocked a new achievement!',
    time: '1 hour ago',
    unread: false,
  },
  {
    id: 4,
    type: 'tournament',
    message: 'Tournament starting in 30 minutes',
    time: '2 hours ago',
    unread: false,
  },
]

export const chartData = [
  { label: 'Week 1', value: 12 },
  { label: 'Week 2', value: 18 },
  { label: 'Week 3', value: 15 },
  { label: 'Week 4', value: 20 },
]

export const mockUsers = [
  {
    id: 1,
    name: 'Ethan Carter',
    avatar: '/mghalmi.jpg',
    active: true,
    nickname: 'ethan',
  },
  { id: 2, name: 'Sophia Clark', avatar: '/mghalmi.jpg', nickname: 'sophia' },
  { id: 3, name: 'Liam Walker', avatar: '/mghalmi.jpg', nickname: 'liam' },
  { id: 4, name: 'Olivia Martin', avatar: '/mghalmi.jpg', nickname: 'olivia' },
  { id: 5, name: 'Kevin Lewis', avatar: '/mghalmi.jpg', nickname: 'kevin' },
  { id: 6, name: 'Ava Scott', avatar: '/mghalmi.jpg', nickname: 'ava' },
  { id: 7, name: 'Jackson Evans', avatar: '/mghalmi.jpg', nickname: 'jackson' },
  { id: 8, name: 'Sophia Green', avatar: '/mghalmi.jpg', nickname: 'sophiag' },
  {
    id: 9,
    name: 'Isabella King',
    avatar: '/mghalmi.jpg',
    nickname: 'isabellak',
  },
  { id: 10, name: 'Mia Wright', avatar: '/mghalmi.jpg', nickname: 'mia' },
  { id: 11, name: 'Aiden Wright', avatar: '/mghalmi.jpg', nickname: 'aiden' },
]

export const mockMessages = [
  {
    id: 1,
    sender: 'Ethan Carter',
    avatar: '/mghalmi.jpg',
    text: 'Hey, can you sign up for a quick match?',
    time: '7:00 PM',
    mine: false,
  },
  {
    id: 2,
    sender: 'me',
    text: 'Sure.',
    time: '7:01 PM',
    mine: true,
  },
  {
    id: 3,
    sender: 'Ethan Carter',
    avatar: '/mghalmi.jpg',
    text: "Great! I'll send you an invite.",
    time: '7:02 PM',
    mine: false,
  },
  {
    id: 4,
    sender: 'me',
    text: 'Sounds ok.',
    time: '7:03 PM',
    mine: true,
  },
  {
    id: 5,
    sender: 'Ethan Carter',
    avatar: '/mghalmi.jpg',
    text: 'Invite sent. Check your notifications.',
    time: '7:04 PM',
    mine: false,
  },
  {
    id: 6,
    sender: 'me',
    text: (
      <div className="bg-[#23272e] rounded-xl p-4 flex flex-col items-center w-64">
        <div className="font-semibold mb-2">Ping Pong Match</div>
        <div className="flex gap-2 w-full">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1">
            Accept
          </button>
          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-1">
            Decline
          </button>
        </div>
      </div>
    ),
    time: '7:05 PM',
    mine: true,
    isInvite: true,
  },
]

export const MATCH_STATES = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  PLAYER1_WIN: 'player1_win',
  PLAYER2_WIN: 'player2_win',
}
