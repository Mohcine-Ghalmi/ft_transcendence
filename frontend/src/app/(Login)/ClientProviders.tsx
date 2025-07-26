'use client'

import { ToastContainer } from 'react-toastify'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/(zustand)/useAuthStore'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = searchParams.get('token')
        if (token) {
          localStorage.setItem('accessToken', token)
          const url = new URL(window.location.href)
          url.searchParams.delete('token')
          window.history.replaceState({}, '', url.pathname + url.search)
          router.push('/dashboard')
          return
        }

        const storedToken = localStorage.getItem('accessToken')
        if (storedToken) {
          const isAuth = await checkAuth()
          if (isAuth) {
            router.push('/dashboard')
            return
          } else {
            localStorage.removeItem('accessToken')
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('accessToken')
      } finally {
        setAuthChecked(true)
      }
    }

    initializeAuth()
  }, [checkAuth, router, searchParams])

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return null
  }

  return (
    <>
      <ToastContainer theme="dark" stacked />
      {children}
    </>
  )
}
