// SearchBar Component
'use client'
import { socketInstance } from '@/(zustand)/useAuthStore'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const Notification = (data) => {
  return (
    <div className="flex items-center justify-between px-2 py-4 border-b-1 border-[#334D66]">
      <div className="flex items-center">
        <Image
          src="/mghalmi.jpg"
          alt="avatar"
          width={100}
          height={100}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="ml-2">
          <h3 className="text-xs">Mohamed Sarda</h3>
          <span className="text-xs">online</span>
        </div>
      </div>
      <button className="bg-[#334D66] py-1 px-2 text-xs cursor-pointer rounded-2xl">
        Accept
      </button>
    </div>
  )
}

export const SearchBar = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string): void => {
    // Handle search logic here
    console.log('Searching for:', query)
    if (!socketInstance) return

    socketInstance.emit('searchingForUsers', { query })
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
      <div className="border border-[#121A21] bg-[#121A21] overflow-y-auto h-[400px] w-full mt-2 rounded-xl absolute">
        <Notification />
        <Notification />
        <Notification />
        <Notification />
        <Notification />
        <Notification />
        <Notification />
        <Notification />
        <Notification />
      </div>
    </div>
  )
}
