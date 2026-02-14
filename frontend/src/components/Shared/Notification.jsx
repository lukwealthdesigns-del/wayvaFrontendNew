// components/Shared/Notification.jsx
import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const Notification = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      icon: FiCheckCircle,
      iconColor: 'text-green-500'
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: FiAlertCircle,
      iconColor: 'text-red-500'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      icon: FiAlertCircle,
      iconColor: 'text-yellow-500'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: FiAlertCircle,
      iconColor: 'text-blue-500'
    }
  };

  const { bgColor, borderColor, textColor, icon: Icon, iconColor } = config[type] || config.info;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} border ${borderColor} rounded-xl p-4 shadow-lg max-w-sm`}>
        <div className="flex items-start">
          <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${iconColor}`} />
          <div className="flex-1">
            <p className={`font-medium ${textColor}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;