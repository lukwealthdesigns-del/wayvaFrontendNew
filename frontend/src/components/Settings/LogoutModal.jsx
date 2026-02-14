// components/Settings/LogoutModal.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const LogoutModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;