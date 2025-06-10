"use client"
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
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
    
    // Validate field if it has been touched
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
    
    // Special case: revalidate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordError
      }));
    }
  };

   const handleSubmit = (e: any) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    
    // Validate all fields
    const newErrors = {
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword)
    };
    
    setErrors(newErrors);
    
    // Check if form is valid
    const isValid = Object.values(newErrors).every(error => error === '');
    
    if (isValid) {
      console.log('Form submitted:', formData);
      // Proceed with form submission
    } else {
      console.log('Form has errors:', newErrors);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in logic
    console.log('Google sign in clicked');
  };

  const handleContinueWithIntra = () => {
    // Handle continue with intro logic
    console.log('Continue with intro clicked');
  };

  return (
    <div className="full-h bg-[#121417] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
        <Image src="/vector---0.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
          <h1 className="text-white font-semibold text-lg">PingPong</h1>
        </div>
        <Link href="/" passHref>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            LogIn
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-8">Create your account</h1>
          
          <div className="space-y-6">
            {/* Username Input */}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none transition-colors placeholder-gray-400 ${
                  errors.username
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
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
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none transition-colors placeholder-gray-400 ${
                  errors.email && touched.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none transition-colors placeholder-gray-400 ${
                  errors.password && touched.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
              {errors.password && touched.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
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
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none transition-colors placeholder-gray-400 ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Progress Section */}
            <div className="py-4">
              <div className="text-sm text-gray-400 mb-2">Account Creation Progress</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Step {currentStep} of 3</div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-3 transition-colors"
              >
                <Image src="/google-.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
                Sign in with Google
              </button>

              <button
                type="button" 
                onClick={handleContinueWithIntra}
                className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-3 transition-colors"
              >
                <Image src="/group-37.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
                Continue with Intra
              </button>
            </div>

            {/* Next Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Next
              </button>
          </div>

          {/* Already have account link */}
          <div className="text-center mt-6">
            <span className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/">
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  Sign in
                </button>
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}