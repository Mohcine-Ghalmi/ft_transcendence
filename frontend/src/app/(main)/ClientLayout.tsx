'use client'

import { socketInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { Header } from '@/components/layout/Header'
import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('(main)')

  const router = useRouter()
  const { checkAuth } = useAuthStore()
  const pathname = usePathname()

  const [loading, setLoading] = useState(true)

  const checkIsAuth = async () => {
    try {
      const res = await checkAuth(localStorage.getItem('accessToken') as string)
      if (!res) router.push('/')
      setLoading(false)
    } catch (err) {
      router.push('/')
    }
  }
  useEffect(() => {
    console.log('check auth ?')

    checkIsAuth()
  }, [pathname, router])

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  return (
    <SessionProvider>
      <ToastContainer theme="dark" stacked />
      {socketInstance && socketInstance.connected && (
        <>
          <Header />
          {children}
        </>
      )}
    </SessionProvider>
  )
}
