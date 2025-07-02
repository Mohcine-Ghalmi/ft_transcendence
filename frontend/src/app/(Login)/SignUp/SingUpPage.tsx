'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SignInWithOthers from '../SignInWithOthers'
import { axiosInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { toast } from 'react-toastify'
import FA2 from '../FA2'

export const CustomError = ({ message, isTouched }) => {
  return (
    <div className="min-h-[25px] p-1">
      {message && isTouched && (
        <p className="text-red-500 text-xs animate-fade-in duration-300">
          {message}
        </p>
      )}
    </div>
  )
}

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    twoFactorCode: '',
  })
  const [currentStep, setCurrentStep] = useState(1)
  const imageName = useRef('')
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    twoFactorCode: '',
  })
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    twoFactorCode: false,
  })

  const validateField = (name: string, value: string | File | null) => {
    let error = ''

    switch (name) {
      case 'username':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Username is required'
        } else if (typeof value === 'string' && value.length < 3) {
          error = 'Username must be at least 3 characters'
        } else if (
          typeof value === 'string' &&
          !/^[a-zA-Z0-9_]+$/.test(value)
        ) {
          error = 'Username can only contain letters, numbers, and underscores'
        }
        break

      case 'email':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Email is required'
        } else if (
          typeof value === 'string' &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          error = 'Please enter a valid email address'
        }
        break

      case 'password':
        if (!value) {
          error = 'Password is required'
        } else if (typeof value === 'string' && value.length < 8) {
          error = 'Password must be at least 8 characters'
        } else if (
          typeof value === 'string' &&
          !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)
        ) {
          error =
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }
        break

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password'
        } else if (typeof value === 'string' && value !== formData.password) {
          error = 'Passwords do not match'
        }
        break

      case 'twoFactorCode':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Two-factor code is required'
        } else if (typeof value === 'string' && !/^\d{6}$/.test(value)) {
          error = 'Please enter a valid 6-digit code'
        }
        break

      default:
        break
    }

    return error
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Validate field
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    // Special case: revalidate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmPasswordError = validateField(
        'confirmPassword',
        formData.confirmPassword
      )
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }))
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (currentStep === 1) {
      // Mark step 1 fields as touched
      setTouched((prev) => ({
        ...prev,
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
      }))

      // Validate step 1 fields
      const newErrors = {
        ...errors,
        username: validateField('username', formData.username),
        email: validateField('email', formData.email),
        password: validateField('password', formData.password),
        confirmPassword: validateField(
          'confirmPassword',
          formData.confirmPassword
        ),
      }

      setErrors(newErrors)

      // Check if step 1 is valid
      const isStep1Valid =
        !newErrors.username &&
        !newErrors.email &&
        !newErrors.password &&
        !newErrors.confirmPassword

      if (isStep1Valid) {
        await register({ ...formData, avatar: 'default.avif' })
      }
      //   setCurrentStep(2)
      // }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const { register } = useAuthStore()

  const handleSkipFor2FA = async () => {
    console.log('Skipping 2FA for now')
    // Complete registration without 2FA
    await register({ ...formData, avatar: 'default.avif' })
  }

  const handle2FaVerify = (e: any) => {
    e.preventDefault()
    setTouched((prev) => ({
      ...prev,
      twoFactorCode: true,
    }))
    const error = validateField('twoFactorCode', formData.twoFactorCode)
    setErrors((prev) => ({
      ...prev,
      twoFactorCode: error,
    }))
    if (!error) {
      // 2FA code is valid
      // You can add further logic here (e.g., redirect, API call)
    }
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center bg-[#121417] justify-between px-6 py-4 border-b border-gray-700">
        {/* Logo */}
        <div className="hover:text-white">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/vector---0.svg"
              alt="Logo"
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <h1 className="text-white font-semibold text-base sm:text-lg">
              PingPong
            </h1>
          </Link>
        </div>
        <Link href="/" passHref>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Login
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
          <h1 className="text-2xl md:text-3xl xl:text-5xl font-bold text-center mb-8">
            {currentStep === 1
              ? 'Create your account'
              : currentStep === 2
              ? 'Upload avatar'
              : 'Welcome!'}
          </h1>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-0">
                {/* Username Input */}
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${
                      errors.username && touched.username
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  <CustomError
                    message={errors.username}
                    isTouched={touched.username}
                  />
                </div>
                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${
                      errors.email && touched.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  <CustomError
                    message={errors.email}
                    isTouched={touched.email}
                  />
                </div>
                {/* Password Input */}
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  <CustomError
                    message={errors.password}
                    isTouched={touched.password}
                  />
                </div>
                {/* Confirm Password Input */}
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  <CustomError
                    message={errors.confirmPassword}
                    isTouched={touched.confirmPassword}
                  />
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* <FA2 /> */}
                {/* 2FA Code Input */}
                <div>
                  <input
                    type="text"
                    name="twoFactorCode"
                    placeholder="Enter 2FA Code"
                    value={formData.twoFactorCode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className={`w-full h-12 md:h-16 xl:h-20 px-4 md:px-6 xl:px-10 bg-gray-700 border rounded-lg md:rounded-xl xl:rounded-2xl text-white placeholder-gray-400 text-base md:text-lg xl:text-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      errors.twoFactorCode && touched.twoFactorCode
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.twoFactorCode && touched.twoFactorCode && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1 text-center">
                      {errors.twoFactorCode}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    onClick={handle2FaVerify}
                    className="w-full py-3 md:py-4 xl:py-6 bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl"
                  >
                    Verify
                  </button>
                  <Link href="/">
                    <button
                      type="button"
                      onClick={handleSkipFor2FA}
                      className="w-full py-3 md:py-4 xl:py-6 bg-gray-700 hover:bg-gray-600 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl"
                    >
                      Skip for Now
                    </button>
                  </Link>
                </div>
              </div>
            )}
            {/* Progress Section */}
            {/* <div className="py-6">
              <div className="text-sm md:text-base xl:text-lg text-gray-400 mb-2">
                Account Creation Progress
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 md:h-3 xl:h-4">
                <div
                  className="bg-blue-500 h-2 md:h-3 xl:h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs md:text-sm xl:text-base text-gray-500 mt-1">
                Step {currentStep} of 2
              </div>
            </div> */}
            {/* Social Login Buttons - Only show on step 1 */}
            {currentStep === 1 && (
              <div className="mb-6">
                <SignInWithOthers />
              </div>
            )}
            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 md:py-4 xl:py-6 bg-gray-700 hover:bg-gray-600 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 md:py-4 xl:py-6 bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl"
                >
                  Register
                </button>
              </div>
            )}
          </form>

          {/* Already have account link */}
          {currentStep === 2 && (
            <div className="text-center mt-6">
              <span className="text-gray-400 text-sm md:text-base xl:text-lg">
                Already have an account?{' '}
                <Link href="/">
                  <span className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                    Sign in
                  </span>
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
