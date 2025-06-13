import Image from "next/image";
import Link from "next/link";

// Game Mode Cards Component
export const GameModeCards = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-16 xl:gap-32 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="w-full sm:w-auto">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl sm:rounded-3xl w-full sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] h-48 sm:h-56 md:h-64 lg:h-72 shadow-xl sm:shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <Image
              src="/1v1.png"
              alt="Play 1v1"
              fill
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-5 md:left-5 lg:top-6 lg:left-6 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2 md:py-3 rounded-full text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold transition-colors duration-200">
            Play 1v1
          </span>
        </div>
      </Link>

      <Link href="/" className="w-full sm:w-auto">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl sm:rounded-3xl w-full sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] h-48 sm:h-56 md:h-64 lg:h-72 shadow-xl sm:shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <Image
              src="/Tournament.png"
              alt="Tournament"
              fill
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-5 md:left-5 lg:top-6 lg:left-6 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2 md:py-3 rounded-full text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold transition-colors duration-200">
            Tournament
          </span>
        </div>
      </Link>
    </div>
  );
};