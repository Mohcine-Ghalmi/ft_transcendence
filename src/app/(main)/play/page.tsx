"use client"
import { useState } from "react";
import { LocalGames, OnlineGames } from "./play";

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