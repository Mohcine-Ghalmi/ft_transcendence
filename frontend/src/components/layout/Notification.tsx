import { useAuthStore } from '@/(zustand)/useAuthStore'
import { Bell, Check, MessageCircle, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export const NotificationItem = ({
  notification,
  onAction,
}: {
  notification: AppNotification | any
  onAction: (id: string | number, action: string) => void
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
      case 'game_invitation':
        return null // Will show user avatar
      case 'tournament':
        return (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
          </div>
        )
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-400" />
      default:
        return null
    }
  }

  const getNotificationStatus = () => {
    if (notification.status === 'accepted') {
      return <Check className="w-5 h-5 text-green-400" />
    }
    return null
  }

  const handleAction = (action: 'accept' | 'decline') => {
    onAction(notification.id, action)
  }

  return (
    <div
      className={`p-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 transition-colors ${
        notification.unread ? 'bg-gray-800/20' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar or Icon */}
        <div className="flex-shrink-0">
          {notification.avatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={notification.avatar}
                alt="User avatar"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            getNotificationIcon(notification.type)
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Status Icon */}
            <div className="ml-2 flex-shrink-0">{getNotificationStatus()}</div>
          </div>

          {/* Action Buttons */}
          {(notification.type === 'friend_request' ||
            notification.type === 'game_invitation') &&
            notification.status !== 'accepted' &&
            notification.status !== 'declined' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAction('accept')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleAction('decline')}
                  className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-colors"
                >
                  Decline
                </button>
              </div>
            )}

          {/* Status Text for accepted notifications */}
          {notification.status === 'accepted' && (
            <div className="mt-2">
              <span className="text-green-400 text-xs font-medium bg-green-400/10 px-2 py-1 rounded-md">
                Accepted
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const NotificationDropdown = ({
  notifications,
  className = '',
}: {
  notifications: AppNotification[] | any
  className: string
}) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter((n) => n.unread).length
  const { logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const handleNotificationAction = (id: string | number, action: string) => {
    // Handle notification actions here
    console.log(`${action} notification ${id}`)
    // You can add logic to update the notification status
    // or make API calls here
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {/* logout */}
      <button className="mx-4 cursor-pointer" onClick={() => handleLogout()}>
        <Image
          src="/logout.svg"
          alt="logout"
          width={100}
          height={100}
          className="w-4 h-4"
        />
      </button>
      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 md:hidden z-40"
            onClick={() => setShowNotifications(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-[#1a1d21] border border-gray-700 rounded-xl shadow-2xl z-50">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white text-lg">
                Notifications
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="md:hidden text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onAction={handleNotificationAction}
                />
              ))}
            </div>
            <div className="p-3 border-t border-gray-700">
              <button className="text-blue-400 text-sm hover:underline">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
