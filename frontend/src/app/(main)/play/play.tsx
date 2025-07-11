"use client"
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


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
  const router = useRouter();

  const handleLocalGame = (gameType: string, difficulty?: string) => {
    if (gameType === 'tournament') {
      router.push('/play/tournament');
    } else if (gameType === 'one-vs-one') {
      router.push('/play/OneVsOne');
    } else {
      router.push(`/play/game/local/${gameType}${difficulty ? `/${difficulty}` : ''}`);
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
              onClick={() => handleLocalGame('1v1 Match')}
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
              onClick={() => handleLocalGame('Tournament')}
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
              onClick={() => handleLocalGame('AI', 'Easy')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Easy
            </button>
            <button 
              onClick={() => handleLocalGame('AI', 'Medium')}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Medium
            </button>
            <button 
              onClick={() => handleLocalGame('AI', 'Hard')}
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
  const router = useRouter();

  const handleOnlineGame = (gameType: string, difficulty?: string, action?: string) => {
    if (gameType === 'tournament') {
      router.push('/play/tournament');
    } else if (gameType === 'one-vs-one') {
      router.push('/play/OneVsOne');
    } else {
      router.push(`/play/${gameType}${difficulty ? `/${difficulty}` : ''}${action ? `/${action}` : ''}`);
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
                onClick={() => handleOnlineGame('1v1 Match', null, 'Invite')}
                className="bg-[#BFD6ED] hover:bg-[#A7C4E2] text-black px-6 py-3 rounded-lg transition-colors duration-300"
              >
                Invite Friend
              </button>
            </Link>
            <Link href={`/play/OneVsOne?mode=Online&matchmaking=true`}>
              <button 
                onClick={() => handleOnlineGame('1v1 Match', null, 'Matchmaking')}
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
            <Link href="/play/tournament/join">
              <button 
                onClick={() => handleOnlineGame('tournament', null, 'Join')}
                className="bg-[#BFD6ED] hover:bg-[#A7C4E2] text-black px-6 py-3 rounded-lg transition-colors duration-300"
              >
                Join an Online Tournament
              </button>
            </Link>
            <Link href="/play/tournament?mode=Online">
              <button 
                onClick={() => handleOnlineGame('Tournament', null, 'Create')}
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
              onClick={() => handleOnlineGame('AI', 'Easy', null)}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Easy
            </button>
            <button 
              onClick={() => handleOnlineGame('AI', 'Medium', null)}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Medium
            </button>
            <button 
              onClick={() => handleOnlineGame('AI', 'Hard', null)}
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
