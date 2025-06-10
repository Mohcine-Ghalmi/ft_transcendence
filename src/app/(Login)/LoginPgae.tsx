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
    <div className="min-h-screen bg-[#121417] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Image src="/vector---0.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
          <h1 className="text-white font-semibold text-lg">PingPong</h1>
        </div>
        <Link href="/SignUp" passHref>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Sign Up
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-white text-3xl font-bold mb-2">Welcome back</h2>
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleemailChange}
                className={`w-full h-12 px-4 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full h-12 px-4 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
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
              className="w-full h-12 bg-white hover:bg-gray-100 text-[#121417] font-semibold rounded-lg transition-colors"
            >
              Log In
            </button>

            {/* Divider */}
            <div className="text-center text-gray-400 text-sm my-6">
              Or continue with
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-3 transition-colors"
              >
                <Image src="/google-.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
                Sign in with Google
              </button>

              <button
                type="button" 
                className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-3 transition-colors"
              >
                <Image src="/group-37.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
                Continue with Intra
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}