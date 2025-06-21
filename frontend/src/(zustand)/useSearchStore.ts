import { create } from 'zustand'

interface useSearch {
  searchedUsersGlobal: any
  setSearchedUsersGlobal: (data: any) => void
  searchedChatUsers: any
  setSearchedChatUsers: (data: any) => void
}

export const useSearchStore = create<useSearch>((set, get) => ({
  searchedUsersGlobal: [],
  setSearchedUsersGlobal: (searchedUsersGlobal) => {
    set({ searchedUsersGlobal })
  },

  searchedChatUsers: [],
  setSearchedChatUsers: (searchedChatUsers) => {
    console.log('searchedChatUsers : ', searchedChatUsers)

    set({ searchedChatUsers })
  },
}))
