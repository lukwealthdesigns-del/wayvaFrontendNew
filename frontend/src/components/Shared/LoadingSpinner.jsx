// components/Shared/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'large' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
        
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;