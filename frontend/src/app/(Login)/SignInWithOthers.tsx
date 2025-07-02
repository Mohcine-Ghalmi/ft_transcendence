import Image from 'next/image'
//
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/(zustand)/useAuthStore'

const SignInWithOthers = () => {
  //
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const searchParams = useSearchParams()
  const { googleLogin } = useAuthStore()

  useEffect(() => {
    const errorCode = searchParams.get('error')

    if (errorCode) {
      switch (errorCode) {
        case 'Callback':
          toast.warning(
            'You denied access to your account. Please try signing in again.'
          )
          break
        case 'OAuthSignin':
          toast.warning('Error starting the sign-in process. Please try again.')
          break
        case 'OAuthCallback':
          toast.warning(
            'Error during authentication callback. Please try again.'
          )
          break
        case 'AccessDenied':
          toast.warning(
            'Access denied. You may not have permission to sign in.'
          )
          break
        default:
          toast.warning('An error occurred during sign in. Please try again.')
      }
      router.push('/')
    }
  }, [searchParams])

  const logInWithGoogle = async () => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      router.replace(`${process.env.NEXT_PUBLIC_BACKEND}/login/google`)
    } catch (err) {
      toast.error('Google login failed')
      setIsProcessing(false)
    }
  }

  const logInWith42 = async () => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      router.replace(`${process.env.NEXT_PUBLIC_BACKEND}/login/42`)
    } catch (err) {
      toast.error('42 School login failed')
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-600"></div>
        <p className="mx-4 text-gray-400 text-sm md:text-base xl:text-lg">
          Or continue with
        </p>
        <div className="flex-1 border-t border-gray-600"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="flex flex-col md:flex-row gap-3">
        <button
          onClick={() => logInWithGoogle()}
          type="button"
          className="flex-1 h-12 md:h-16 xl:h-20 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl xl:rounded-2xl flex items-center justify-center gap-3 transition-colors text-base md:text-lg xl:text-2xl"
        >
          <Image
            src="/google-.svg"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8 xl:w-12 xl:h-12"
          />
          {isProcessing ? 'Processing...' : 'Sign in with Google'}
        </button>

        <button
          onClick={() => logInWith42()}
          type="button"
          className="flex-1 h-12 md:h-16 xl:h-20 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl xl:rounded-2xl flex items-center justify-center gap-3 transition-colors text-base md:text-lg xl:text-2xl"
        >
          <Image
            src="/group-37.svg"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8 xl:w-12 xl:h-12"
          />
          {isProcessing ? 'Processing...' : 'Continue with Intra'}
        </button>
      </div>
    </>
  )
}

export default SignInWithOthers
