// Match History Component
export const MatchHistory = ({ matchHistory }) => {
  return (
    <div className="">
      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 p-6 sm:p-8">
        Match History
      </h3>
      <div className="border border-gray-700 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/80 border-b border-red-700">
            <tr className="text-gray-200">
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm md:text-base">
                Date
              </th>
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm md:text-base">
                Opponent
              </th>
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm md:text-base">
                Result
              </th>
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm md:text-base">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {matchHistory.map((match, index) => (
              <tr key={index} className="border-t border-gray-700 hover:bg-gray-900/30 transition-colors">
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-400 text-xs sm:text-sm md:text-base">
                  {match.date}
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-white font-medium text-xs sm:text-sm md:text-base">
                  {match.opponent}
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.result === 'Win' 
                      ? 'bg-green-900/50 text-green-400 border border-green-800' 
                      : 'bg-red-900/50 text-red-400 border border-red-800'
                  }`}>
                    {match.result}
                  </span>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-white font-mono text-xs sm:text-sm md:text-base">
                  {match.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};