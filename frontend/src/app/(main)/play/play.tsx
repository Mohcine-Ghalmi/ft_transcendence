"use client"
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';


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
export const LocalGames = () => {
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
          <Link href={`/play/OneVsOne?mode=Local`}>
            <button 
              onClick={() => handleGameClick('1v1 Match')}
              className="bg-[#BFD6ED] hover:bg-[#A7C4E2] text-black px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Local Game
            </button>
          </Link>
        }
      />

      {/* Tournament */}
      <GameModeCard
        title="Tournament"
        description="Join or create a tournament."
        subDescription="Compete in a tournament with multiple players."
        illustration={<TournamentSceneIllustration />}
        buttons={
        <Link href="/play/tournament?mode=Local">
          <button 
              onClick={() => handleGameClick('Tournament')}
              className="bg-[#BFD6ED] hover:bg-[#A7C4E2] text-black px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Create Tournament
            </button>
          </Link>
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
export const OnlineGames = () => {
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
        description="Play a single game against a friend or find a random opponent."
        subDescription="Challenge a friend to a head-to-head match or join matchmaking to find an opponent."
        illustration={<PingPongTableIllustration />}
        buttons={
          <>
            <Link href={`/play/OneVsOne?mode=Online`}>
              <button 
                onClick={() => handleGameClick('1v1 Match', 'Invite')}
                className="bg-[#BFD6ED] hover:bg-[#A7C4E2] text-black px-6 py-3 rounded-lg transition-colors duration-300"
              >
                Invite Friend
              </button>
            </Link>
            <Link href={`/play/OneVsOne?mode=Online&matchmaking=true`}>
              <button 
                onClick={() => handleGameClick('1v1 Match', 'Matchmaking')}
                className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
              >
                Random Matchmaking
              </button>
            </Link>
          </>
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
              className="bg-[#BFD6ED] hover:bg-[#A7C4E2] text-black px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Join an Online Tournament
            </button>
            <Link href="/play/tournament?mode=Online">
              <button 
                onClick={() => handleGameClick('Tournament', 'Create')}
                className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
              >
                Create One
              </button>
            </Link>
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
