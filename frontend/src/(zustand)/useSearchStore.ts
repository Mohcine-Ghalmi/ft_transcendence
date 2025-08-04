import { create } from 'zustand'
import { axiosInstance, useAuthStore } from './useAuthStore'
import { toast } from 'react-toastify'

interface useSearch {
  searchedUsersGlobal: any
  setSearchedUsersGlobal: (data: any) => void
  searchedChatUsers: any
  setSearchedChatUsers: (data: any) => void
  userProfile: any | null
  setUserProfile: (data: any) => void
  randomFriendsSuggestions: any
  getRandomFriendsSuggestions: () => Promise<void>
  setRandomFriendsSuggestion: (data: any) => void
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
    set({ searchedChatUsers })
  },
  randomFriendsSuggestions: [],
  setRandomFriendsSuggestion: (randomFriendsSuggestions) => {
    set({ randomFriendsSuggestions })
  },

  getRandomFriendsSuggestions: async () => {
    try {
      const { user } = useAuthStore.getState()
      const res = await axiosInstance.post('/users/getRandomFriends', {
        email: user.email,
      })
      set({ randomFriendsSuggestions: res.data.friends })
    } catch (err: any) {
      set({ randomFriendsSuggestions: [] })
      toast.warning('Error fetching random friends suggestions:', err.message)
    }
  },
}))
