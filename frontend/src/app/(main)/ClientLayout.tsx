'use client'

import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { Header } from '@/components/layout/Header'
import { SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('accessToken')
      const isValid = await checkAuth(token as string)

      if (!isValid) {
        router.replace('/')
        return
      }

      setLoading(false)
    }

    verifyAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SessionProvider>
      <ToastContainer theme="dark" stacked />
      <Header />
      {!socketInstance || !socketInstance.connected ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Connecting to server...</div>
        </div>
      ) : (
        children
      )}
    </SessionProvider>
  )
}
