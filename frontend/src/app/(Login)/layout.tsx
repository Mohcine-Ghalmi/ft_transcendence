'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import ClientProviders from './ClientProviders'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')
  let user = null

  if (accessToken) {
    try {
      user = jwt.verify(accessToken.value, process.env.JWT_SECRET!)
    } catch (err) {
      console.error('Invalid JWT:', err)
      cookieStore.delete('accessToken')
    }
  }

  return <ClientProviders user={user}>{children}</ClientProviders>
}
