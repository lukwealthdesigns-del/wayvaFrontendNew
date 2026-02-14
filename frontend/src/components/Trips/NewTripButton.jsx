// components/Trips/NewTripButton.jsx - Backend Integration Ready
import React from 'react';
import { FiZap, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const NewTripButton = ({ onClick, loading = false, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation to trip planner
      navigate('/plan-trip');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        w-full py-4 
        bg-gradient-to-r from-[#064473] to-[#0a5c9c] 
        text-white rounded-2xl font-bold 
        hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
        transition-all duration-200 
        flex items-center justify-center gap-3
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
        {loading ? (
          <FiLoader className="relative w-6 h-6 animate-spin" />
        ) : (
          <FiZap className="relative w-6 h-6" />
        )}
      </div>
      <span>
        {loading ? 'Creating Your Trip...' : 'Plan New Trip with AI'}
      </span>
    </button>
  );
};

export default NewTripButton;