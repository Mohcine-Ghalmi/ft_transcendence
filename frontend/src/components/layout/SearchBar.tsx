// SearchBar Component
'use client'
import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const Notification = ({ user }) => {
  const [status, setStatus] = useState(user.status || '')
  const { user: me } = useAuthStore()

  if (!user) return null

  const handleClick = () => {
    if (!socketInstance) return

    switch (status) {
      case '':
        setStatus('PENDING')
        socketInstance.emit('addFriend', user.email)
        break

      case 'PENDING':
        if (!user.fromEmail) return
        if (user.fromEmail !== me.email) {
          setStatus('ACCEPTED')
          socketInstance.emit('acceptFriend', user.email)
        }
        break

      case 'REJECTED':
        if (!user.fromEmail) return
        setStatus('PENDING')
        socketInstance.emit('rejectFriend', user.email)
        break

      case 'ACCEPTED':
        // socketInstance.emit('removeFriend', user.email)
        // setStatus('')
        break

      default:
        break
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'PENDING':
        if (!user.fromEmail) return 'Invite Sent'
        return user.fromEmail === me.email ? 'Invite Sent' : 'Accept'
      case 'ACCEPTED':
        return 'Friends'
      case 'REJECTED':
        return 'rejected'
      default:
        return 'Add Friend'
    }
  }

  const isButtonDisabled = () => {
    return status === 'PENDING' && user.fromEmail === me.email
  }

  return (
    <div className="flex items-center justify-between px-2 py-4 border-b-1 border-[#334D66]">
      <div className="flex items-center">
        <Image
          src={user.avatar}
          alt="avatar"
          width={100}
          height={100}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="ml-2">
          <h3 className="text-xs">
            {user.username.length > 15
              ? user.username.substring(0, 15) + '...'
              : user.username}
          </h3>
          <span className="text-xs">
            {user.login.length > 15
              ? user.login.substring(0, 15) + '...'
              : user.login}
          </span>
        </div>
      </div>

      <button
        onClick={handleClick}
        disabled={isButtonDisabled()}
        className={`py-1 px-2 text-xs rounded-2xl ${
          isButtonDisabled()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#334D66] cursor-pointer hover:bg-[#2a3d52]'
        }`}
      >
        {getButtonText()}
      </button>
    </div>
  )
}

export const SearchBar = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { searchingForUsers, seachedUsers } = useAuthStore()

  const handleSearch = (query: string): void => {
    // Handle search logic here
    console.log('Searching for:', query)
    searchingForUsers(query)
  }

  return (
    <div className="relative">
      <div className={`flex items-center relative ${className}`}>
        <Search className="w-4 h-4 text-gray-400 absolute left-2 sm:left-3" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          className="pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm w-24 sm:w-32 md:w-48 lg:w-64 placeholder-gray-500 text-white"
        />
      </div>
      {seachedUsers.length > 0 && (
        <div className="border border-[#121A21] bg-[#121A21] overflow-y-auto h-[400px] w-full mt-2 rounded-xl absolute">
          {seachedUsers.map((user) => (
            <Notification key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
