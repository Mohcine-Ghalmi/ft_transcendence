
// Friend Suggestions Component
"use client"
import React from "react";

export const FriendSuggestions = ({ friendSuggestions }) => {
  const [suggestions, setSuggestions] = React.useState(friendSuggestions);

  const handleAddFriend = (index) => {
    setSuggestions((prev) =>
      prev.map((friend, i) =>
        i === index ? { ...friend, added: true } : friend
      )
    );
    console.log(`Invitation sent to ${suggestions[index].name}`);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6">
      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 xl:mb-6 flex-shrink-0">Friend Suggestions</h3>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 sm:space-y-3 lg:space-y-4">
        {suggestions.map((friend, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white font-medium truncate">{friend.name}</p>
              <p className={`text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl ${
                friend.status === 'Online' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {friend.status}
              </p>
            </div>
            <button 
              className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 rounded-lg text-xs sm:text-sm md:text-base lg:text-lg font-medium transition-colors ${
                friend.added 
                  ? 'bg-green-900/50 text-green-400 border border-green-800' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              disabled={friend.added}
              onClick={() => handleAddFriend(index)}
            >
              {friend.added ? 'Added' : 'Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
