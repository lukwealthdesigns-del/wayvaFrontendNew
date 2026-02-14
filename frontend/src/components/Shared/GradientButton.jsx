// components/Shared/SectionHeader.jsx
import React from 'react';

const SectionHeader = ({ title, actionText, onAction }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {actionText && (
        <button 
          onClick={onAction}
          className="text-blue-600 font-medium text-sm hover:text-blue-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default SectionHeader;