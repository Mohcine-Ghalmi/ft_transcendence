import { Anybody } from 'next/font/google'
import { create } from 'zustand'

interface useSearch {
  searchedUsersGlobal: any
  setSearchedUsersGlobal: (data: any) => void
  searchedChatUsers: any
  setSearchedChatUsers: (data: any) => void
  userProfile: any | null
  setUserProfile: (data: any) => void
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
}))
