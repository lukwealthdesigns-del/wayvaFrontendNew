// components/Settings/SettingsSection.jsx
import React from 'react';

const SettingsSection = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden mb-6 ${className}`}>
      {title && (
        <div 
          className="px-6 py-4 border-b border-gray-100"
          style={{ borderLeft: '4px solid #064473' }}
        >
          <h2 
            className="text-lg font-bold text-gray-900"
            style={{ color: '#064473' }}
          >
            {title}
          </h2>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default SettingsSection;