import { useState, useEffect, useRef } from 'react'
import { Mail, Shield, X, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { axiosInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const VerifyTwoFa = () => {
  // Mock functions for demo - replace with your actual imports
  const { setHidePopUp, setUser } = useAuthStore()

  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: email, 2: code
  const [emailError, setEmailError] = useState('')
  const [codeError, setCodeError] = useState('')
  const inputRefs = useRef([])

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')

    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
    }, 800)
  }

  const handleCodeInput = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newCode = [...twoFactorCode]
    newCode[index] = value
    setTwoFactorCode(newCode)
    setCodeError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }
  const router = useRouter()
  const handleVerify = async (code) => {
    setIsLoading(true)
    setCodeError('')

    if (code.length !== 6) {
      setCodeError('Please enter a complete 6-digit code')
      setIsLoading(false)
      return
    }

    try {
      const res = await axiosInstance.post('/2fa/verifyTwoFaLogin', {
        token: code,
        email,
      })
      const { accessToken, ...user } = res.data
      localStorage.setItem('accessToken', accessToken)
      setUser(user)
      setHidePopUp(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error verifying 2FA code:', error)
      toast.warning('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetToEmail = () => {
    setStep(1)
    setTwoFactorCode(['', '', '', '', '', ''])
    setCodeError('')
  }

  return (
    <div
      id="parent"
      onClick={(e: any) => e.target.id === 'parent' && setHidePopUp(true)}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0.8) 70%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="relative w-full max-w-lg">
        <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl">
          <button
            onClick={() => setHidePopUp(false)}
            className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 hover:scale-110"
          >
            <X size={24} />
          </button>

          <div className="relative px-8 py-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: '1s' }}
            ></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl animate-pulse opacity-20"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4">
                  {step === 1 ? (
                    <Mail className="w-8 h-8 text-white" />
                  ) : (
                    <Shield className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                {step === 1 ? 'Secure Access' : 'Verification Required'}
              </h2>
              <p className="text-gray-400 text-lg">
                {step === 1
                  ? 'Enter your email to begin verification'
                  : 'Enter the 6-digit code from your authenticator'}
              </p>
            </div>
          </div>

          <div className="px-8 pb-8">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg ${
                        emailError
                          ? 'border-red-500 focus:ring-red-500/50'
                          : 'border-gray-700 focus:ring-blue-500/50 hover:border-gray-600'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-center space-x-2 text-red-400 animate-slide-down">
                      <AlertCircle size={16} />
                      <span className="text-sm">{emailError}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEmailSubmit}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Code...</span>
                    </div>
                  ) : (
                    'Continue to Verification'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={resetToEmail}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm group"
                >
                  <div className="transform group-hover:-translate-x-1 transition-transform">
                    ←
                  </div>
                  <span>Change email ({email})</span>
                </button>

                <div className="space-y-4">
                  <div className="flex justify-center space-x-3">
                    {twoFactorCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el: any) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeInput(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-14 h-16 text-center text-2xl font-bold bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          codeError
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-gray-700 focus:ring-blue-500/50 hover:border-gray-600'
                        } ${digit ? 'bg-gray-700/50 border-blue-500/50' : ''}`}
                      />
                    ))}
                  </div>

                  {codeError && (
                    <div className="flex items-center justify-center space-x-2 text-red-400 animate-slide-down">
                      <AlertCircle size={16} />
                      <span className="text-sm">{codeError}</span>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-gray-500 text-sm">
                      Code sent to{' '}
                      <span className="text-blue-400 font-medium">{email}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleVerify(twoFactorCode.join(''))}
                  disabled={isLoading || twoFactorCode.some((digit) => !digit)}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle size={20} />
                      <span>Verify & Access</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default VerifyTwoFa
