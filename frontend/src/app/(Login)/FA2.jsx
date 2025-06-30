import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { axiosInstance, useAuthStore } from '@/(zustand)/useAuthStore'

const Page = () => {
  const [code, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')
  const { user, setUser } = useAuthStore()
  const [isTwoFAVerified, setUser2FAStatus] = useState(false)

  const getQr = async () => {
    try {
      const res = await axiosInstance.get(`/api/2fa/generateQRCode`)
      setQrCode(res.data.qrCode)
      setSecret(res.data.secret)
    } catch (err) {
      setMessage('Failed to load QR')
    }
  }

  useEffect(() => {
    getQr()
    setUser2FAStatus(user?.isTwoFAVerified)
  }, [])

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      toast.warning('Please enter a valid 6-digit code')
      return
    }
    try {
      const res = await axiosInstance.post(`/api/2fa/verifyQRCode`, {
        secret,
        token: token.trim(),
      })

      if (res.data.verified) {
        toast.success('2FA enabled successfully')
        setUser2FAStatus(true)
        setUser({ ...user, isTwoFAVerified: true })
      } else {
        toast.warning('Invalid code. Please try again.')
      }
    } catch (err) {
      console.log('Error during verification:', err)
      toast.warning('Failed to enable 2FA. Please try again.')
    }
  }

  const handleDisableTwoFA = async () => {
    try {
      const res = await axiosInstance.post(`/api/2fa/disableQRCode`)
      if (res.data.success) {
        toast.success('2FA disabled successfully')
        setUser2FAStatus(false)
      } else {
        toast.warning('Failed to disable 2FA. Please try again.')
      }
    } catch (err) {
      console.log('Error during disabling 2FA:', err)
      toast.warning('Failed to disable 2FA. Please try again.')
    }
  }

  return (
    <div className="w-full">
      {isTwoFAVerified ? (
        <div className="flex flex-col mt-10">
          <h1 className="text-2xl font-bold mb-4">
            Two-Factor Authentication Enabled
          </h1>
          <p className="text-lg">You have successfully enabled 2FA.</p>
          <button
            className="text-md bg-red-400  py-2 px-6 mt-2 rounded-sm cursor-pointer "
            onClick={handleDisableTwoFA}
          >
            Disable 2FA
          </button>
        </div>
      ) : (
        <div className="mt-10">
          <div className="mx-auto p-5">
            <div className="flex gap-10">
              <div>
                {code ? (
                  <Image
                    src={code}
                    width={240}
                    height={240}
                    alt="QR image"
                    className="rounded-md"
                  />
                ) : (
                  <p>Loading QR...</p>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="font-bold">
                  Enter generated code by your chosen authenticator app
                </h3>
                <input
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  type="text"
                  className="bg-main border border-gray-400 p-2 text-md font-semibold rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  inputMode="numeric"
                  maxLength={6}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleVerify}
                    className="text-md bg-blue-400  py-2 px-6 rounded-sm cursor-pointer"
                  >
                    Enable 2fa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
