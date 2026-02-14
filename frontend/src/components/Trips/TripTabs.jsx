// components/Trips/TripTabs.jsx
import React from 'react';

const TripTabs = ({ activeTab, onTabChange }) => {
  const tabs = ['Active', 'Passed'];
  
  return (
    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 py-3 rounded-lg font-medium transition ${
            activeTab === tab
              ? 'bg-white shadow-sm text-[#064473]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TripTabs;