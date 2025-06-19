
// Friends Section Component
export const FriendsSection = ({ friends }) => {
  const challenge = (friend) => () => {
    console.log('Challenged:', friend.name);
  };

  return (
    <div className="rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6">
      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
        Friends
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {friends.map((friend, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3 lg:gap-4 bg-gray-800/30 rounded-xl p-2 sm:p-3 lg:p-4 border border-gray-700/30">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 group">
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">{friend.name}</p>
              <p className={`text-xs sm:text-sm lg:text-base xl:text-lg ${
                friend.status === 'Online' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {friend.status}
              </p>
            </div>
            <button 
              className="bg-gray-700 hover:bg-gray-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-colors"
              onClick={challenge(friend)}>
              Challenge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
