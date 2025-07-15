'use client'

import { ToastContainer } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ClientProviders({
  children,
  user,
}: {
  children: React.ReactNode
  user: any | null
}) {
  const router = useRouter()
  useEffect(() => {
    if (!user) return
    router.push('/dashboard')
  }, [user])

  if (user) return null
  return (
    <>
      <ToastContainer theme="dark" stacked />
      {children}
    </>
  )
}
