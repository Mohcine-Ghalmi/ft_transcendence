'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import SignInWithOthers from './SignInWithOthers'
import ResetPassword from './ResetPassword/resetPassword'
import { CustomError } from './SignUp/SingUpPage'
import { useRouter } from 'next/navigation'
import VerifyTwoFa from './VerifyTwoFa'

export default function LoginPage() {
  const router = useRouter()
  const [email, setemail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  })

  // Email validation function
  const isValidEmail = (email: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation function (minimum 8 characters, at least one letter and one number)
  const isValidPassword = (password: any) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
    return passwordRegex.test(password)
  }

  // Handle input changes and clear errors
  const handleemailChange = (e: any) => {
    setemail(e.target.value)
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value)
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }))
    }
  }

  //
  const { login, hidePopUp } = useAuthStore()

  const handleLogin = async () => {
    const newErrors = {
      email: '',
      password: '',
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required'
    } else if (!isValidPassword(password)) {
      newErrors.password =
        'Password must be at least 8 characters with letters and numbers'
    }

    // Set errors if any
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors)
      return
    }

    // If validation passes, proceed with login
    const res = await login({ email, password })
    if (res) router.push('/dashboard')
    // Add your login logic here
  }

  //
  const [showRestpassword, setShowRestpassword] = useState(false)

  return (
    <div className="min-h-screen  flex flex-col relative">
      {showRestpassword && (
        <ResetPassword setShowRestpassword={setShowRestpassword} />
      )}
      {/* Header */}
      <header className="flex items-center bg-[#121417] justify-between px-6 py-4 border-b border-gray-700">
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image
              src="/vector---0.svg"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h1 className="text-white font-semibold text-lg">PingPong</h1>
          </div>
        </Link>
        <Link href="/SignUp" passHref>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Sign Up
          </button>
        </Link>
      </header>
      {hidePopUp && <VerifyTwoFa email={email} />}
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-white text-3xl md:text-4xl xl:text-5xl font-bold mb-2">
              Welcome back
            </h2>
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleemailChange}
                className={`w-full h-12 md:h-16 xl:h-20 px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-700 border rounded-lg md:rounded-xl xl:rounded-2xl text-white placeholder-gray-400 text-base md:text-lg xl:text-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              <CustomError message={errors.email} isTouched={1} />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full h-12 md:h-16 xl:h-20 px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-700 border rounded-lg md:rounded-xl xl:rounded-2xl text-white placeholder-gray-400 text-base md:text-lg xl:text-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              <CustomError message={errors.password} isTouched={1} />
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <button
                type="button"
                onClick={() => setShowRestpassword(true)}
                className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full h-12 md:h-16 xl:h-20 bg-white hover:bg-gray-100 text-[#121417] font-semibold rounded-lg md:rounded-xl xl:rounded-2xl transition-colors text-base md:text-lg xl:text-2xl"
            >
              Log In
            </button>

            <SignInWithOthers />
          </div>
        </div>
      </main>
    </div>
  )
}
