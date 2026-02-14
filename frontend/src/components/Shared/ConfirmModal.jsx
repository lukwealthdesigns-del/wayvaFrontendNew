// components/Shared/FloatingActionModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCompass, FiZap, FiMessageSquare, FiX } from 'react-icons/fi';

const FloatingActionModal = ({ onClose }) => {
  const navigate = useNavigate();

  const options = [
    {
      id: 1,
      title: 'Find Destinations by Budget',
      description: 'AI-powered destination suggestions based on your budget',
      icon: <FiCompass className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      action: () => {
        onClose();
        navigate('/trips');
      }
    },
    {
      id: 2,
      title: 'Plan New Trip with AI',
      description: 'Create a personalized itinerary with AI assistance',
      icon: <FiZap className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      action: () => {
        onClose();
        navigate('/plan-trip');
      }
    },
    {
      id: 3,
      title: 'Chat with AI Assistant',
      description: 'Get travel advice and answer questions',
      icon: <FiMessageSquare className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      action: () => {
        onClose();
        navigate('/ai-chat');
      }
    }
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#064473] to-[#0a6db1] flex items-center justify-center mr-3">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Options Grid */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 text-center">
            Choose an option to get started with your travel planning
          </p>
          
          <div className="space-y-4">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-start">
                  {/* Icon with gradient */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                    <div className="text-white">
                      {option.icon}
                    </div>
                  </div>
                  
                  {/* Text content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="text-gray-400 group-hover:text-[#064473] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            AI-powered features • Real-time travel intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingActionModal;