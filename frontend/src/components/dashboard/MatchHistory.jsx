import { useEffect, useState } from 'react'
import { useAuthStore } from '../../(zustand)/useAuthStore'
import { formatDate } from '../../app/(main)/chat/components/LeftSide'

// Match History Component
export const MatchHistory = ({ matchHistory }) => {
  const { userDetails, user } = useAuthStore()
  const [matchHistoryData, setMatchHistoryData] = useState([])
  useEffect(() => {
    if (userDetails?.matchHistory?.length > 0)
      setMatchHistoryData(userDetails?.matchHistory || [])
  }, [matchHistory, userDetails])
  return (
    <div className="flex flex-col overflow-hidden xl:w-[70%] w-full">
      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 p-2 flex-shrink-0">
        Match History
      </h3>
      <div className="border border-gray-700 rounded-2xl overflow-hidden flex-1 min-h-[350px]">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80 border-b border-gray-500 sticky top-0">
              <tr className="text-gray-200">
                <th className="text-left py-2 sm:py-3 lg:py-4 xl:py-5 px-2 sm:px-3 lg:px-4 xl:px-5 font-semibold text-xs sm:text-sm md:text-base ">
                  Date
                </th>
                <th className="text-left py-2 sm:py-3 lg:py-4 xl:py-5 px-2 sm:px-3 lg:px-4 xl:px-5 font-semibold text-xs sm:text-sm md:text-base ">
                  Opponent
                </th>
                <th className="text-left py-2 sm:py-3 lg:py-4 xl:py-5 px-2 sm:px-3 lg:px-4 xl:px-5 font-semibold text-xs sm:text-sm md:text-base ">
                  Result
                </th>
                <th className="text-left py-2 sm:py-3 lg:py-4 xl:py-5 px-2 sm:px-3 lg:px-4 xl:px-5 font-semibold text-xs sm:text-sm md:text-base ">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {matchHistoryData.length > 0 ? (
                matchHistoryData.map((match, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-700 hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="py-2 sm:py-3 lg:py-4 xl:py-5 px-2 sm:px-3 lg:px-4 xl:px-5 text-gray-400 text-xs sm:text-sm md:text-base ">
                      {formatDate(match.started_at)}
                    </td>
                    <td className="py-2 sm:py-3 lg:py-4 xl:py-5 px-2 sm:px-3 lg:px-4 xl:px-5 text-white font-medium text-xs sm:text-sm md:text-base ">
                      {match.player1_email === user.email
                        ? match.player2_email
                        : match.player1_email}
                    </td>
                    <td className="py-2 sm:py-3 lg:py-4 xl:py-5 px-2 sm:px-3 lg:px-4 xl:px-5">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.winner === user.email
                            ? 'bg-green-900/50 text-green-400 border border-green-800'
                            : 'bg-red-900/50 text-red-400 border border-red-800'
                        }`}
                      >
                        {match.winner === user.email ? 'Win' : 'Loss'}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 lg:py-4 xl:py-5 px-2 sm:px-3 lg:px-4 xl:px-5 text-white font-mono text-xs sm:text-sm md:text-base ">
                      {match.player1_score}-{match.player2_score}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400">
                    No match history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
