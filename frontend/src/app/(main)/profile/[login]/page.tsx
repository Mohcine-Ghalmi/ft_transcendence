'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { axiosInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { Profile } from '../page'
import { useSearchStore } from '@/(zustand)/useSearchStore'

const ProfilePage = () => {
  const { login } = useParams()
  const router = useRouter()
  const { getUserDetails } = useAuthStore()
  const { userProfile, setUserProfile } = useSearchStore()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.post('/api/users/getUser', { login })
        if (!res.data) {
          toast.warning('Error fetching user, redirecting...')
          router.push('/dashboard')
          return
        }
        console.log('Fetched user:', res.data)

        setUserProfile(res.data)
        // getUserDetails(res.data.email)
      } catch (err) {
        setUserProfile(null)
        toast.warning('Error fetching user, redirecting...')
        router.push('/dashboard')
      }
    }

    if (login) fetchUser()
  }, [login])

  useEffect(() => {
    if (!userProfile) return
    getUserDetails(userProfile.email)
  }, [userProfile])

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center text-white">
      <Profile user={userProfile} />
    </div>
  )
}

export default ProfilePage
