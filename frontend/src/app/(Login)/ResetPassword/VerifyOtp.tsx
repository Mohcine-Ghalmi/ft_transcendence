'use client'
import { useState } from 'react'
import ChangePassword from './changePassword'
import Link from 'next/link'
import { axiosInstance } from '@/(zustand)/useAuthStore'
import { toast } from 'react-toastify'

export default function VerifyOtp({ email }) {
  const [otp, setotp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState<number>(0)
  const [errors, setErrors] = useState({
    otp: '',
  })

  const handleotpChange = (e: any) => {
    const otp = e.target.value
    setotp(otp)

    // Clear error first
    setErrors((prev) => ({ ...prev, otp: '' }))

    if (otp.trim()) {
      if (otp.length < 6) {
        setErrors((prev) => ({
          ...prev,
          otp: 'otp must be at least 6 characters long',
        }))
      }
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    let hasErrors = false
    const newErrors = { otp: '', confirmotp: '' }

    // if (!otp.trim()) {
    //   newErrors.otp = 'New otp is required'
    //   hasErrors = true
    // } else if (otp.length < 6) {
    //   newErrors.otp = 'otp must be at least 8 characters long'
    //   hasErrors = true
    // }

    setErrors(newErrors)

    if (hasErrors) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(async () => {
      if (!email) return
      try {
        const res = await axiosInstance.post('/api/users/verify-otp', {
          otp,
          email,
        })
        if (res.data.status) {
          setIsSubmitted(1)
        } else {
          toast.warning(res.data.message)
          setotp('')
        }
      } catch (err) {
        console.log(err)
      } finally {
        setIsLoading(false)
      }
      console.log('otp reset successfully')
    }, 100)
  }

  return (
    <div className="w-full  text-white">
      {/* Main Content */}
      <div className="flex items-center  justify-center  px-4 sm:px-6 py-8">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
          {isSubmitted === 0 && (
            <>
              <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-center mb-6 sm:mb-8">
                OTP
              </h1>

              <div className="space-y-4 sm:space-y-6">
                {/* New otp Input */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base xl:text-lg mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="number"
                    placeholder="xx-xx-xx"
                    value={otp}
                    onChange={handleotpChange}
                    className={`w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${
                      errors.otp
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">
                      {errors.otp}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!otp.trim() || !!errors.otp || isLoading}
                  className="w-full py-2.5 sm:py-3 md:py-4 xl:py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-sm sm:text-base md:text-lg xl:text-2xl"
                >
                  {isLoading ? 'Resetting...' : 'Submit'}
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
          )}

          {isSubmitted === 1 && <ChangePassword />}
        </div>
      </div>
    </div>
  )
}
