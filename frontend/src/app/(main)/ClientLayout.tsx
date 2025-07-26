'use client'

import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { Header } from '@/components/layout/Header'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import TournamentRejoinHelper from '../../utils/tournament/TournamentRejoinHelper'
import { TournamentNotificationProvider } from '../../utils/tournament/TournamentNotificationProvider'
import ConnectingLoading from '@/components/layout/ConnectingLoading'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [socketConnected, setSocketConnected] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = searchParams.get('token')
        if (token) {
          localStorage.setItem('accessToken', token)
          const url = new URL(window.location.href)
          url.searchParams.delete('token')
          window.history.replaceState({}, '', url.pathname + url.search)
        }

        const isAuth = await checkAuth()

        if (!isAuth) {
          const storedToken = localStorage.getItem('accessToken')
          if (!storedToken) {
            router.push('/')
            return
          }
          localStorage.removeItem('accessToken')
          router.push('/')
          return
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('accessToken')
        router.push('/')
      } finally {
        setAuthChecked(true)
      }
    }

    initializeAuth()
  }, [checkAuth, router, searchParams])

  useEffect(() => {
    if (user && isAuthenticated) {
      const { connectSocket } = useAuthStore.getState()
      connectSocket()

      const checkSocket = () => {
        if (socketInstance?.connected) {
          setSocketConnected(true)
        }
      }

      checkSocket()
      const timeout = setTimeout(checkSocket, 1000)

      return () => clearTimeout(timeout)
    }
  }, [user, isAuthenticated])

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <ConnectingLoading text="Authenticating..." />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <ConnectingLoading text="Redirecting to login..." />
      </div>
    )
  }

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
