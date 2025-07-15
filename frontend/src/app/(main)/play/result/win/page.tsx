"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function WinPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const winner = searchParams.get('winner') || 'You';
  const loser = searchParams.get('loser') || 'Opponent';

  const handleBackToMenu = () => {
    router.push('/play');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Congratulations, you won!
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          Your skill and strategy shone brightly on the table. Well played!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToMenu}
            className="bg-[#BFD6ED] hover:bg-[#A7C4E2] text-black px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WinPage() {
  return (
    <WinPageContent />
  );
}