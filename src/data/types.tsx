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
  name: string;
  avatar: string;
}

interface PingPongGameProps {
  player1: PlayerInfo;
  player2: PlayerInfo;
  onExit: () => void;
}
