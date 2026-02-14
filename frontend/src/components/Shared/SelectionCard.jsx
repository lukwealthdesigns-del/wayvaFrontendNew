// components/Shared/SelectionCard.jsx
import React from 'react';

const SelectionCard = ({ 
  title, 
  description, 
  icon, 
  isSelected, 
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl text-left transition-all ${
        isSelected 
          ? 'bg-blue-50 border-2 border-blue-500' 
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
      } ${className}`}
    >
      <div className="flex items-start space-x-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

export default SelectionCard;