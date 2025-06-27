// SearchBar Component
'use client'
import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { chatSocket, useChatStore } from '@/(zustand)/useChatStore'
import { useSearchStore } from '@/(zustand)/useSearchStore'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const Notification = ({ user }) => {
  const [status, setStatus] = useState(user.status || '')
  const { user: me, onlineUsers } = useAuthStore()
  const { setSelectedConversationId } = useChatStore()
  const router = useRouter()

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

  const handleChatWithuser = () => {
    setSelectedConversationId(user.id)
    router.push('/chat')
  }

  useEffect(() => {
    setStatus(user.status || '')
  }, [user.status])

  return (
    <div className="flex items-center justify-between px-2 py-4 border-b-1 border-[#334D66]">
      <div className="flex items-center">
        <div className="relative">
          <Image
            src={`/images/${user.avatar}`}
            alt="avatar"
            width={100}
            height={100}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div
            className={`${
              onlineUsers.includes(user.email) ? 'bg-green-400' : 'bg-red-400'
            } w-2 h-2 rounded-full  border-[#293038] absolute top-0 right-0`}
          ></div>
        </div>
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
        {getButtonText() === 'Friends' ? (
          <div onClick={() => handleChatWithuser()}>
            <Image
              src="/chat.svg"
              alt="chat"
              width={100}
              height={100}
              className="w-4 h-4"
            />
          </div>
        ) : (
          getButtonText()
        )}
      </button>
    </div>
  )
}

export const SearchBar = () => {
  const [search, setSearch] = useState('')
  const { user } = useAuthStore()
  const {
    searchedUsersGlobal: searchedUsers,
    setSearchedUsersGlobal: setSearchedUsers,
  } = useSearchStore()
  const [isSearching, setIsSearching] = useState(false)

  const handleChatSearch = async () => {
    if (!search.trim()) return
  }

  useEffect(() => {
    if (!socketInstance) return

    setIsSearching(true)

    const setsearchedUsersData = async (searchedUsers) => {
      const data = await searchedUsers
      if (data.length > 0) setSearchedUsers(data)
      else setSearchedUsers([])
    }

    const searchForUsers = async () => {
      setSearchedUsers([])

      if (!search.trim()) return
      socketInstance.emit('searchingForUsers', search.trim())
    }

    const timeoutId = setTimeout(() => {
      searchForUsers()
      setIsSearching(false)
    }, 300)
    if (socketInstance) {
      socketInstance.on('searchResults', setsearchedUsersData)
      socketInstance.on('error-in-search', (err) => {
        toast.warning(err)
      })

      return () => {
        clearTimeout(timeoutId)
        if (socketInstance) {
          socketInstance.off('searchingInFriends', setsearchedUsersData)
          socketInstance.off('error-in-search')
        }
      }
    }
  }, [search, socketInstance, user.email])

  const handleUserClick = (id: number) => {
    setSearch('')
    setSearchedUsers([])
  }

  return (
    <div className="relative">
      <div className="flex items-center relative  m-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-2 sm:left-3" />
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleChatSearch()}
          className="pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm w-full placeholder-gray-500 text-white"
        />
      </div>
      {/* searched users */}
      {isSearching ? (
        <div className="absolute w-full z-10 h-[500px] overflow-y-auto animate-fade-up duration-700">
          <div className="w-[95%] items-center mx-auto bg-[#0b1014] rounded-2xl flex flex-col gap-4 p-2">
            <div className="w-[20px] h-[20px] xl:w-[35px] xl:h-[35px] flex items-center gap-4 justify-center">
              Searching <i className="animate-spin fa-solid fa-spinner"></i>
            </div>
          </div>
        </div>
      ) : (
        searchedUsers.length > 0 && (
          <div className="absolute w-full z-10 h-[500px] overflow-y-auto animate-fade-up duration-700">
            <div className="w-[95%] mx-auto bg-[#0b1014] rounded-2xl flex flex-col gap-4 p-2">
              {searchedUsers.map((user) => (
                <Notification key={user.id} user={user} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
