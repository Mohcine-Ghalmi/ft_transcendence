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
    <div className="rounded-2xl p-4 sm:p-6">
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-13 sm:mb-14">Friend Suggestions</h3>
      <div className="space-y-3 sm:space-y-4">
        {suggestions.map((friend, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg md:text-xl text-white font-medium truncate">{friend.name}</p>
              <p className={`text-xs sm:text-sm md:text-base ${
                friend.status === 'Online' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {friend.status}
              </p>
            </div>
            <button 
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base md:text-lg font-medium transition-colors ${
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