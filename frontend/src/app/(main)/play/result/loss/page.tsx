"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function LossPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const winner = searchParams.get('winner') || 'Opponent';
  const loser = searchParams.get('loser') || 'You';

  const handleBackToMenu = () => {
    router.push('/play');
  };

  const handleRematch = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Better luck next time, Sleeps!
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          You played a great game against {winner}, but unfortunately, you didn't win this time. Keep practicing, and you'll get them next time!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToMenu}
            className="bg-[#BFD6ED] hover:bg-[#A7C4E2] text-black px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
          >
            Back to Main Menu
          </button>
          
          <button
            onClick={handleRematch}
            className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
          >
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LossPage() {
  return (
      <LossPageContent />
  );
}