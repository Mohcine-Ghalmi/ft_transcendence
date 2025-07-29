// 'use client'
// import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { toast } from 'react-toastify'
// import { axiosInstance, useAuthStore } from '@/(zustand)/useAuthStore'
// import { useSearchStore } from '@/(zustand)/useSearchStore'
// import { Level, TopProfile, State, MatchHistory } from '../page'

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

// const ProfilePage = () => {
//   const { login } = useParams()
//   const router = useRouter()
//   const { getUserDetails } = useAuthStore()
//   const { userProfile, setUserProfile } = useSearchStore()

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axiosInstance.post('/users/getUser', {
//           login,
//         })
//         if (!res.data) {
//           toast.warning('Error fetching user, redirecting...')
//           router.push('/dashboard')
//           return
//         }
//         setUserProfile(res.data)
//         // getUserDetails(res.data.email)
//       } catch (err) {
//         setUserProfile(null)
//         toast.warning('Error fetching user, redirecting...')
//         router.push('/dashboard')
//       }
//     }

//     if (login) fetchUser()
//   }, [login])

//   useEffect(() => {
//     if (!userProfile) return
//     getUserDetails(userProfile.email)
//   }, [userProfile])

//   if (!userProfile) {
//     return (
//       <div className="flex justify-center items-center h-screen text-white">
//         Loading...
//       </div>
//     )
//   }

//   return (
//     <div className="flex items-center justify-center text-white">
//       <Profile user={userProfile} />
//     </div>
//   )
// }

const ProfilePage = () => {
  return null
}
export default ProfilePage
