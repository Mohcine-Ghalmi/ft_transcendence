'use client'
import { axiosInstance, useAuthStore } from '@/(zustand)/useAuthStore'
import { useRef, useState } from 'react'
import FA2 from '@/app/(Login)/FA2'
import Image from 'next/image'
import { CustomError } from '../../(Login)/SignUp/SingUpPage'
import { toast } from 'react-toastify'

const DragAndDrop = ({ errors, setErrors, setFormData, validateField }) => {
  const { user } = useAuthStore()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    `${user.avatar}` || null
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = (file: File) => {
    const error = validateField('avatar', file)
    setErrors((prev) => ({
      ...prev,
      avatar: error,
    }))

    if (!error) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  const handleBrowseClick = (e) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-400 text-sm md:text-base xl:text-lg mb-6">
          Upload your avatar
        </p>
      </div>
      {/* Avatar Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg md:rounded-xl xl:rounded-2xl p-20 md:p-12 xl:p-16 transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10'
            : errors.avatar
            ? 'border-red-500 bg-red-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="text-center">
          {avatarPreview ? (
            <div className="mb-4">
              <Image
                width={1000}
                height={1000}
                src={avatarPreview}
                alt="Avatar preview"
                className="w-24 h-24 md:w-32 md:h-32 xl:w-40 xl:h-40 rounded-full mx-auto object-cover border-2 border-gray-600"
              />
            </div>
          ) : (
            <div className="mb-4">
              <div className="w-16 h-16 md:w-24 md:h-24 xl:w-32 xl:h-32 bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                <svg
                  className="w-8 h-8 md:w-12 md:h-12 xl:w-16 xl:h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            </div>
          )}
          <p className="text-white font-medium mb-2 text-base md:text-lg xl:text-2xl">
            {avatarPreview
              ? 'Change your avatar'
              : 'Drag and drop your avatar here'}
          </p>
          <p className="text-gray-400 text-sm md:text-base xl:text-lg mb-4">
            Or browse to choose a file
          </p>
          <button
            type="button"
            onClick={(e) => handleBrowseClick(e)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 md:px-8 xl:px-12 py-2 md:py-3 xl:py-4 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl"
          >
            Browse
          </button>
        </div>
      </div>

      {errors.avatar && (
        <p className="text-red-500 text-sm md:text-base xl:text-lg text-center">
          {errors.avatar}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileInputChange(e)}
        className="hidden"
      />
    </div>
  )
}

const Settings = () => {
  const { user, setUser } = useAuthStore()
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    login: user.login,
    avatar: null as File | null,
  })
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    login: '',
    avatar: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {
      ...errors,
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      login: validateField('login', formData.login),
      avatar: validateField('avatar', formData.avatar),
    }

    setErrors(newErrors)

    const isStep1Valid =
      !newErrors.username &&
      !newErrors.email &&
      !newErrors.login &&
      !newErrors.avatar
    if (!isStep1Valid) {
      return
    }
    const hostImage = async (image: File) => {
      const formData = new FormData()
      formData.append('file', image)
      try {
        const res = await axiosInstance.post('/api/chat/postImage', formData)
        toast.success('Image uploaded successfully')
        return res.data.filename
      } catch (err: any) {
        console.log(err)
        toast.warning(err.response.data.message)
        return null
      }
    }
    try {
      let avatarUrl = null
      if (formData.avatar && formData.avatar instanceof File) {
        avatarUrl = await hostImage(formData.avatar)
        if (!avatarUrl) {
          toast.error('Failed to upload avatar')
          return
        }
      }
      const res = await axiosInstance.post('/api/users/updateUserData', {
        username: formData.username,
        email: formData.email,
        login: formData.login,
        avatar: avatarUrl,
        type: user.type,
      })
      if (res.data.status) {
        toast.success('User data updated successfully')
        setUser({
          ...user,
          email: formData.email,
          username: formData.username,
          login: formData.login,
          avatar: avatarUrl ? avatarUrl : user.avatar,
        })
      }
      console.log(res)
    } catch (error) {
      console.error('Error updating user data:', error)
    }
  }

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

      case 'login':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Login is required'
        } else if (typeof value === 'string' && value.length < 3) {
          error = 'Login must be at least 3 characters'
        } else if (
          typeof value === 'string' &&
          !/^[a-zA-Z0-9_]+$/.test(value)
        ) {
          error = 'Login can only contain letters, numbers, and underscores'
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

      case 'avatar':
        if (value && value instanceof File) {
          const maxSize = 5 * 1024 * 1024 // 5MB
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
          ]

          if (!allowedTypes.includes(value.type)) {
            error = 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
          } else if (value.size > maxSize) {
            error = 'File size must be less than 5MB'
          }
        }
        break

      default:
        break
    }

    return error
  }

  return (
    <div className="w-full">
      <h2 className="text-4xl">Settings</h2>
      <div className="flex flex-col  gap-6 mt-6">
        <div className="flex flex-col gap-2">
          <span>Username</span>
          <input
            type="text"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            value={formData.username}
            placeholder={user.username}
            className="px-2 py-4 border border-gray-500 rounded-2xl bg-[#1F2124]"
          />
          <CustomError message={errors.username} isTouched={errors.username} />
        </div>
        {user.type !== 2 && (
          <div className="flex flex-col gap-2">
            <span>Login</span>
            <input
              type="text"
              placeholder={user.login}
              onChange={(e) =>
                setFormData({ ...formData, login: e.target.value })
              }
              value={formData.login}
              className="px-2 py-4 border border-gray-500 rounded-2xl bg-[#1F2124]"
            />
            <CustomError message={errors.login} isTouched={errors.login} />
          </div>
        )}
        {user.type === 0 && (
          <div className="flex flex-col gap-2">
            <span>Email</span>
            <input
              type="text"
              placeholder={user.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              value={formData.email}
              className="px-2 py-4 border border-gray-500 rounded-2xl bg-[#1F2124]"
            />
            <CustomError message={errors.email} isTouched={errors.email} />
          </div>
        )}
        <DragAndDrop
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          validateField={validateField}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="px-10 py-2 rounded-xl cursor-pointer bg-[#CFDEED] text-[#121417]"
      >
        Update
      </button>
    </div>
  )
}

const PassowrdSettings = () => {
  const { changePassword } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const validateField = (name: string, value: string) => {
    let error = ''
    if (!value.trim()) {
      error = `${name} is required`
    } else if (name === 'newPassword' && value.length < 6) {
      error = 'New password must be at least 6 characters'
    } else if (name === 'confirmPassword' && value !== newPassword) {
      error = 'Passwords do not match'
    }
    return error
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    )
      return
    await changePassword({ oldPassword: currentPassword, newPassword })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    // Handle password change logic here
  }

  return (
    <div className="w-full">
      <h2 className="text-4xl">Change Password</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block mb-2">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              setErrors((prev) => ({
                ...prev,
                currentPassword: validateField(
                  'currentPassword',
                  e.target.value
                ),
              }))
            }}
            className={`w-full px-2 py-4 border rounded-2xl bg-[#1F2124] outline-none ${
              errors.currentPassword ? 'border-red-500' : 'border-gray-500'
            }`}
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-sm">{errors.currentPassword}</p>
          )}
        </div>
        <div>
          <label className="block mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              setErrors((prev) => ({
                ...prev,
                newPassword: validateField('newPassword', e.target.value),
              }))
            }}
            className={`w-full px-2 py-4 border rounded-2xl bg-[#1F2124] outline-none ${
              errors.currentPassword ? 'border-red-500' : 'border-gray-500'
            }`}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">{errors.newPassword}</p>
          )}
        </div>
        <div>
          <label className="block mb-2">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setErrors((prev) => ({
                ...prev,
                confirmPassword: validateField(
                  'confirmPassword',
                  e.target.value
                ),
              }))
            }}
            className={`w-full px-2 py-4 border rounded-2xl bg-[#1F2124] outline-none ${
              errors.currentPassword ? 'border-red-500' : 'border-gray-500'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Change Password
        </button>
      </form>
    </div>
  )
}

export default function SettingsPage() {
  const [page, setPage] = useState<number>(0)
  const { user } = useAuthStore()
  if (!user) return <div className="text-white">Loading...</div>
  return (
    <div className="flex text-white py-10 h-full">
      {/* left side */}
      <div className="w-[25%] flex items-center flex-col gap-4">
        <button
          onClick={() => setPage(0)}
          className={`w-[200px] py-4 px-6 ${
            page === 0 && 'bg-[#2B3036]'
          } rounded-2xl border-1 border-gray-700 hover:scale-99 hover:bg-[#2b3036b7] duration-300 cursor-pointer`}
        >
          Account
        </button>
        <button
          onClick={() => setPage(1)}
          className={`w-[200px] py-4 px-6 ${
            page === 1 && 'bg-[#2B3036]'
          }  rounded-2xl border-1 border-gray-700 hover:scale-99 hover:bg-[#2b3036b7] duration-300 cursor-pointer`}
        >
          Security
        </button>
        <button className="w-[200px] py-4 px-6  rounded-2xl border-1 border-gray-700 hover:scale-99 hover:bg-[#2b3036b7] duration-300 cursor-pointer">
          Game Settings
        </button>
      </div>
      {/* right side */}
      <div className="h-full w-[50%]">
        {page === 0 && <Settings />}
        {page === 1 && (
          <>
            {user.type === 0 && <PassowrdSettings />}
            <FA2 />
          </>
        )}
      </div>
    </div>
  )
}
