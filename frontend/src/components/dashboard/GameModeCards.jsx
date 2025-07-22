'use client'
import Image from 'next/image'
import Link from 'next/link'

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
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-gamepad2-icon lucide-gamepad-2"
              >
                <line x1="6" x2="10" y1="11" y2="11" />
                <line x1="8" x2="8" y1="9" y2="13" />
                <line x1="15" x2="15.01" y1="12" y2="12" />
                <line x1="18" x2="18.01" y1="10" y2="10" />
                <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
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
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-boxes-icon lucide-boxes"
              >
                <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
                <path d="m7 16.5-4.74-2.85" />
                <path d="m7 16.5 5-3" />
                <path d="M7 16.5v5.17" />
                <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
                <path d="m17 16.5-5-3" />
                <path d="m17 16.5 4.74-2.85" />
                <path d="M17 16.5v5.17" />
                <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
                <path d="M12 8 7.26 5.15" />
                <path d="m12 8 4.74-2.85" />
                <path d="M12 13.5V8" />
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
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-origami-icon lucide-origami"
              >
                <path d="M12 12V4a1 1 0 0 1 1-1h6.297a1 1 0 0 1 .651 1.759l-4.696 4.025" />
                <path d="m12 21-7.414-7.414A2 2 0 0 1 4 12.172V6.415a1.002 1.002 0 0 1 1.707-.707L20 20.009" />
                <path d="m12.214 3.381 8.414 14.966a1 1 0 0 1-.167 1.199l-1.168 1.163a1 1 0 0 1-.706.291H6.351a1 1 0 0 1-.625-.219L3.25 18.8a1 1 0 0 1 .631-1.781l4.165.027" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
