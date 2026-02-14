// components/Layout/AuthLayout.jsx
import React from 'react';

const AuthLayout = ({ children, showBackButton = false, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Status Bar */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showBackButton && (
              <button 
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <span className="text-xl">‹</span>
              </button>
            )}
            <div className="text-sm text-gray-500 font-medium">9:41</div>
          </div>
          <div className="w-6 h-6"></div> {/* Spacer */}
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6">
        {children}
      </main>

      {/* Bottom Padding for Mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default AuthLayout;