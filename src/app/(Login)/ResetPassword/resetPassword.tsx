"use client"
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      console.log('Reset link sent to:', email);
    }, 1500);
  };

  return (
    <div className="w-full bg-[#121417] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src="/vector---0.svg" alt="Logo" width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-white font-semibold text-base sm:text-lg">PingPong</h1>
        </div>
        <Link href="/" passHref>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base">
            LogIn
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] px-4 sm:px-6 py-8">
        <div className="w-full max-w-sm sm:max-w-md ">
          {!isSubmitted ? (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-center mb-3">
                Forgot your password?
              </h1>
              
              <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm leading-relaxed px-2">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>

              <div className="space-y-4 sm:space-y-6">
                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!email || isLoading}
                  className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center mt-6">
                <span className="text-gray-400 text-xs sm:text-sm">
                  Remember your password?{' '}
                  <Link href="/">
                    <button className="text-blue-400 hover:text-blue-300 transition-colors underline sm:no-underline sm:hover:underline">
                      Log in
                    </button>
                  </Link>
                </span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-center mb-3">
                Check your email
              </h1>
              
              <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm leading-relaxed px-2">
                We've sent a password reset link to <span className="text-white break-all">{email}</span>
              </p>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Try another email
                </button>
                
                <Link href="/">
                  <button className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm sm:text-base">
                    Back to Login
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}