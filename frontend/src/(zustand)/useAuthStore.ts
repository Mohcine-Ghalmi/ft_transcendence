import axios, { type AxiosError } from 'axios'
import { create } from 'zustand'
import { toast } from 'react-toastify'
import { io, Socket } from 'socket.io-client'
import { jwtDecode } from 'jwt-decode'
import { signOut } from 'next-auth/react'
import CryptoJs from 'crypto-js'
import { useSearchStore } from './useSearchStore'
import { useChatStore } from './useChatStore'

const BACK_END = process.env.NEXT_PUBLIC_BACKEND
const FRON_END = process.env.NEXT_PUBLIC_FRONEND

export const axiosInstance = axios.create({
  baseURL: BACK_END,
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      (error.response?.status === 401 ||
        error.status === 401 ||
        error.status === 403) &&
      window.location.href !== `${FRON_END}/`
    ) {
      const disconnectSocket = useAuthStore.getState().disconnectSocket
      disconnectSocket()
      localStorage.removeItem('accessToken')
      window.location.href = `${FRON_END}/`
    }
    return Promise.reject(error)
  }
)

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
  googleLogin: (data: any) => Promise<void>
  notifications: any | null
  setNotifations: () => void
  seachedUsers: any
  setIsLoading: (data: boolean) => void
  setUser: (user: any) => void
  changePassword: (data: {
    oldPassword: string
    newPassword: string
  }) => Promise<boolean>
  hidePopUp: boolean
  setHidePopUp: (data: boolean) => void
}

export const useAuthStore = create<UserState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  socketConnected: false,
  onlineUsers: [],
  notifications: null,
  seachedUsers: [],
  hidePopUp: false,

  setHidePopUp: (data: boolean) => {
    set({ hidePopUp: data })
  },

  setUser: (user) => {
    set({ user })
  },
  setNotifations: () => {
    set({ notifications: null })
  },
  setIsLoading: (data) => {
    set({ isLoading: data })
  },
  checkAuth: async () => {
    return true
    // set({ isLoading: true })
    // try {
    //   const res = await axiosInstance.get('/api/users/getMe')
    //   const { user } = res.data
    //   set({ user, isAuthenticated: true })
    //   get().connectSocket()
    //   return true
    // } catch (err) {
    //   console.error('Auth check failed:', err)
    //   set({ user: null, isAuthenticated: false })
    //   return false
    // } finally {
    //   set({ isLoading: false })
    // }
  },

  googleLogin: async (data: any): Promise<void> => {
    if (get().user) return Promise.resolve()
    set({ isLoading: true })

    try {
      const byte = CryptoJs.AES.encrypt(
        JSON.stringify(data),
        process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
      )
      const res = await axios.post(`/api/login`, data)

      if (res?.status === 200) {
        const { accessToken, ...user } = res.data
        localStorage.setItem('accessToken', accessToken)
        set({ user, isAuthenticated: true })
        toast.success('Login successful!')
      } else {
        toast.warning(res.data?.message || 'Login failed')
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Login failed'
      toast.error(errorMessage)
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
      const { ...user } = res.data
      // localStorage.setItem('accessToken', accessToken)
      set({ user, isAuthenticated: true })
      get().connectSocket()
      window.location.href = `${FRON_END}/dashboard`
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
      const res = await axiosInstance.post(`/api/users/changePassword`, data)
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
      // const hasTwoFAres = await axiosInstance.post(
      //   `/api/users/verify-hasTwoFA`,
      //   data.email
      // )
      // if (hasTwoFAres?.data?.isTwoFAVerified) {
      //   toast.warning(
      //     'You have two-factor authentication enabled. Please verify your OTP.'
      //   )
      //   return false
      // }
      const res = await axiosInstance.post(`/v2/api/users/login`, data)
      if (!res.data) {
        toast.warning('Login failed')
        return false
      }
      const { status, ...user } = res.data
      if (status) {
        set({ user, isAuthenticated: true })
        get().connectSocket()
        window.location.href = `${FRON_END}/dashboard`
      } else {
        console.log(res.data)
        if (res.data.desc === '2FA verification required') {
          get().setHidePopUp(true)
          return false
        }
        return false
      }

      return true
    } catch (err: any) {
      toast.warning(err.response?.data?.message || err.message)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post(`/api/users/logout`)
      if (res?.status === 200) {
        toast.success('Logout successful!')
      } else {
        toast.warning(res.data?.message || 'Logout failed')
      }
      get().disconnectSocket()
    } catch (err) {
      console.error('Logout failed:', err)
      toast.warning('Logout failed')
    }
    // set({ user: null, isAuthenticated: false, isLoading: false })
    // signOut({ callbackUrl: `${FRON_END}/` })
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
      socketInstance.disconnect()
    }
    const cryptedMail = CryptoJs.AES.encrypt(
      user.email,
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
    )
    socketInstance = io(BACK_END, {
      withCredentials: true,
      reconnection: false,
      query: { cryptedMail },
    })

    const onConnect = () => {
      set({ socketConnected: true })
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
    }

    const onNewMessageNotification = (notifications: any) => {
      set({ notifications })
      setTimeout(() => set({ notifications: null }), 10000)
    }

    const onsearchResults = (seachedUsers: any) => {
      set({ seachedUsers })
    }

    const onaddFriendResponse = (data: any) => {
      if (data.status === 'error') {
        toast.warning(data.message)
      } else {
        if (data?.desc) {
          const { searchedUsersGlobal, setSearchedUsersGlobal } =
            useSearchStore.getState()

          const updatedUsers = searchedUsersGlobal.map((tmp) =>
            tmp.email === data.hisEmail
              ? { ...tmp, status: data.desc, fromEmail: data.hisEmail }
              : tmp
          )
          console.log('searchedUsersGlobal : ', searchedUsersGlobal)

          console.log('updatedUsers : ', updatedUsers)
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
    socketInstance.on('newMessageNotification', onNewMessageNotification)
    socketInstance.on('error-in-connection', (data) => {
      console.log('Socket connection error:', data)

      toast.error(data.message || 'Socket connection error')
      get().disconnectSocket()
      get().logout()
    })
  },

  disconnectSocket: () => {
    if (socketInstance) {
      socketInstance.off('connect')
      socketInstance.off('disconnect')
      socketInstance.off('connect_error')
      socketInstance.off('getOnlineUsers')
      socketInstance.off('newMessageNotification')
      socketInstance.off('error-in-connection')
      socketInstance.off('InviteToGameResponse')

      socketInstance.off('searchResults')
      socketInstance.off('friendResponse')

      socketInstance.disconnect()
      socketInstance = null
      set({ socketConnected: false })
    }
  },
}))

// Export socket instance for direct access if needed
export const getSocketInstance = () => socketInstance
