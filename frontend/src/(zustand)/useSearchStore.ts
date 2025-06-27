import { Anybody } from 'next/font/google'
import { create } from 'zustand'
import { axiosInstance, useAuthStore } from './useAuthStore'

interface useSearch {
  searchedUsersGlobal: any
  setSearchedUsersGlobal: (data: any) => void
  searchedChatUsers: any
  setSearchedChatUsers: (data: any) => void
  userProfile: any | null
  setUserProfile: (data: any) => void
  randomFriendsSuggestions: any
  getRandomFriendsSuggestions: () => Promise<void>
}

export const useSearchStore = create<useSearch>((set, get) => ({
  userProfile: null,
  searchedUsersGlobal: [],
  setSearchedUsersGlobal: (searchedUsersGlobal) => {
    set({ searchedUsersGlobal })
  },
  setUserProfile: (data) => {
    set({ userProfile: data })
  },
  searchedChatUsers: [],
  setSearchedChatUsers: (searchedChatUsers) => {
    console.log('searchedChatUsers : ', searchedChatUsers)

    set({ searchedChatUsers })
  },
  randomFriendsSuggestions: [],
  setRandomFriendsSuggestion: (randomFriendsSuggestions) => {
    set({ randomFriendsSuggestions })
  },

  getRandomFriendsSuggestions: async () => {
    try {
      const { user } = useAuthStore.getState()
      const res = await axiosInstance.post('/api/users/getRandomFriends', {
        email: user.email,
      })
      set({ randomFriendsSuggestions: res.data.friends })
    } catch (err) {
      set({ randomFriendsSuggestions: [] })
      console.log(err)
    }
  },
}))
