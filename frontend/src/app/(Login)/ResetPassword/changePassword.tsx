'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function PasswordResetForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const handleNewPasswordChange = (e: any) => {
    const password = e.target.value
    setNewPassword(password)

    // Clear error first
    setErrors((prev) => ({ ...prev, newPassword: '' }))

    if (password.trim()) {
      if (password.length < 8) {
        setErrors((prev) => ({
          ...prev,
          newPassword: 'Password must be at least 8 characters long',
        }))
      }
    }
  }

  const handleConfirmPasswordChange = (e: any) => {
    const password = e.target.value
    setConfirmPassword(password)

    // Clear error first
    setErrors((prev) => ({ ...prev, confirmPassword: '' }))

    if (password.trim() && newPassword.trim()) {
      if (password !== newPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match',
        }))
      }
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    let hasErrors = false
    const newErrors = { newPassword: '', confirmPassword: '' }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required'
      hasErrors = true
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long'
      hasErrors = true
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
      hasErrors = true
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      hasErrors = true
    }

    setErrors(newErrors)

    if (hasErrors) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
      console.log('Password reset successfully')
    }, 1500)
  }

  return (
    <div className="w-full  text-white">
      {/* Main Content */}
      <div className="flex items-center  justify-center  px-4 sm:px-6 py-8">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
          {!isSubmitted ? (
            <>
              <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-center mb-6 sm:mb-8">
                Reset your password
              </h1>

              <div className="space-y-4 sm:space-y-6">
                {/* New Password Input */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base xl:text-lg mb-2">
                    New password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    className={`w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${
                      errors.newPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-gray-300 text-sm md:text-base xl:text-lg mb-2">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    !newPassword.trim() ||
                    !confirmPassword.trim() ||
                    !!errors.newPassword ||
                    !!errors.confirmPassword ||
                    isLoading
                  }
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
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-center mb-3">
                Password reset successful
              </h1>

              <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm md:text-base xl:text-lg leading-relaxed px-2">
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>

              <div className="space-y-3 sm:space-y-4">
                <Link href="/">
                  <button className="w-full py-2.5 sm:py-3 md:py-4 xl:py-6 bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-sm sm:text-base md:text-lg xl:text-2xl">
                    Go to Login
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
