"use client"
import Image from 'next/image';
import React, { useState } from 'react';

// Tab Navigation Component
const TabNavigation = ({ selectedTab , onTabChange } : {selectedTab : string , onTabChange : (tab: string)=>void}) => {
  return (
    <div className=" flex justify-center mb-12">
      <div className="bg-[#1e2328] rounded-full p-1 flex">
        <button
          onClick={() => onTabChange('Local')}
          className={`px-8 py-3 rounded-full transition-all duration-300 ${
            selectedTab === 'Local'
              ? 'bg-[#2d3748] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Local
        </button>
        <button
          onClick={() => onTabChange('Online')}
          className={`px-8 py-3 rounded-full transition-all duration-300 ${
            selectedTab === 'Online'
              ? 'bg-[#2d3748] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Online
        </button>
      </div>
    </div>
  );
};

// Ping Pong Table Illustration Component
const PingPongTableIllustration = () => {
  return (
     <div className="absolute inset-0 overflow-hidden">
        <Image
            src="/game/1v1.png"
            alt="Play 1v1"
            fill
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
    </div>
  );
};

// Tournament Scene Illustration Component
const TournamentSceneIllustration = () => {
  return (
      <div className="absolute inset-0 overflow-hidden">
        <Image
         src="/game/Tournemant.png" 
            alt="Tournament Scene"
            fill
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
    </div>
  );
};

// AI Sphere Illustration Component
const AISphereIllustration = () => {
  return (
     <div className="absolute inset-0 overflow-hidden">
        <Image
         src="/game/againstAI.png" 
            alt="AI Robot"
            fill
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
    </div>
    
  );
};

// Game Mode Card Component
const GameModeCard = ({ title, description, subDescription, illustration, buttons }) => {
    return (
        <div className="bg-[#121417] rounded-2xl overflow-hidden hover:bg-[#252a32] transition-all duration-300 max">
            <div className="flex flex-col lg:flex-row min-h-[360px]">
                <div className="lg:w-1/2 relative">
                    {illustration}
                </div>
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-4">{title}</h2>
                    <p className="text-gray-400 mb-2">{description}</p>
                    <p className="text-gray-400 mb-8">{subDescription}</p>
                    <div className="flex justify-end space-x-4">
                        {buttons}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Local Games Component
const LocalGames = () => {
  const handleGameClick = (gameType: string, difficulty: string | null = null) => {
    if (difficulty) {
      console.log(`Game Type: Local ${gameType} - Difficulty: ${difficulty}`);
    } else {
      console.log(`Game Type: Local ${gameType}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1v1 Match */}
      <GameModeCard
        title="1v1 Match"
        description="Play a single game against a friend."
        subDescription="Challenge a friend to a head-to-head match."
        illustration={<PingPongTableIllustration />}
        buttons={
          <button 
            onClick={() => handleGameClick('1v1 Match')}
            className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Local Game
          </button>
        }
      />

      {/* Tournament */}
      <GameModeCard
        title="Tournament"
        description="Join or create a tournament."
        subDescription="Compete in a tournament with multiple players."
        illustration={<TournamentSceneIllustration />}
        buttons={
          <button 
            onClick={() => handleGameClick('Tournament')}
            className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Create Tournament
          </button>
        }
      />

      {/* Play Against AI */}
      <GameModeCard
        title="Play Against AI"
        description="Challenge an AI player."
        subDescription="Test your skills against an AI opponent."
        illustration={<AISphereIllustration />}
        buttons={
          <>
            <button 
              onClick={() => handleGameClick('AI', 'Easy')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Easy
            </button>
            <button 
              onClick={() => handleGameClick('AI', 'Medium')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Medium
            </button>
            <button 
              onClick={() => handleGameClick('AI', 'Hard')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Hard
            </button>
          </>
        }
      />
    </div>
  );
};

// Online Games Component
const OnlineGames = () => {
  const handleGameClick = (gameType, action = null, difficulty = null) => {
    if (difficulty) {
      console.log(`Game Type: Online ${gameType} - Difficulty: ${difficulty}`);
    } else if (action) {
      console.log(`Game Type: Online ${gameType} - Action: ${action}`);
    } else {
      console.log(`Game Type: Online ${gameType}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Online 1v1 Match */}
      <GameModeCard
        title="1v1 Match"
        description="Play a single game against a friend."
        subDescription="Challenge a friend to a head-to-head match."
        illustration={<PingPongTableIllustration />}
        buttons={
          <button 
            onClick={() => handleGameClick('1v1 Match', 'Invite')}
            className="bg-[#6b7280] hover:bg-[#7b8390] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Invite
          </button>
        }
      />

      {/* Online Tournament */}
      <GameModeCard
        title="Tournament"
        description="Join or create a tournament."
        subDescription="Compete in a tournament with multiple players."
        illustration={<TournamentSceneIllustration />}
        buttons={
          <>
            <button 
              onClick={() => handleGameClick('Tournament', 'Join')}
              className="bg-[#6b7280] hover:bg-[#7b8390] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Join Tournament
            </button>
            <button 
              onClick={() => handleGameClick('Tournament', 'Create')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Create One
            </button>
          </>
        }
      />

      {/* Online Play Against AI */}
      <GameModeCard
        title="Play Against AI"
        description="Challenge an AI player."
        subDescription="Test your skills against an AI opponent."
        illustration={<AISphereIllustration />}
        buttons={
          <>
            <button 
              onClick={() => handleGameClick('AI', null, 'Easy')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Easy
            </button>
            <button 
              onClick={() => handleGameClick('AI', null, 'Medium')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Medium
            </button>
            <button 
              onClick={() => handleGameClick('AI', null, 'Hard')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Hard
            </button>
          </>
        }
      />
    </div>
  );
};

// Main Component
export default function ChooseYourGame() {
  const [selectedTab, setSelectedTab] = useState('Local');

  return (
    <div className="h-full text-white">
      <main className="pt-20 p-3 sm:p-4 lg:p-6 w-full min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
            Choose Your Game
          </h1>

          <TabNavigation 
            selectedTab={selectedTab} 
            onTabChange={setSelectedTab} 
          />

          {selectedTab === 'Local' ? <LocalGames /> : <OnlineGames />}
        </div>
      </main>
    </div>
  );
}