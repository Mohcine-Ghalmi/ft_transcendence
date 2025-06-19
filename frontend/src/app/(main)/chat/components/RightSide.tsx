'use client'
import { useChatStore } from '@/(zustand)/useChatStore'
import Image from 'next/image'

const Top = () => {
  const { selectedConversationId, chatHeader: friend } = useChatStore()

  return (
    <div className="h-[30%]">
      {selectedConversationId && friend ? (
        <>
          <div className="flex flex-col items-center relative h-[50%]">
            <Image
              src="https://images.pexels.com/photos/31295484/pexels-photo-31295484/free-photo-of-kiyomizu-dera-temple-in-autumn-splendor.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
              alt="background"
              width={1000}
              height={1000}
              className="w-full h-full object-cover rounded-2xl"
            />
            <Image
              src={friend.avatar}
              alt="avatar"
              width={100}
              height={100}
              className="w-[160px] h-[160px] object-cover rounded-full -mt-[80px]  border-10 border-[#121417] animate-pulse animate-twice animate-duration-500"
            />
          </div>
          <div className="flex flex-col items-center mt-[80px]">
            <h2 className="text-2xl">
              {friend.first_name} {friend.last_name}
            </h2>
            <h3 className="text-md text-gray-400">@{friend.login}</h3>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <Image
            src="/No users found.svg"
            alt="user not found"
            width={100}
            height={100}
            className="w-[40%]"
          />
        </div>
      )}
    </div>
  )
}

const Middle = () => {
  const { selectedConversationId, chatHeader: friend } = useChatStore()

  return (
    <div className="border-t-1 border-b-1 h-[30%] mt-6 border-[#768192] p-4 relative">
      <div className="flex w-full justify-between">
        <h2 className="text-2xl">Achievement</h2>
        <p className="text-gray-400 text-xs">See all</p>
      </div>
      {selectedConversationId && friend && (
        <div className="animate-pulse animate-twice animate-duration-500 flex flex-col items-center justify-center w-full  h-full absolute top-0 left-0">
          <Image
            src={`/Levels/Badge_0${friend.level || 1}.svg`}
            alt="badge"
            width={100}
            height={100}
            className="w-[180px]"
          />
          <p className="text-xl text-gray-400">Level {friend.level || 1}</p>
        </div>
      )}
    </div>
  )
}

export const Match = () => {
  return (
    <div className="animate-pulse animate-duration-500  animate-twice  relative  border my-5 border-[#768192] p-4 rounded-4xl flex items-center justify-between hover:bg-[#222]  hover:scale-99 transition duration-400 ease-in-out">
      <div className="absolute w-1 h-[50%] bg-green-400 left-0 rounded-full"></div>
      <div className="flex items-center">
        <Image
          src="/avatar/Default.svg"
          alt="avatar"
          width={100}
          height={100}
          className="w-[60px] h-[60px] object-cover rounded-full"
        />
        <div className="px-4  flex flex-col justify-between items-start">
          <h2 className="">msarda</h2>
          <div className="flex -ml-2 mt-2 items-center">
            <Image
              src={`/Levels/Badge_01.svg`}
              alt="badge"
              width={100}
              height={100}
              className="w-[25px] h-[25px]"
            />
            <span className="text-xs text-green-300">+250xp</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div>
          <span className="text-xl">7</span>
          <span className="text-xl px-4">-</span>
          <span className="text-xl">1</span>
        </div>
        <span className="text-xs">3hrs 37min</span>
      </div>
      <div className="flex items-center flex-row-reverse">
        <Image
          src="/avatar/Default.svg"
          alt="avatar"
          width={100}
          height={100}
          className="w-[60px] h-[60px] object-cover rounded-full"
        />
        <div className="px-4  flex flex-col justify-between items-start">
          <h2 className="">msarda</h2>
          <div className="flex -mr-2 mt-2 items-center flex-row-reverse">
            <Image
              src="/Levels/Badge_01.svg"
              alt="badge"
              width={100}
              height={100}
              className="w-[25px] h-[25px]"
            />
            <span className="text-xs text-red-300">-50xp</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const Bottom = () => {
  const { selectedConversationId } = useChatStore()
  return (
    <div>
      <div className="flex w-full justify-between p-4">
        <h2 className="text-2xl">Match History</h2>
        <p className="text-gray-400 text-xs">See all</p>
      </div>
      {selectedConversationId && (
        <div className="h-[350px] overflow-y-scroll ">
          <Match />
          <Match />
          <Match />
          <Match />
          <Match />
        </div>
      )}
    </div>
  )
}

const RightSide = () => {
  return (
    <div className="hidden 2xl:flex flex-col w-[30%] p-4 border rounded-2xl border-[#768192] bg-[#121417]">
      <Top />
      <Middle />
      <Bottom />
    </div>
  )
}

export default RightSide
