// components/Onboarding/OnboardingPagination.jsx
import React from 'react';

const OnboardingPagination = ({ currentSlide, totalSlides, onDotClick }) => {
  return (
    <div className="flex justify-center space-x-2 mt-8">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`w-2 h-2 rounded-full transition-all ${
            index === currentSlide
              ? 'w-8 bg-blue-600'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OnboardingPagination;