"use client"
import Image from "next/image";
import Link from "next/link";

// Game Mode Cards Component
export const GameModeCards = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full sm:p-4 md:p-5 lg:p-20 ">
      <Link href="/play/OneVsOne?mode=Online" className="flex-1 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl w-full aspect-[4/3] shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <Image
              src="/1v1.png"
              alt="Play 1v1"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <span className="absolute top-2 left-2 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-colors duration-200">
            Play 1v1
          </span>
        </div>
      </Link>

      <Link href="/play/tournament?mode=Online" className="flex-1 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl w-full aspect-[4/3] shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <Image
              src="/Tournament.png"
              alt="Tournament"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <span className="absolute top-2 left-2 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-colors duration-200">
            Tournament
          </span>
        </div>
      </Link>

      <Link href="/play/ai?mode=AI" className="flex-1 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl w-full aspect-[4/3] shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <Image
              src="/game/againstAI.png"
              alt="Play vs AI"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <span className="absolute top-2 left-2 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-colors duration-200">
            Play vs AI
          </span>
        </div>
      </Link>
    </div>
  );
};
