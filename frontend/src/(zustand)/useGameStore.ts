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

const FRONT_END = process.env.NEXT_PUBLIC_FRONTEND

export const axiosGameInstance = axios.create({
  // baseURL: `${BACK_END}`,
  baseURL: '/api/game-service',
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
  forceDisconnect: () => void
  isGameSocketConnected: () => boolean
}

export const useGameStore = create<UserState>()((set, get) => ({
  socketConnected: false,

  connectSocket: () => {
    if (gameSocketInstance?.connected) {
      return
    }

    const { user } = useAuthStore.getState()
    if (!user) {
      return
    }

    if (gameSocketInstance) {
      gameSocketInstance.removeAllListeners()
      gameSocketInstance.off('connect')
      gameSocketInstance.off('disconnect')
      gameSocketInstance.off('connect_error')
      gameSocketInstance.off('reconnect')
      gameSocketInstance.off('reconnecting')
      gameSocketInstance.off('reconnect_error')
      gameSocketInstance.off('reconnect_failed')
      gameSocketInstance.off('getOnlineUsers')
      gameSocketInstance.disconnect()
      gameSocketInstance = null
    }
    const cryptedMail = CryptoJs.AES.encrypt(
      user.email,
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
    )

    gameSocketInstance = io('/', {
      path: '/game-service/socket.io',
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 60000,
      forceNew: true,
      transports: ['websocket', 'polling'],
      query: { cryptedMail },
    })

    const onConnect = () => {
      set({ socketConnected: true })
    }

    const onDisconnect = (reason: string) => {
      set({ socketConnected: false })
    }

    const onConnectError = (err: Error) => {
      set({ socketConnected: false })
    }

    const onReconnect = (attemptNumber: number) => {
      set({ socketConnected: true })
    }

    const onReconnecting = (attemptNumber: number) => {}

    const onReconnectError = (err: Error) => {}

    const onReconnectFailed = () => {
      set({ socketConnected: false })
      toast.error('Unable to connect to game service. Please refresh the page.')
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
    gameSocketInstance.on('reconnect', onReconnect)
    gameSocketInstance.on('reconnecting', onReconnecting)
    gameSocketInstance.on('reconnect_error', onReconnectError)
    gameSocketInstance.on('reconnect_failed', onReconnectFailed)
    //
    gameSocketInstance.on('friendResponse', onaddFriendResponse)
    gameSocketInstance.on('blockResponse', onBlockResponse)

    //
    gameSocketInstance.on('error-in-connection', (data) => {
      console.error('Game socket error-in-connection:', data.message)
      toast.error(data.message || 'Socket connection error')
      get().forceDisconnect()
    })
  },

  disconnectSocket: () => {
    if (gameSocketInstance) {
      set({ socketConnected: false })

      gameSocketInstance.off('connect')
      gameSocketInstance.off('disconnect')
      gameSocketInstance.off('connect_error')
      gameSocketInstance.off('reconnect')
      gameSocketInstance.off('reconnecting')
      gameSocketInstance.off('reconnect_error')
      gameSocketInstance.off('reconnect_failed')
      gameSocketInstance.off('error-in-connection')
      gameSocketInstance.off('InviteToGameResponse')
      gameSocketInstance.off('searchResults')
      gameSocketInstance.off('friendResponse')
      gameSocketInstance.off('blockResponse')

      gameSocketInstance.removeAllListeners()
      gameSocketInstance.disconnect()

      gameSocketInstance = null
    }
  },

  forceDisconnect: () => {
    if (gameSocketInstance) {
      set({ socketConnected: false })

      gameSocketInstance.io.reconnection(false)

      gameSocketInstance.removeAllListeners()

      gameSocketInstance.disconnect()

      gameSocketInstance = null
      console.log('Game socket force disconnected and cleared')
    }
  },

  isGameSocketConnected: () => {
    return gameSocketInstance?.connected || false
  },
}))

export const getGameSocketInstance = () => gameSocketInstance
