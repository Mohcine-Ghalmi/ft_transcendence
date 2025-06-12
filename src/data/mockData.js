export const user = {
  name: 'Mohcine Ghalmi',
  username: 'SLEEPS',
  avatar: '/mghalmi.jpg',
  status: 'Online',
  email: 'SLEEPS@example.com',
  level: 12,
  xp: 70,
  rank: 4
};

export const matchHistory = [
    { date: '2023-11-15', opponent: 'Liam Parker', result: 'Win', score: '2-1' },
    { date: '2023-11-12', opponent: 'Sophia Evans', result: 'Loss', score: '1-2' },
    { date: '2023-11-09', opponent: 'Noah Walker', result: 'Win', score: '2-0' },
    { date: '2023-11-06', opponent: 'Olivia Bennett', result: 'Win', score: '2-1' },
    { date: '2023-11-03', opponent: 'Ethan Carter', result: 'Loss', score: '0-2' },
  ];

export let friendSuggestions = [
    { name: 'Liam Parker', status: 'Online', avatar: '/mghalmi.jpg', added: false },
    { name: 'Sophia Evans', status: 'Offline', avatar: '/mghalmi.jpg', added: false },
    { name: 'Noah Walker', status: 'Online', avatar: '/mghalmi.jpg', added: false },
    { name: 'Olivia Bennett', status: 'Offline', avatar: '/mghalmi.jpg', added: false },
    { name: 'Ethan Carter', status: 'Online', avatar: '/mghalmi.jpg', added: false },
  ];

export const friends = [
    { name: 'Noah', status: 'Offline', avatar: '/mghalmi.jpg' },
    { name: 'Isabella', status: 'Online', avatar: '/mghalmi.jpg' },
    { name: 'Ava', status: 'Online', avatar: '/mghalmi.jpg' },
  ];

export const notifications = [
    { id: 1, type: 'friend_request', message: 'Liam Parker sent you a friend request', time: '2 minutes ago', unread: true },
    { id: 2, type: 'match_invite', message: 'Sophia Evans invited you to a match', time: '15 minutes ago', unread: true },
    { id: 3, type: 'achievement', message: 'You unlocked a new achievement!', time: '1 hour ago', unread: false },
    { id: 4, type: 'tournament', message: 'Tournament starting in 30 minutes', time: '2 hours ago', unread: false },
  ];

export const chartData = [
    { label: 'Week 1', value: 12 },
    { label: 'Week 2', value: 18 },
    { label: 'Week 3', value: 15 },
    { label: 'Week 4', value: 20 }
  ];