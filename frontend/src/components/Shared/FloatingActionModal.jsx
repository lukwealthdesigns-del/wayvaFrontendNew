// components/Shared/FloatingActionModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiCompass, FiZap, FiMessageSquare } from 'react-icons/fi';

const FloatingActionModal = ({ onClose }) => {
  const navigate = useNavigate();

  const options = [
    {
      id: 1,
      title: 'Find Destinations',
      summary: 'Budget-friendly destinations',
      icon: <FiCompass className="w-6 h-6" />,
      action: () => navigate('/trips'),
      color: 'bg-[#064473]'
    },
    {
      id: 2,
      title: 'Plan New Trip',
      summary: 'AI-powered itinerary',
      icon: <FiZap className="w-6 h-6" />,
      action: () => navigate('/plan-trip'),
      color: 'bg-[#064473]'
    },
    {
      id: 3,
      title: 'Chat Assistant',
      summary: 'Travel questions answered',
      icon: <FiMessageSquare className="w-6 h-6" />,
      action: () => navigate('/ai-chat'),
      color: 'bg-[#064473]'
    }
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#064473] flex items-center justify-center mr-2">
              <FiZap className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Row 1: Find Destinations & Plan New Trip */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {options.slice(0, 2).map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  option.action();
                  onClose();
                }}
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[#064473] hover:shadow-md transition-all duration-200 text-center group"
              >
                {/* Icon - Center Top with Primary Color */}
                <div className="w-12 h-12 rounded-full bg-[#064473] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    {option.icon}
                  </div>
                </div>
                
                {/* Title */}
                <h4 className="font-bold text-gray-900 text-sm mb-1">{option.title}</h4>
                
                {/* 3-word Summary */}
                <p className="text-xs text-[#064473] font-medium">{option.summary}</p>
              </button>
            ))}
          </div>
          
          {/* Row 2: Chat Assistant (centered) */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                options[2].action();
                onClose();
              }}
              className="w-full max-w-[200px] p-4 bg-white border border-gray-200 rounded-xl hover:border-[#064473] hover:shadow-md transition-all duration-200 text-center group"
            >
              {/* Icon - Center Top with Primary Color */}
              <div className="w-12 h-12 rounded-full bg-[#064473] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <div className="text-white">
                  {options[2].icon}
                </div>
              </div>
              
              {/* Title */}
              <h4 className="font-bold text-gray-900 text-sm mb-1">{options[2].title}</h4>
              
              {/* 3-word Summary */}
              <p className="text-xs text-[#064473] font-medium">{options[2].summary}</p>
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            AI-powered • Simple • Fast
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingActionModal;