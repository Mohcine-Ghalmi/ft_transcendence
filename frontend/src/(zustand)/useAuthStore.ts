import axios, { type AxiosError } from 'axios'
import { create } from 'zustand'
import { toast } from 'react-toastify'
import { io, Socket } from 'socket.io-client'
import { jwtDecode } from 'jwt-decode'
// import { signOut } from 'next-auth/react'
import CryptoJs from 'crypto-js'
import { useSearchStore } from './useSearchStore'
import { useChatStore } from './useChatStore'
import { useGameStore } from './useGameStore'

const FRONT_END = process.env.NEXT_PUBLIC_FRONTEND

export const axiosInstance = axios.create({
  baseURL: `/api/user-service`,
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
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

      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        userDetails: null,
        notifications: [],
        onlineUsers: [],
      })

      localStorage.removeItem('accessToken')

      window.location.href = `${FRONT_END}/`
    }
    return Promise.reject(error)
  }
)

interface UserDetails {
  LeaderBoardData: [
    {
      id: number
      username: string
      email: string
      avatar: string
      login: string
      total_games: number
      win_rate_percentage: number
    }
  ]
  randomFriends: [
    {
      email: string
      username: string
      avatar: string
      login: string
      fromEmail: string
      toEmail: string
      status: string
    }
  ]
  matchHistory: any[]
  chartData: { label: string; wins: number; losses: number }[]
  wins: number
  losses: number
}

export let socketInstance: Socket | null = null

interface UserState {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  socketConnected: boolean
  onlineUsers: string[] // lasdj@gmail.com asdasd@gaialcom
  checkAuth: () => Promise<boolean>
  register: (data: any) => Promise<boolean>
  login: (data: any) => Promise<boolean>
  logout: () => Promise<void>
  connectSocket: () => void
  disconnectSocket: () => void
  // googleLogin: (data: any) => Promise<void>
  notifications: any
  setNotifations: (data: any) => void
  seachedUsers: any
  setIsLoading: (data: boolean) => void
  setUser: (user: any) => void
  getUser: () => Promise<void>
  changePassword: (data: {
    oldPassword: string
    newPassword: string
  }) => Promise<boolean>
  hidePopUp: boolean
  setHidePopUp: (data: boolean) => void
  userDetails: UserDetails | null
  setUserDetails: (data: UserDetails) => void
  getUserDetails: (email: string) => Promise<void>
  hasStoredToken: () => boolean
}

export const useAuthStore = create<UserState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  socketConnected: false,
  onlineUsers: [],
  notifications: [],
  seachedUsers: [],
  hidePopUp: false,
  userDetails: null,

  setUserDetails: (data: UserDetails) => {
    set({ userDetails: data })
  },

  getUserDetails: async (email: string) => {
    try {
      const res = await axiosInstance.post('/users/getUserDetails', {
        email,
      })
      const data: UserDetails = res.data
      get().setUserDetails(data)
    } catch (err) {
      console.log(err)
    }
  },

  setHidePopUp: (data: boolean) => {
    set({ hidePopUp: data })
  },

  setUser: (user) => {
    set({ user })
  },
  setNotifations: (data) => {
    set({ notifications: data })
  },
  setIsLoading: (data) => {
    set({ isLoading: data })
  },
  getUser: async () => {
    try {
      const res = await axiosInstance.get('/users/me')
      get().setUser(res.data.user)
    } catch (err) {
      get().setUser(null)
      get().logout()
      console.log(err)
    }
  },
  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        set({ user: null, isAuthenticated: false })
        return false
      }

      const res = await axiosInstance.get('/users/getMe')
      const { user } = res.data
      if (user) {
        set({ user, isAuthenticated: true })
        get().connectSocket()
        return true
      }
      return false
    } catch (err) {
      console.error('Auth check failed:', err)
      set({ user: null, isAuthenticated: false })
      localStorage.removeItem('accessToken')
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (data: any) => {
    set({ isLoading: true })
    try {
      const byte = CryptoJs.AES.encrypt(
        JSON.stringify(data),
        process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
      )
      const res = await axiosInstance.post(`/v2/api/users/register`, data)
      console.log(res)

      if (!res.data) {
        toast.warning('Registration failed')
        return false
      }
      const { accessToken, ...user } = res.data

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
      }

      set({ user, isAuthenticated: true })
      get().connectSocket()
      return true
    } catch (err: any) {
      console.log(err)

      toast.warning(err.response?.data?.message || err.message)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  changePassword: async (data: {
    oldPassword: string
    newPassword: string
  }) => {
    set({ isLoading: true })
    try {
      const res = await axiosInstance.post(`/users/changePassword`, data)
      if (res?.status === 200) {
        toast.success('Password changed successfully!')
        return true
      } else {
        toast.warning(res.data?.message || 'Password change failed')
        return false
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Password change failed'
      toast.error(errorMessage)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (data: any) => {
    set({ isLoading: true })
    try {
      const byte = CryptoJs.AES.encrypt(
        JSON.stringify(data),
        process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
      )
      const res = await axiosInstance.post(`/v2/api/users/login`, data)
      console.log(res.data)

      const { status, accessToken, ...user } = res.data
      if (!status) {
        get().setHidePopUp(true)
        return false
      } else if (status) {
        localStorage.setItem('accessToken', accessToken)
        set({ user, isAuthenticated: true })
        get().connectSocket()
        return true
      }
    } catch (err: any) {
      console.log(err)
      toast.warning(err.response?.data?.message || err.message)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post(`/users/logout`)
      if (res?.status === 200) {
        toast.success('Logout successful!')
      } else {
        toast.warning(res.data?.message || 'Logout failed')
      }
    } catch (err) {
      console.error('Logout failed:', err)
      toast.warning('Logout failed')
    } finally {
      get().disconnectSocket()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        userDetails: null,
        notifications: [],
        onlineUsers: [],
      })
      localStorage.removeItem('accessToken')
      window.location.href = `${FRONT_END}/`
    }
  },

  connectSocket: () => {
    if (socketInstance?.connected) return
    const { user } = get()

    if (!user) return

    if (socketInstance) {
      socketInstance.off('connect')
      socketInstance.off('disconnect')
      socketInstance.off('connect_error')
      socketInstance.off('getOnlineUsers')
      useGameStore.getState().disconnectSocket()
      socketInstance.disconnect()
    }
    const cryptedMail = CryptoJs.AES.encrypt(
      user.email,
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
    )

    socketInstance = io('/', {
      path: '/user-service/socket.io',
      withCredentials: true,
      reconnection: false,
      query: { cryptedMail },
    })

    const onConnect = () => {
      set({ socketConnected: true })
      useGameStore.getState().connectSocket()
    }

    const onOnlineUsers = (onlineUsers: string[]) => {
      set({ onlineUsers })
    }

    const onDisconnect = () => {
      set({ socketConnected: false })
    }

    const onConnectError = (err: Error) => {
      console.log('Socket connection error:', err.message)
      set({ socketConnected: false })
      get().logout()
    }

    const onNewNotification = (notifications: any) => {
      const currentNotifications = get().notifications || []

      switch (notifications.type) {
        case 'message':
          const newNotification = {
            message: notifications.message,
            type: 'message',
            senderEmail: notifications.sender.email,
            avatar: notifications.sender.avatar,
            userId: notifications.sender.id,
            senderUsername: notifications.sender.username,
            senderLogin: notifications.sender.login,
          }

          const filteredNotifications = currentNotifications.filter(
            (n) => !(n.type === 'message')
          )

          set({
            notifications: [newNotification, ...filteredNotifications],
          })
          break
        case 'friend_request':
          const friendNotification = {
            message: notifications.message,
            type: 'friend_request',
            desc: notifications?.desc,
            senderEmail: notifications.senderEmail,
          }
          console.log('friendNotification : ', friendNotification)

          if (friendNotification?.desc) {
            const {
              searchedUsersGlobal,
              setSearchedUsersGlobal,
              randomFriendsSuggestions,
              setRandomFriendsSuggestion,
            } = useSearchStore.getState()

            const updatedUsers =
              searchedUsersGlobal.length > 0
                ? searchedUsersGlobal.map((tmp) =>
                    tmp.email === friendNotification.senderEmail
                      ? {
                          ...tmp,
                          status: friendNotification.desc,
                          fromEmail: friendNotification.senderEmail,
                        }
                      : tmp
                  )
                : []
            const updatedUsersRandom =
              randomFriendsSuggestions.length > 0
                ? randomFriendsSuggestions.map((tmp) =>
                    tmp.email === friendNotification.senderEmail
                      ? {
                          ...tmp,
                          status: friendNotification.desc,
                          fromEmail: friendNotification.senderEmail,
                        }
                      : tmp
                  )
                : []
            console.log('searchedUsersGlobal : ', searchedUsersGlobal)

            console.log('updatedUsers : ', updatedUsers)
            setRandomFriendsSuggestion(updatedUsersRandom)
            setSearchedUsersGlobal(updatedUsers)
          }

          set({
            notifications: [friendNotification, ...currentNotifications],
          })
          break
        default:
          break
      }
    }

    const onsearchResults = (seachedUsers: any) => {
      set({ seachedUsers })
    }

    const onaddFriendResponse = (data: any) => {
      if (data.status === 'error') {
        toast.warning(data.message)
      } else {
        if (data?.desc) {
          const {
            searchedUsersGlobal,
            setSearchedUsersGlobal,
            randomFriendsSuggestions,
            setRandomFriendsSuggestion,
          } = useSearchStore.getState()

          const updatedUsers =
            searchedUsersGlobal.length > 0
              ? searchedUsersGlobal.map((tmp) =>
                  tmp.email === data.hisEmail
                    ? { ...tmp, status: data.desc, fromEmail: data.hisEmail }
                    : tmp
                )
              : []

          const updatedUsersRandom =
            randomFriendsSuggestions.length > 0
              ? randomFriendsSuggestions.map((tmp) =>
                  tmp.email === data.hisEmail
                    ? { ...tmp, status: data.desc, fromEmail: data.hisEmail }
                    : tmp
                )
              : []
          console.log('searchedUsersGlobal : ', searchedUsersGlobal)

          console.log('updatedUsers : ', updatedUsers)
          setRandomFriendsSuggestion(updatedUsersRandom)
          setSearchedUsersGlobal(updatedUsers)
        }
        toast.success(data.message)
      }
    }

    const onBlockResponse = (data) => {
      get().setIsLoading(false)
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

    socketInstance.on('connect', onConnect)
    socketInstance.on('getOnlineUsers', onOnlineUsers)
    socketInstance.on('disconnect', onDisconnect)
    socketInstance.on('connect_error', onConnectError)
    //
    socketInstance.on('searchResults', onsearchResults)
    socketInstance.on('friendResponse', onaddFriendResponse)
    socketInstance.on('blockResponse', onBlockResponse)

    //
    socketInstance.on('newNotification', onNewNotification)
    socketInstance.on('error-in-connection', (data) => {
      console.log('Socket connection error:', data)

      toast.error(data.message || 'Socket connection error')
      get().disconnectSocket()
      get().logout()
    })
  },

  disconnectSocket: () => {
    useGameStore.getState().disconnectSocket()
    if (socketInstance) {
      socketInstance.off('connect')
      socketInstance.off('disconnect')
      socketInstance.off('connect_error')
      socketInstance.off('getOnlineUsers')
      socketInstance.off('newNotification')
      socketInstance.off('error-in-connection')
      socketInstance.off('InviteToGameResponse')

      socketInstance.off('searchResults')
      socketInstance.off('friendResponse')

      socketInstance.disconnect()
      socketInstance = null
      set({ socketConnected: false })
    }
  },

  hasStoredToken: () => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('accessToken')
  },
}))

export const getSocketInstance = () => socketInstance
