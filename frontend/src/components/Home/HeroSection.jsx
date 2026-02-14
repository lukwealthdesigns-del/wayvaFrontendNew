// components/Home/HeroSection.jsx
import React from 'react';
import { FiSearch } from 'react-icons/fi';

const HeroSection = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">WAYVA AI Travel Plan...</h1>
      <p className="text-gray-600 mb-6">Where would you love to go today?</p>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search destinations, activities..."
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Filter Tabs */}
      <div className="flex space-x-4 overflow-x-auto pb-2 mb-6">
        {['All', 'Popular', 'Recommended', 'Most Viewed'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
              tab === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab} {tab === 'All' && <span className="ml-1 text-sm">0</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;