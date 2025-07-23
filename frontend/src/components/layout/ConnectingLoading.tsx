export default function ConnectingLoading({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full absolute top-0 left-0 z-50 bg-[#121417] overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse"></div>
        <div className="grid grid-cols-12 gap-px h-full">
          {[...Array(144)].map((_, i) => (
            <div key={i} className="border-cyan-500/10 border-r border-b"></div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <div className="border border-gray-400/50 rounded-lg p-8 bg-[#121417]/80 backdrop-blur">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-gray-400 rounded-full animate-spin border-t-transparent"></div>
              <div className="absolute inset-0 w-8 h-8 border-2 border-transparent rounded-full animate-ping border-t-gray-400/50"></div>
            </div>
          </div>

          <div className="text-gray-400 font-mono text-xl mb-3 text-center tracking-wide">
            {'> ESTABLISHING_CONNECTION...'}
          </div>

          <div className="text-gray-300/70 font-mono text-xs text-center">
            {text}
          </div>

          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-sm animate-pulse delay-0"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-sm animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-sm animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
