// components/Itinerary/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ percentage, label }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="text-sm font-bold text-blue-600">{percentage}%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;