'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { axiosInstance } from '@/(zustand)/useAuthStore'
import { Profile } from '../page'

// interface User {
//   id: number
//   login: string
//   username: string
//   avatar: string
//   email: string
//   // ...add other fields if needed
// }

const ProfilePage = () => {
  const { login } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.post('/api/users/getUser', { login })
        if (!res.data) {
          toast.warning('Error fetching user, redirecting...')
          router.push('/dashboard')
          return
        }
        setUser(res.data)
      } catch (err) {
        toast.warning('Error fetching user, redirecting...')
        router.push('/dashboard')
      }
    }

    if (login) fetchUser()
  }, [login])

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center text-white">
      <Profile user={user} />
    </div>
  )
}

export default ProfilePage
