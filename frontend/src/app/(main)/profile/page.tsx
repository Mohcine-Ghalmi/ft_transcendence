'use client'

import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { useChatStore } from '@/(zustand)/useChatStore'
import { useSearchStore } from '@/(zustand)/useSearchStore'
import { StatisticsChart } from '@/components/dashboard/StatisticsChart'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Card = ({ number, text }) => {
  return (
    <div className="border border-gray-500 rounded-2xl w-full h-[150px] flex items-center justify-center flex-col">
      <h2 className="text-3xl">{number}</h2>
      <p className="text-md text-gray-500">{text}</p>
    </div>
  )
}

const TopProfile = ({ user }) => {
  const {
    user: me,
    isLoading: isBlocking,
    setIsLoading: setIsBlocking,
  } = useAuthStore()
  const { setSelectedConversationId } = useChatStore()
  const router = useRouter()

  const ConvoWith = () => {
    setSelectedConversationId(user.id)
    router.push('/chat')
  }

  const handleBlock = () => {
    if (!socketInstance) return

    setIsBlocking(true)

    const event = user.isBlockedByMe ? 'unblock:user' : 'block:user'

    socketInstance.emit(event, {
      hisEmail: user.email,
    })
  }

  // useEffect(() => {}, [user.isBlockedByMe])

  return (
    <div className="w-full flex items-center justify-center flex-col">
      <Image
        src={`${user.avatar}`}
        alt="profile"
        width={1000}
        height={1000}
        className="w-60 h-60 rounded-full object-cover"
      />
      <h2 className="text-4xl">{user.username}</h2>
      <h3 className="text-gray-400 text-xl my-2">@{user.login}</h3>

      {me.email === user.email ? (
        <button className="mt-4 w-[300px] hover:bg-[#2b3036b6] cursor-pointer rounded-2xl py-2 bg-[#2B3036] text-white duration-300 hover:scale-99">
          Edit Profile
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={ConvoWith}
            className="mt-4 w-[300px] hover:bg-[#0f7fdbc9] cursor-pointer rounded-2xl py-2 bg-[#0F80DB] text-white duration-300 hover:scale-99"
          >
            Chat
          </button>
          <button
            onClick={handleBlock}
            disabled={isBlocking}
            className={`mt-4 w-[300px] rounded-2xl py-2 text-white duration-300 hover:scale-99 ${
              isBlocking
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#2B3036] hover:bg-[#2b3036b6] cursor-pointer'
            }`}
          >
            {isBlocking
              ? 'Processing...'
              : user.isBlockedByMe
              ? 'Unblock'
              : 'Block'}
          </button>
        </div>
      )}
    </div>
  )
}

const MatchHistory = ({ user }) => {
  return <div>MatchHistory</div>
}

const State = ({ user }) => {
  return (
    <div className="w-[60%] flex items-center justify-center">
      <div className="grid grid-cols-2 gap-10 h-[500px] w-full">
        <StatisticsChart
          title="Win/Loss Rate"
          value="60%"
          subtitle="Last 30 Days"
          chartType="line"
        />
        <StatisticsChart
          title="Matches Played"
          value="20"
          subtitle="Last 30 Days"
          chartType="bar"
        />
      </div>
    </div>
  )
}

const Level = ({ user }) => {
  return (
    <div className="w-full flex-col flex items-center justify-center">
      <div className="w-full mt-10">
        <h3>Next Level</h3>
        {/* progress bar */}
        <div className="w-full] bg-gray-700 h-2 rounded-2xl relative mt-5">
          <div className="w-[50%] h-2 rounded-2xl absolute left-0 top-0 bg-white"></div>
        </div>
        <p className="mt-4 text-gray-400">{user.xp ? user.xp : 0}/100XP</p>
      </div>
      <div className="w-full grid gap-4 grid-cols-[repeat(auto-fit,_minmax(350px,1fr))] mt-10">
        <Card number="120" text="Wins" />
        <Card number="30" text="Losses" />
        <Card number="5" text="Streak" />
        <Card number="1500" text="Rating" />
      </div>
    </div>
  )
}

// export const Profile = ({ user }) => {
//   const [isSelected, setIsSelected] = useState(false)
//   return (
//     <div className="w-[80%] h-[90vh] mt-15">
//       <TopProfile user={user} />
//       <Level user={user} />
//       {/* select */}
//       <div className="mt-10 flex items-center gap-6 my-4">
//         <button
//           onClick={() => setIsSelected(false)}
//           className={`${
//             !isSelected && 'border-white'
//           } border-b border-transparent text-xl p-6 duration-75`}
//         >
//           State
//         </button>
//         <button
//           onClick={() => setIsSelected(true)}
//           className={`${
//             isSelected && 'border-white'
//           } border-b border-transparent text-xl p-6 duration-75`}
//         >
//           Match History
//         </button>
//       </div>
//       <div className=" flex flex-col items-center justify-center w-full">
//         {!isSelected ? <State user={user} /> : <MatchHistory user={user} />}
//       </div>
//     </div>
//   )
// }

export default function Page() {
  const { user: me } = useAuthStore()
  const { userProfile, setUserProfile } = useSearchStore()
  const pathname = usePathname()
  const [isSelected, setIsSelected] = useState(false)
  const [user, setUser] = useState()

  useEffect(() => {
    setUser(userProfile ? userProfile : me)
    setUserProfile(null)
  }, [pathname])
  return (
    <div className="flex items-center justify-center text-white">
      <div className="w-[80%] h-[90vh] mt-15">
        <TopProfile user={userProfile ? userProfile : me} />
        <Level user={userProfile ? userProfile : me} />
        {/* select */}
        <div className="mt-10 flex items-center gap-6 my-4">
          <button
            onClick={() => setIsSelected(false)}
            className={`${
              !isSelected && 'border-white'
            } border-b border-transparent text-xl p-6 duration-75`}
          >
            State
          </button>
          <button
            onClick={() => setIsSelected(true)}
            className={`${
              isSelected && 'border-white'
            } border-b border-transparent text-xl p-6 duration-75`}
          >
            Match History
          </button>
        </div>
        <div className=" flex flex-col items-center justify-center w-full">
          {!isSelected ? <State user={user} /> : <MatchHistory user={user} />}
        </div>
      </div>
    </div>
  )
}
