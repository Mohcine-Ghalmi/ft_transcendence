// SearchBar Component
"use client"
import { Search } from 'lucide-react';
import { useState } from 'react';

export const SearchBar = ({ className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');

const handleSearch = (query: string): void => {
    // Handle search logic here
    console.log('Searching for:', query);
};

  return (
    <div className={`flex items-center relative ${className}`}>
      <Search className="w-4 h-4 text-gray-400 absolute left-2 sm:left-3" />
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
        className="pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm w-24 sm:w-32 md:w-48 lg:w-64 placeholder-gray-500 text-white"
      />
    </div>
  );
};