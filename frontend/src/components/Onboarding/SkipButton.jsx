// components/Onboarding/SkipButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SkipButton = () => {
  const navigate = useNavigate();

  const handleSkip = () => {
    // Navigate to onboarding/1, then they can skip to auth
    navigate('/signup');
  };

  return (
    <button
      onClick={handleSkip}
      className="absolute top-6 right-6 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
    >
      Skip
    </button>
  );
};

export default SkipButton;