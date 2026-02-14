// components/Auth/SocialAuthButtons.jsx
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const SocialAuthButtons = () => {
  const socialButtons = [
    { 
      icon: FcGoogle, 
      label: 'Google', 
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300'
    },
    { 
      icon: FaFacebook, 
      label: 'Facebook', 
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
      borderColor: 'border-blue-600'
    },
    { 
      icon: FaInstagram, 
      label: 'Instagram', 
      bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-white',
      borderColor: 'border-transparent'
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">or login with</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {socialButtons.map((social) => {
          const Icon = social.icon;
          return (
            <button
              key={social.label}
              className={`flex flex-col items-center justify-center py-3 rounded-xl border ${social.borderColor} ${social.bgColor} ${social.textColor} hover:opacity-90 transition`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">{social.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SocialAuthButtons;