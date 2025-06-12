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
