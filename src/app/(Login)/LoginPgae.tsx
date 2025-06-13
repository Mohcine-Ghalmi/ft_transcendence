"use client"
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Email validation function
  const isValidEmail = (email : any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function (minimum 8 characters, at least one letter and one number)
  const isValidPassword = (password : any) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle input changes and clear errors
  const handleemailChange = (e : any) => {
    setemail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e : any) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = () => {
    const newErrors = {
      email: '',
      password: ''
    };

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 8 characters with letters and numbers';
    }

    // Set errors if any
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    // If validation passes, proceed with login
    console.log('Login attempted with:', { email, password });
    // Add your login logic here
  };

  return (
    <div className="min-h-screen  flex flex-col">
      {/* Header */}
      <header className="flex items-center bg-[#121417] justify-between px-6 py-4 border-b border-gray-700">
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image src="/vector---0.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
            <h1 className="text-white font-semibold text-lg">PingPong</h1>
          </div>
        </Link>
        <Link href="/SignUp" passHref>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Sign Up
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-white text-3xl md:text-4xl xl:text-5xl font-bold mb-2">Welcome back</h2>
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
              {errors.email && (
                <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">{errors.email}</p>
              )}
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
              {errors.password && (
                <p className="text-red-500 text-sm md:text-base xl:text-lg mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <Link href="/ResetPassword" passHref>
                <button
                  type="button"
                  className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </Link>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full h-12 md:h-16 xl:h-20 bg-white hover:bg-gray-100 text-[#121417] font-semibold rounded-lg md:rounded-xl xl:rounded-2xl transition-colors text-base md:text-lg xl:text-2xl"
            >
              Log In
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-600"></div>
              <p className="mx-4 text-gray-400 text-sm md:text-base xl:text-lg">Or continue with</p>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                className="flex-1 h-12 md:h-16 xl:h-20 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl xl:rounded-2xl flex items-center justify-center gap-3 transition-colors text-base md:text-lg xl:text-2xl"
              >
                <Image src="/google-.svg" alt="Logo" width={32} height={32} className="w-8 h-8 xl:w-12 xl:h-12" />
                Sign in with Google
              </button>

              <button
                type="button" 
                className="flex-1 h-12 md:h-16 xl:h-20 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl xl:rounded-2xl flex items-center justify-center gap-3 transition-colors text-base md:text-lg xl:text-2xl"
              >
                <Image src="/group-37.svg" alt="Logo" width={32} height={32} className="w-8 h-8 xl:w-12 xl:h-12" />
                Continue with Intra
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}