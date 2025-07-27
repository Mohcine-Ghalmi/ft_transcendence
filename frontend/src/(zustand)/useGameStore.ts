import axios, { type AxiosError } from 'axios'
import { create } from 'zustand'
import { toast } from 'react-toastify'
import { io, Socket } from 'socket.io-client'
import { jwtDecode } from 'jwt-decode'
// import { signOut } from 'next-auth/react'
import CryptoJs from 'crypto-js'
import { useSearchStore } from './useSearchStore'
import { useChatStore } from './useChatStore'
import { useAuthStore } from './useAuthStore'

const BACK_END = 'http://localhost:5007'
const FRONT_END = process.env.NEXT_PUBLIC_FRONEND

export const axiosGameInstance = axios.create({
  baseURL: `${BACK_END}`,
  withCredentials: true,
})

axiosGameInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosGameInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      (error.response?.status === 401 ||
        error.status === 401 ||
        error.status === 403) &&
      window.location.href !== `${FRONT_END}/`
    ) {
      const disconnectSocket = useAuthStore.getState().disconnectSocket
      disconnectSocket()
      localStorage.removeItem('accessToken')
      window.location.href = `${FRONT_END}/`
    }
    return Promise.reject(error)
  }
)

export let gameSocketInstance: Socket | null = null

interface UserState {
  socketConnected: boolean
  connectSocket: () => void
  disconnectSocket: () => void
}

export const useGameStore = create<UserState>()((set, get) => ({
  socketConnected: false,

  connectSocket: () => {
    if (gameSocketInstance?.connected) return
    const { user } = useAuthStore.getState()

    if (!user) return

    if (gameSocketInstance) {
      gameSocketInstance.off('connect')
      gameSocketInstance.off('disconnect')
      gameSocketInstance.off('connect_error')
      gameSocketInstance.off('getOnlineUsers')
      gameSocketInstance.disconnect()
    }
    const cryptedMail = CryptoJs.AES.encrypt(
      user.email,
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
    )
    gameSocketInstance = io(BACK_END, {
      withCredentials: true,
      reconnection: false,
      query: { cryptedMail },
    })

    const onConnect = () => {
      set({ socketConnected: true })
    }

    const onDisconnect = () => {
      set({ socketConnected: false })
    }

    const onConnectError = (err: Error) => {
      console.log('Socket connection error:', err.message)
      set({ socketConnected: false })
    }

    const onaddFriendResponse = (data: any) => {
      if (data.status === 'error') {
        toast.warning(data.message)
      } else {
        if (data?.desc) {
          const { searchedUsersGlobal, setSearchedUsersGlobal } =
            useSearchStore.getState()
          const { randomFriendsSuggestions, setRandomFriendsSuggestion } =
            useSearchStore.getState()

          const updatedUsers = searchedUsersGlobal.map((tmp) =>
            tmp.email === data.hisEmail
              ? { ...tmp, status: data.desc, fromEmail: data.hisEmail }
              : tmp
          )
          const updatedUsersRandom = randomFriendsSuggestions.map((tmp) =>
            tmp.email === data.hisEmail
              ? { ...tmp, status: data.desc, fromEmail: data.hisEmail }
              : tmp
          )
          console.log('searchedUsersGlobal : ', searchedUsersGlobal)

          console.log('updatedUsers : ', updatedUsers)
          setRandomFriendsSuggestion(updatedUsersRandom)
          setSearchedUsersGlobal(updatedUsers)
        }
        toast.success(data.message)
      }
    }

    const onBlockResponse = (data) => {
      if (data.status === 'error') {
        toast.warning(data.message)
        return
      }

      const { chatHeader, setChatHeader } = useChatStore.getState()
      const { userProfile, setUserProfile } = useSearchStore.getState()

      if (
        data.hisEmail === chatHeader?.email ||
        data.hisEmail === userProfile?.email
      ) {
        chatHeader &&
          'isBlockedByMe' in data &&
          setChatHeader({ ...chatHeader, isBlockedByMe: data.isBlockedByMe })
        userProfile &&
          'isBlockedByMe' in data &&
          setUserProfile({ ...userProfile, isBlockedByMe: data.isBlockedByMe })
      }

      if (data.hisEmail === useAuthStore.getState().user.email) {
        chatHeader &&
          'isBlockedByHim' in data &&
          setChatHeader({ ...chatHeader, isBlockedByHim: data.isBlockedByHim })
        userProfile &&
          'isBlockedByHim' in data &&
          setUserProfile({
            ...userProfile,
            isBlockedByHim: data.isBlockedByHim,
          })
      }
    }

    gameSocketInstance.on('connect', onConnect)
    gameSocketInstance.on('disconnect', onDisconnect)
    gameSocketInstance.on('connect_error', onConnectError)
    //
    gameSocketInstance.on('friendResponse', onaddFriendResponse)
    gameSocketInstance.on('blockResponse', onBlockResponse)

    //
    gameSocketInstance.on('error-in-connection', (data) => {
      console.log('Socket connection error:', data)

      toast.error(data.message || 'Socket connection error')
      get().disconnectSocket()
    })
  },

  disconnectSocket: () => {
    if (gameSocketInstance) {
      gameSocketInstance.off('connect')
      gameSocketInstance.off('disconnect')
      gameSocketInstance.off('connect_error')
      gameSocketInstance.off('error-in-connection')
      gameSocketInstance.off('InviteToGameResponse')

      gameSocketInstance.off('searchResults')
      gameSocketInstance.off('friendResponse')

      gameSocketInstance.disconnect()
      gameSocketInstance = null
      set({ socketConnected: false })
    }
  },
}))

export const getGameSocketInstance = () => gameSocketInstance
