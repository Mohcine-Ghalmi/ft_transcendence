'use client'

import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { Header } from '@/components/layout/Header'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'

export default function ClientLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: any
}) {
  const { setUser, connectSocket } = useAuthStore()
  const [socketConnected, setSocketConnected] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    setUser(user)

    connectSocket()

    const checkSocket = () => {
      if (socketInstance?.connected) {
        setSocketConnected(true)
      }
    }

    const interval = setInterval(checkSocket, 1000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <>
      <ToastContainer theme="dark" stacked />
      <Header />
      {!socketConnected ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Connecting to server...</div>
        </div>
      ) : (
        children
      )}
    </>
  )
}
