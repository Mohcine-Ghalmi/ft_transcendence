type AppNotification = {
  id: number;
  type: string;
  avatar?: string;
  title: string;
  message: string;
  status?: string;
  unread?: boolean;
};

type HeaderProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notifications: AppNotification[];
};

type NavigationItem = {
  label: string;
  href: string;
};

interface PlayerInfo {
  id?: string;
  name: string;
  avatar: string;
  nickname: string;
}

interface PingPongGameProps {
  player1: any;
  player2: any;
  onExit: (winner?: any) => void;
  isTournamentMode?: boolean;
  // Remote game props
  gameId?: string;
  socket?: any;
  isHost?: boolean;
  opponent?: any;
}
