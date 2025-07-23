import { create } from 'zustand'
import { useAuthStore } from './useAuthStore'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'react-toastify'
import CryptoJs from 'crypto-js'
import axios from 'axios'

const FRON_END = process.env.NEXT_PUBLIC_FRONEND
const BACK_END = 'http://localhost:5006'

export const axiosChatInstance = axios.create({
  baseURL: BACK_END,
  withCredentials: true,
})

axiosChatInstance.interceptors.request.use(
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

axiosChatInstance.interceptors.response.use(
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

interface ChatStoreType {
  conversations: any[]
  chatHeader: any
  selectedConversation: any
  selectedConversationId: number | undefined
  isLoading: boolean
  pageNumber: number
  getConversations: () => Promise<void>
  getMessage: (id: number, offset: number) => Promise<void>
  handleNewMessage: (newMessage: any) => void
  handleChangeConversations: (newConversation: any) => void
  setSelectedConversationId: (id: number | undefined) => void
  setSearchedUsers: (conversations: any[]) => void
  connectChatSocket: () => void
  disconnectChatSocket: () => void
  setConversations: (data: any) => void
  setChatHeader: (data: any) => void
  tmp: (data: any) => void
  isChatSocketConnected: boolean
  setIsChatSocketConnected: (value: boolean) => void
}

export let chatSocket: Socket | null = null

export const useChatStore = create<ChatStoreType>()((set, get) => ({
  conversations: [],
  chatHeader: null,
  selectedConversation: null,
  pageNumber: 0,
  isLoading: true,
  selectedConversationId: undefined,
  isChatSocketConnected: false,

  tmp: (data) => {
    set({ selectedConversation: data })
  },
  setIsChatSocketConnected: (value: boolean) => {
    set({ isChatSocketConnected: value })
  },
  setConversations: (data: any) => {
    set({ conversations: data })
  },
  setChatHeader: (data: any) => {
    set({ chatHeader: data })
  },

  setSearchedUsers: (conversations: any[]) => {
    set({ conversations })
  },
  setSelectedConversationId: (id: number | undefined) => {
    set({ selectedConversationId: id })
  },
  getConversations: async () => {
    set({ isLoading: true })
    try {
      const res = await axiosChatInstance.get('/api/chat/getFriends')

      set({ conversations: res.data })

      set({ isLoading: false })
    } catch (err: any) {
      console.log(err)
      set({ isLoading: false })
    }
  },

  getMessage: async (id: number, offset: number) => {
    set({ isLoading: true })
    try {
      const res = await axiosChatInstance.get(`/api/chat/${id}/${offset}`)
      const user = useAuthStore.getState().user
      set({
        selectedConversation:
          offset === 0
            ? res.data.conversation.reverse()
            : [
                ...res.data.conversation.reverse(),
                ...get().selectedConversation,
              ],
      })
      const friend =
        user.email === res.data.friend[0].userA.email
          ? res.data.friend[0].userB
          : res.data.friend[0].userA
      console.log('friend : ', friend)

      set({ chatHeader: friend })
      if (id !== undefined && chatSocket && offset === 0) {
        const myId = user.id
        const selectedConversation = get().selectedConversation
        const whoSentTheLastMessage =
          selectedConversation &&
          selectedConversation[selectedConversation.length - 1]
            ? selectedConversation[selectedConversation.length - 1].sender.id
            : null
        if (myId !== whoSentTheLastMessage)
          chatSocket.emit('seenMessage', { myId, id })
      }
      set({ isLoading: false })
    } catch (err: any) {
      console.log(err)
      toast.warning(
        err.response?.data?.message || 'Please Refresh or try again later'
      )
      set({ isLoading: false })
    }
  },

  handleNewMessage: (newMessage: any) => {
    console.log('newMessage : ', newMessage)

    if (!newMessage) return

    const { selectedConversationId, selectedConversation } = get()
    const user = useAuthStore.getState().user
    const myId = user.id

    const isFromOtherUser = newMessage.sender.id !== myId
    const isCurrentChat =
      selectedConversationId === newMessage.sender.id ||
      selectedConversationId === newMessage.receiver.id

    if (isFromOtherUser && isCurrentChat && chatSocket) {
      chatSocket.emit('seenMessage', { myId, id: selectedConversationId })
    }

    if (selectedConversationId) {
      set({
        selectedConversation: selectedConversation.filter(
          (conv: any) => conv.isSending !== true
        ),
      })
    }

    if (
      (myId === newMessage.sender.id || myId === newMessage.receiver.id) &&
      (selectedConversationId === newMessage.receiver.id ||
        selectedConversationId === newMessage.sender.id)
    ) {
      set({
        selectedConversation: [...get().selectedConversation, newMessage],
      })
    }
  },

  handleChangeConversations: (newConversation: any) => {
    console.log('newConversation : ', newConversation)

    set({ conversations: newConversation })
  },

  connectChatSocket: () => {
    if (chatSocket?.connected) return
    const user = useAuthStore.getState().user

    if (!user) return

    if (chatSocket) {
      chatSocket.off('connect')
      chatSocket.off('disconnect')
      chatSocket.off('connect_error')
      chatSocket.disconnect()
    }

    const cryptedMail = CryptoJs.AES.encrypt(
      user.email,
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
    )

    chatSocket = io(`${BACK_END}/chat`, {
      withCredentials: true,
      reconnection: false,
      query: { cryptedMail },
    })
    set({ isChatSocketConnected: true })

    const onMessagesSeenUpdate = (data: any) => {
      const selectedConversation = get().selectedConversation
      if (selectedConversation?.length > 0) {
        const lastMessage =
          selectedConversation[selectedConversation?.length - 1]
        if (
          (data.conversationWith === lastMessage.receiver.id ||
            data.conversationWith === lastMessage.sender.id) &&
          lastMessage?.seen
        )
          return
      }
      set({
        selectedConversation:
          selectedConversation &&
          selectedConversation.map((item: any) => ({
            ...item,
            seen: true,
          })),
      })
      //
      set({
        conversations: get().conversations?.map((item) =>
          item.sender.id === data.conversationWith ||
          item.receiver.id === data.conversationWith
            ? { ...item, seen: true }
            : { ...item }
        ),
      })
    }

    const onConnect = () => {
      console.log('connected to chat')
    }

    const onDisconnect = () => {
      set({ isChatSocketConnected: false })
    }

    const onConnectError = (err: Error) => {
      toast.warning('Failed To Connect To the Chat Server')
      setTimeout(() => {
        window.location.href = `${FRON_END}/`
      }, 2000)
    }

    chatSocket.on('connect', onConnect)
    chatSocket.on('messagesSeenUpdate', onMessagesSeenUpdate)
    chatSocket.on('disconnect', onDisconnect)
    chatSocket.on('connect_error', onConnectError)
  },

  disconnectChatSocket: () => {
    if (chatSocket) {
      set({ isChatSocketConnected: false })
      chatSocket.off('connect')
      chatSocket.off('disconnect')
      chatSocket.off('sendMessage')
      chatSocket.off('connect_error')
      chatSocket.disconnect()
      chatSocket = null
    }
  },
}))
