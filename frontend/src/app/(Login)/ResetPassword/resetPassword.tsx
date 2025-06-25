'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import VerifyOtp from './VerifyOtp'
import { axiosInstance } from '@/(zustand)/useAuthStore'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export default function ResetPassword({ setShowRestpassword }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleemailChange = (e: any) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    // Clear error first
    setError('')

    if (newEmail.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        setError('Please enter a valid email address')
      }
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(async () => {
      try {
        const res = await axiosInstance.post('/api/users/password-reset-otp', {
          email,
        })
        if (res.data.status) {
          setIsSubmitted(true)
        } else {
          toast.warning(res.data.message)
        }
      } catch (err) {
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }, 100)
  }

  return (
    <div className="w-full text-white absolute top-0 left-0 backdrop-blur-xl">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] px-4 sm:px-6 py-8">
        <div className="relative bg-black/20 backdrop-blur-3xl rounded-2xl p-4 w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
          <div className="absolute top-3 right-4 cursor-pointer">
            <Image
              src="/X.svg"
              alt="X"
              width={100}
              height={100}
              className="w-8 h-6"
            />
          </div>
          {!isSubmitted ? (
            <>
              <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-center mb-3">
                Forgot your password?
              </h1>

              <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm md:text-base xl:text-lg leading-relaxed px-2">
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>

              <div className="space-y-4 sm:space-y-6">
                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleemailChange}
                    className={`w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${
                      error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  {error && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">
                      {error}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!email.trim() || !!error || isLoading}
                  className="w-full py-2.5 sm:py-3 md:py-4 xl:py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-sm sm:text-base md:text-lg xl:text-2xl"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center mt-6">
                <span className="text-gray-400 text-xs sm:text-sm md:text-base xl:text-lg">
                  Remember your password?{' '}
                  <Link href="/">
                    <button className="text-blue-400 hover:text-blue-300 transition-colors underline sm:no-underline sm:hover:underline">
                      Log in
                    </button>
                  </Link>
                </span>
              </div>
            </>
          ) : (
            <>
              <VerifyOtp email={email} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
