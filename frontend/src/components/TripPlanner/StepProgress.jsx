// components/TripPlanner/StepProgress.jsx - UI Component (No backend changes)
import React from 'react';

const StepProgress = ({ currentStep, totalSteps = 6 }) => {
  const PRIMARY_COLOR = '#064473';
  
  return (
    <div className="px-6 pt-6">
      {/* Centered Step Text */}
      <div className="flex items-center justify-center mb-3">
        <span 
          className="text-sm font-medium"
          style={{ color: PRIMARY_COLOR }}
        >
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      {/* Progress Bar Container */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${(currentStep / totalSteps) * 100}%`,
            backgroundColor: PRIMARY_COLOR
          }}
        ></div>
      </div>
    </div>
  );
};

export default StepProgress;