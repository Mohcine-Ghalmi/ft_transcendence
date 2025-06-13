"use client"
import { useRouter } from 'next/navigation';

export default function PageNotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#121417] text-white flex items-center justify-center">
      <div className="text-center p-6 sm:p-8 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-gray-600 bg-clip-text">
            404
          </h1>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-400 text-lg mb-2">
            The page you're looking for has gone out of bounds.
          </p>
          <p className="text-gray-500 text-sm">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 transition-color rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}