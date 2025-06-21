'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { toast, ToastContainer } from 'react-toastify'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  console.log('(auth)')

  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const publicRoutes = ['/', '/signup']
    const isPublicRoute = publicRoutes.some((route) => pathname.includes(route))

    if (!token) {
      if (!isPublicRoute) {
        router.push('/')
      }
      setLoading(false)
      return
    }

    try {
      const decodedToken = jwtDecode(token)
      const currentTime = Math.floor(Date.now() / 1000)

      if (decodedToken?.exp && decodedToken.exp < currentTime) {
        throw new Error('Token Expired')
      }

      if (isPublicRoute) {
        router.push('/dashboard')
      }
    } catch (error) {
      localStorage.removeItem('accessToken')
      toast.error('Access token is invalid or expired')
      if (!isPublicRoute) {
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }, [pathname, router])

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
      {children}
    </SessionProvider>
  )
}
