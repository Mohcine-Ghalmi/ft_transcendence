"use client"
import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null as File | null,
    twoFactorCode: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    twoFactorCode: ''
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    avatar: false,
    twoFactorCode: false
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateField = (name: string, value: string | File | null) => {
    let error = '';
    
    switch (name) {
      case 'username':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Username is required';
        } else if (typeof value === 'string' && value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (typeof value === 'string' && !/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;
        
      case 'email':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Email is required';
        } else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (typeof value === 'string' && value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (typeof value === 'string' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (typeof value === 'string' && value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      case 'avatar':
        // Make avatar required - remove this condition if avatar should be optional
        if (!value) {
          error = 'Please upload an avatar image';
        } else if (value && value instanceof File) {
          const maxSize = 5 * 1024 * 1024; // 5MB
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          
          if (!allowedTypes.includes(value.type)) {
            error = 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
          } else if (value.size > maxSize) {
            error = 'File size must be less than 5MB';
          }
        }
        break;

        case 'twoFactorCode':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Two-factor code is required';
        } else if (typeof value === 'string' && !/^\d{6}$/.test(value)) {
          error = 'Please enter a valid 6-digit code';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // Special case: revalidate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordError
      }));
    }
  };

  const handleAvatarUpload = (file: File) => {
    const error = validateField('avatar', file);
    setErrors(prev => ({
      ...prev,
      avatar: error
    }));

    if (!error) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Mark avatar as touched
    setTouched(prev => ({
      ...prev,
      avatar: true
    }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      // Mark step 1 fields as touched
      setTouched(prev => ({
        ...prev,
        username: true,
        email: true,
        password: true,
        confirmPassword: true
      }));
      
      // Validate step 1 fields
      const newErrors = {
        ...errors,
        username: validateField('username', formData.username),
        email: validateField('email', formData.email),
        password: validateField('password', formData.password),
        confirmPassword: validateField('confirmPassword', formData.confirmPassword)
      };
      
      setErrors(newErrors);
      
      // Check if step 1 is valid
      const isStep1Valid = !newErrors.username && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
      
      if (isStep1Valid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Mark avatar as touched
      setTouched(prev => ({
        ...prev,
        avatar: true
      }));

      // Validate avatar
      const avatarError = validateField('avatar', formData.avatar);
      setErrors(prev => ({
        ...prev,
        avatar: avatarError
      }));

      // Check if avatar is valid (or if you want to make it optional, remove this validation)
      if (!avatarError) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      // Final step - complete registration
      console.log('Form submitted:', formData);
      // Here you would typically handle the final form submission
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipFor2FA = () => {
    console.log('Skipping 2FA for now');
    // Complete registration without 2FA
    console.log('Form submitted:', formData);
    alert('Account created successfully!');
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in clicked');
  };

  const handleContinueWithIntra = () => {
    console.log('Continue with intra clicked');
  };

  const handle2FaVerify = (e: any) => {
    e.preventDefault();
    setTouched(prev => ({
      ...prev,
      twoFactorCode: true
    }));
    const error = validateField('twoFactorCode', formData.twoFactorCode);
    setErrors(prev => ({
      ...prev,
      twoFactorCode: error
    }));
    if (!error) {
      // 2FA code is valid
      alert('Account created successfully!');
      // You can add further logic here (e.g., redirect, API call)
    }
  };

  return (
    <div className="min-h-screen bg-[#121417] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        {/* Logo */}
        <div className="hover:text-white">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <Image src="/vector---0.svg" alt="Logo" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8" />
            <h1 className="text-white font-semibold text-base sm:text-lg">PingPong</h1>
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
            {currentStep === 1 ? 'Create your account' : currentStep === 2 ? 'Upload avatar' : 'Welcome!'}
          </h1>
          
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
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
                  {errors.username && touched.username && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">{errors.username}</p>
                  )}
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
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">{errors.email}</p>
                  )}
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
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">{errors.password}</p>
                  )}
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
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm md:text-base xl:text-lg mb-6">Upload your avatar</p>
                </div>
                {/* Avatar Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg md:rounded-xl xl:rounded-2xl p-20 md:p-12 xl:p-16 transition-colors cursor-pointer ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-500/10'
                      : errors.avatar && touched.avatar
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
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-24 h-24 md:w-32 md:h-32 xl:w-40 xl:h-40 rounded-full mx-auto object-cover border-2 border-gray-600"
                        />
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="w-16 h-16 md:w-24 md:h-24 xl:w-32 xl:h-32 bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                          <svg className="w-8 h-8 md:w-12 md:h-12 xl:w-16 xl:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <p className="text-white font-medium mb-2 text-base md:text-lg xl:text-2xl">
                      {avatarPreview ? 'Change your avatar' : 'Drag and drop your avatar here'}
                    </p>
                    <p className="text-gray-400 text-sm md:text-base xl:text-lg mb-4">Or browse to choose a file</p>
                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 md:px-8 xl:px-12 py-2 md:py-3 xl:py-4 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                {errors.avatar && touched.avatar && (
                  <p className="text-red-500 text-sm md:text-base xl:text-lg text-center">{errors.avatar}</p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl xl:text-4xl font-semibold mb-2">Two-Factor Authentication</h2>
                  <p className="text-gray-400 text-sm md:text-base xl:text-lg mb-6">
                    Scan the QR code with your authenticator app or manually enter the code below.
                  </p>
                </div>
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 md:p-6 xl:p-10 rounded-lg md:rounded-xl xl:rounded-2xl">
                    <Image src="/qrcode_demo.png" alt="qr code demo" width={400} height={400} className="w-40 h-40 md:w-64 md:h-64 xl:w-96 xl:h-96" />
                  </div>
                </div>
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
                    <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1 text-center">{errors.twoFactorCode}</p>
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
            <div className="py-6">
              <div className="text-sm md:text-base xl:text-lg text-gray-400 mb-2">Account Creation Progress</div>
              <div className="w-full bg-gray-700 rounded-full h-2 md:h-3 xl:h-4">
                <div 
                  className="bg-blue-500 h-2 md:h-3 xl:h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs md:text-sm xl:text-base text-gray-500 mt-1">Step {currentStep} of 3</div>
            </div>
            {/* Social Login Buttons - Only show on step 1 */}
            {currentStep === 1 && (
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex-1 h-12 md:h-16 xl:h-20 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl xl:rounded-2xl flex items-center justify-center gap-3 transition-colors text-base md:text-lg xl:text-2xl"
                >
                  <Image src="/google-.svg" alt="Google" width={32} height={32} className="w-8 h-8 xl:w-12 xl:h-12" />
                  Sign in with Google
                </button>
                <button
                  type="button" 
                  onClick={handleContinueWithIntra}
                  className="flex-1 h-12 md:h-16 xl:h-20 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl xl:rounded-2xl flex items-center justify-center gap-3 transition-colors text-base md:text-lg xl:text-2xl"
                >
                  <Image src="/group-37.svg" alt="Intra" width={32} height={32} className="w-8 h-8 xl:w-12 xl:h-12" />
                  Continue with Intra
                </button>
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
                  {currentStep === 1 ? 'Next' : currentStep === 2 ? 'Next' : 'Finish'}
                </button>
              </div>
            )}
          </form>

          {/* Already have account link */}
          {currentStep < 3 && (
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
  );
}