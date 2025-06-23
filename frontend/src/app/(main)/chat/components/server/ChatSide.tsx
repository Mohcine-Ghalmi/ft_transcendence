import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'
import { formatDate } from '../LeftSide'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { useChatStore } from '@/(zustand)/useChatStore'

export const EmptyChat = ({ text }: { text: string }) => {
  const { chatHeader, selectedConversation } = useChatStore()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#121417] rounded-2xl border-[#293038] border">
      {selectedConversation && chatHeader && chatHeader.status === 'BLOCKED' ? (
        <>
          <Image
            src="/slash-block.svg"
            alt="empty Chat"
            width={100}
            height={100}
            className="w-[15%]"
          />
          <h2 className="text-xs xl:text-2xl py-5 text-center">Blocked</h2>
        </>
      ) : (
        <>
          <Image
            src="/emptyChat.svg"
            alt="empty Chat"
            width={100}
            height={100}
            className="w-[15%]"
          />
          <h2 className="text-xs xl:text-2xl py-5 text-center">
            Welcome to Your Conversations
          </h2>
          <p className="text-[8px] xl:text-xl text-gray-400 w-[70%] text-center">
            {text}
          </p>
        </>
      )}
    </div>
  )
}

export const ConversationContainer = () => {
  const { user } = useAuthStore()
  const {
    selectedConversation,
    selectedConversationId,
    getMessage,
    chatHeader,
  } = useChatStore()

  const offset = useRef(20)
  const containerRef: any = useRef(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const prevHeightRef = useRef(0)
  const hasMoreMessagesRef = useRef(true)

  useEffect(() => {
    if (!selectedConversationId) return

    offset.current = 20
    getMessage(selectedConversationId, 0)
    setIsInitialLoad(true)
    hasMoreMessagesRef.current = true

    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }, [selectedConversationId])

  useEffect(() => {
    if (!isInitialLoad && selectedConversation?.length) {
      scrollToBottom()
    }
  }, [selectedConversation])

  useEffect(() => {
    const container = containerRef.current
    if (!container || isInitialLoad) return

    if (isLoadingMore) {
      const newHeight = container.scrollHeight
      const heightDifference = newHeight - prevHeightRef.current

      if (heightDifference > 0) container.scrollTop = heightDifference
    } else if (!isInitialLoad) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100

      if (isNearBottom) scrollToBottom()
    }
  }, [selectedConversation, isLoadingMore, isInitialLoad])

  const scrollToBottom = () => {
    const container = containerRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight
    setIsInitialLoad(false)
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHeader])

  const handleGettingMsgOnScroll = async (e) => {
    const container = e.currentTarget

    prevHeightRef.current = container.scrollHeight

    if (
      container.scrollTop < 100 &&
      !isLoadingMore &&
      hasMoreMessagesRef.current
    ) {
      setIsLoadingMore(true)

      try {
        const prevLength = selectedConversation?.length || 0
        selectedConversationId &&
          (await getMessage(selectedConversationId, offset.current))

        const newLength =
          useChatStore.getState().selectedConversation?.length || 0
        newLength <= prevLength
          ? (hasMoreMessagesRef.current = false)
          : (offset.current += 20)
      } catch (error) {
        console.error('Error loading more messages:', error)
      } finally {
        setIsLoadingMore(false)
      }
    }
  }

  if (!selectedConversation)
    return (
      <div className="flex-1 overflow-y-auto flex flex-col-reverse p-5 bg-[#121417] my-2 xl:my-10 border-[#293038] w-full border rounded-2xl">
        <Skeleton
          count={10}
          height={50}
          className="my-10"
          baseColor="#1e1e1e"
          highlightColor="#333"
        />
      </div>
    )

  return (
    <div
      id="conversation-container"
      ref={containerRef}
      onScroll={handleGettingMsgOnScroll}
      className="overflow-y-auto flex flex-col p-5 bg-[#121417] my-2 xl:my-10 border-[#293038] w-full h-full border rounded-2xl"
    >
      {isLoadingMore && (
        <div className="w-full py-2 text-center">
          <span className="text-xs text-gray-400">
            Loading more messages...
            <i className="animate-spin ml-2 fa-solid fa-spinner"></i>
          </span>
        </div>
      )}

      {!hasMoreMessagesRef.current && selectedConversation.length > 0 && (
        <div className="w-full py-2 text-center">
          <span className="text-xs text-gray-400">
            Beginning of conversation
          </span>
        </div>
      )}

      {selectedConversation.length > 0 ? (
        selectedConversation?.map((chat: any, index: number) =>
          user.email === chat.sender.email ? (
            <div
              key={index}
              className="self-end text-right xl:max-w-[80%] my-2"
            >
              <div>
                <div
                  className={`${
                    chat?.isSending ? 'bg-gray-400' : 'bg-blue-400'
                  } p-4 rounded-2xl text-xs xl:text-2xl break-all whitespace-pre-wrap flex flex-col gap-5`}
                >
                  {chat.message}
                  {chat.image && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND}/images/${chat.image}`}
                      width={1000}
                      height={1000}
                      alt="image"
                      className="w-[500px] h-[500px] object-cover rounded-xl"
                    />
                  )}
                </div>
                <div className="text-[8px] xl:text-xs text-gray-400 mt-3 mr-2">
                  {formatDate(chat.date)}
                  {chat?.isSending ? (
                    <i className="ml-3 fa-regular fa-clock"></i>
                  ) : (
                    <i
                      className={`ml-3 ${
                        chat.seen ? 'text-blue-500' : 'text-gray-300'
                      } fa-solid fa-check-double`}
                    ></i>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              key={index}
              className="self-start text-left xl:max-w-[80%] my-2"
            >
              <div className="bg-[#2B3640] p-4 rounded-2xl text-xs xl:text-2xl break-all whitespace-pre-wrap flex flex-col gap-5">
                {chat.message}
                {chat.image && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND}/images/${chat.image}`}
                    width={1000}
                    height={1000}
                    alt="image"
                    className="w-[500px] h-[500px] object-cover rounded-xl"
                  />
                )}
              </div>
              <div className="text-[8px] xl:text-xs text-gray-400 mt-3 ml-2">
                {formatDate(chat.date)}
              </div>
            </div>
          )
        )
      ) : (
        <EmptyChat text="No messages yet. Say hi and start the conversation!" />
      )}
      {!chatHeader.isBlockedByHim && chatHeader.isBlockedByMe && (
        <div className="w-full py-2 text-center">
          <span className="text-xs text-gray-400">This User Is Blocked</span>
        </div>
      )}

      {chatHeader.isBlockedByHim && !chatHeader.isBlockedByMe && (
        <div className="w-full py-2 text-center">
          <span className="text-xs text-gray-400">This User Blocked You</span>
        </div>
      )}
      {chatHeader.isBlockedByHim && chatHeader.isBlockedByMe && (
        <div className="w-full py-2 text-center">
          <span className="text-xs text-gray-400">
            You Both Blocked each other
          </span>
        </div>
      )}
    </div>
  )
}

export const More = ({ src, text }: { src: string; text: string }) => {
  return (
    <div
      className={`cursor-pointer flex items-center p-2 xl:py-4 xl:px-8 ${
        text !== 'Close Chat' && 'border-b'
      }`}
    >
      <Image
        src={src}
        alt=""
        width={100}
        height={100}
        className="w-[30px] h-[20px] mr-2"
      />
      <p className="text-xs xl:text-xl text-[#363B4B]">{text}</p>
    </div>
  )
}
