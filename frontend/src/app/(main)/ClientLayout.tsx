'use client'

import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { Header } from '@/components/layout/Header'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import TournamentRejoinHelper from '../../utils/tournament/TournamentRejoinHelper'
import { TournamentNotificationProvider } from '../../utils/tournament/TournamentNotificationProvider'
import { ConnectingLoading } from './chat/page'

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

    checkSocket()
    const timeout = setTimeout(checkSocket, 1000)

    return () => clearTimeout(timeout)
  }, [user])

  return (
    <>
      <ToastContainer theme="dark" stacked hideProgressBar />
      <Header />
      {!socketConnected ? (
        <ConnectingLoading text="Please wait while we connect to the server..." />
      ) : (
        <>
          {children}
          <TournamentRejoinHelper />
          <TournamentNotificationProvider />
        </>
      )}
    </>
  )
}
