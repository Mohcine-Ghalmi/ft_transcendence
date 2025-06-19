import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FortyTwoProvider from 'next-auth/providers/42-school'

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/',
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID!,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!profile || !account) {
        console.error('Missing profile or account in signIn callback')
        return false
      }
      return true
    },

    async jwt({ token, profile, account }) {
      if (profile && account) {
        const is42School = account.provider === '42-school'
        const profileData = profile as any

        const userData: any = {
          username: !is42School
            ? profileData.given_name + ' ' + profileData.family_name
            : profileData.first_name + ' ' + profileData.last_name,
          email: profileData.email!,
          avatar: profileData.picture || profileData.image?.link || '',
          isOnline: true,
          type: is42School ? 2 : 1,
          login: is42School ? profileData.login || '' : '',
          level: 1,
          resetOtp: '',
          resetOtpExpireAt: '',
        }

        token.user = userData
      }
      return token
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
