import { useState, useEffect } from 'react'
import { axiosInstance, useAuthStore } from '../../(zustand)/useAuthStore'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const VerifyTwoFa = ({ email }) => {
  const { setHidePopUp, setUser } = useAuthStore()
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const router = useRouter()
  const handle2FaVerify = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (twoFactorCode.length !== 6) {
      toast.warning('Please enter a valid 2FA code.')
      return
    }
    try {
      const res = await axiosInstance.post('/api/2fa/verifyTwoFaLogin', {
        token: twoFactorCode,
        email,
      })
      setUser(res.data)
      setHidePopUp(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error verifying 2FA code:', error)
      toast.warning('Verification failed. Please try again.')
    }
  }
  return (
    <div
      id="parent"
      onClick={(e: any) => e.target.id === 'parent' && setHidePopUp(true)}
      className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900/40 backdrop-blur-sm"
    >
      <div className="space-y-6 w-[400px] animate-fadeIn">
        <div>
          <input
            type="text"
            name="twoFactorCode"
            placeholder="Enter 2FA Code"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            maxLength={6}
            className={`w-full h-12 md:h-16 xl:h-20 px-4 md:px-6 xl:px-10 border-gray-700  bg-gray-700 border rounded-lg md:rounded-xl xl:rounded-2xl text-white placeholder-gray-400 text-base md:text-lg xl:text-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors `}
          />
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
        </div>
      </div>
    </div>
  )
}

export default VerifyTwoFa
