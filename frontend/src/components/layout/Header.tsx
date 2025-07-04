'use client'
import { useState, useEffect } from 'react'
import { notifications } from '../../data/mockData'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { NotificationDropdown } from './Notification'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/(zustand)/useAuthStore'

export const Navigation = ({
  navigationItems,
  activeTab,
  onNavClick,
  className = '',
}: {
  navigationItems: NavigationItem[]
  activeTab: string
  onNavClick: (label: string) => void
  className?: string
}) => {
  return (
    <nav className={`hidden md:flex items-center gap-1 lg:gap-2 ${className}`}>
      {navigationItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={() => onNavClick(item.label)}
          className={`px-3 py-2 rounded-lg transition-colors text-sm lg:text-base ${
            activeTab === item.label
              ? 'text-white font-medium bg-gray-800/50'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export const MobileMenu = ({
  navigationItems,
  activeTab,
  onNavClick,
}: {
  navigationItems: NavigationItem[]
  activeTab: string
  onNavClick: (label: string) => void
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleNavClick = (label: string): void => {
    onNavClick(label)
    setShowMobileMenu(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-400 hover:text-white p-1"
        onClick={() => setShowMobileMenu(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Mobile Menu */}
          <div className="fixed top-0 left-0 w-64 h-full bg-[#121417] border-r border-gray-700 z-50 md:hidden transform transition-transform">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/vector---0.svg"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <h2 className="text-white font-semibold">PingPong</h2>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => handleNavClick(item.label)}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.label
                        ? 'text-white font-medium bg-gray-800'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}

export const Header = () => {
  const { user } = useAuthStore()
  const navigationItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Play', href: '/play' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Chat', href: '/chat' },
  ]

  const pathname = usePathname()

  const getActiveTabFromPath = (currentPath: string) => {
    const matchedItem = navigationItems.find(
      (item) =>
        currentPath === item.href || currentPath.startsWith(item.href + '/')
    )
    return matchedItem?.label || 'Home'
  }

  const [activeTab, setActiveTab] = useState(() =>
    getActiveTabFromPath(pathname || '')
  )

  useEffect(() => {
    if (pathname) {
      const newActiveTab = getActiveTabFromPath(pathname)
      setActiveTab(newActiveTab)
    }
  }, [pathname])

  const handleNavClick = (label: string): void => {
    setActiveTab(label)
  }
  if (!user) return null

  return (
    <header className="h-[8vh] top-0 left-0 right-0 z-50 w-full bg-[#121417] border-b border-gray-700 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu */}
        <MobileMenu
          navigationItems={navigationItems}
          activeTab={activeTab}
          onNavClick={handleNavClick}
        />

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/vector---0.svg"
              alt="Logo"
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <h1 className="text-white font-semibold text-base sm:text-lg">
              PingPong
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <Navigation
          navigationItems={navigationItems}
          activeTab={activeTab}
          onNavClick={handleNavClick}
        />

        {/* Search and Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Search Bar */}
          <SearchBar />

          <NotificationDropdown notifications={notifications} className="" />

          {/* Profile Avatar */}
          <Link href="/profile">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image
                src={`/images/${user.avatar}`}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
