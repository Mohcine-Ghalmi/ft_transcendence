'use client'
import Image from 'next/image'
import Link from 'next/link'

// Game Mode Cards Component
export const GameModeCards = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] items-center justify-center gap-2">
      {/* 1v1 Mode */}
      <Link href="/play/OneVsOne?mode=Online">
        <div className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50">
          <div className="relative h-[200px] overflow-hidden">
            <Image
              src="/game/1v1.png"
              alt="Play 1v1"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-1">
                  1v1 Battle
                </h3>
                <p className="text-slate-300 text-sm opacity-90">
                  Challenge players online
                </p>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-gray-900/50 transition-colors duration-300"></div>

            {/* Play Icon */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg
                className="w-4 h-4 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.5 5.5a.5.5 0 0 0-.7-.4L3.5 7.5a.5.5 0 0 0 0 .9l4.3 2.4a.5.5 0 0 0 .7-.4V5.5z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Tournament Mode */}
      <Link href="/play/tournament?mode=Online">
        <div className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50">
          <div className="relative h-[200px] overflow-hidden">
            <Image
              src="/game/Tournemant.png"
              alt="Tournament"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-1">
                  Tournament
                </h3>
                <p className="text-slate-300 text-sm opacity-90">
                  Compete for the championship
                </p>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300"></div>

            {/* Trophy Icon */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm1 5h4a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2h4v-1.28A7.002 7.002 0 0 1 3 8a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 2 0 7.002 7.002 0 0 1-6 6.92V15z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* AI Mode */}
      <Link href="/play/ai?mode=AI">
        <div className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50">
          <div className="relative h-[200px] overflow-hidden">
            <Image
              src="/game/againstAI.png"
              alt="Play vs AI"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-1">vs AI</h3>
                <p className="text-slate-300 text-sm opacity-90">
                  Practice against smart AI
                </p>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300"></div>

            {/* AI Icon */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
