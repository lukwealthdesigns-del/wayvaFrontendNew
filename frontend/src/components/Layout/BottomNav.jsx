// components/Layout/BottomNav.jsx
import React from 'react';
import { FiHome, FiMapPin, FiCompass, FiSettings } from 'react-icons/fi';
import { useLocation, Link } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/home', icon: FiHome, label: 'Home' },
    { path: '/trips', icon: FiMapPin, label: 'Trip' }, // Changed to MapPin for location
    { path: '/discover', icon: FiCompass, label: 'Discover' }, // Binocular telescope icon
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-sky-100 border-t border-gray-300">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path === '/home' && location.pathname === '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center"
            >
              {/* Icon with circle */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isActive ? 'bg-[#064473]' : ''
              }`}>
                <div className="relative flex items-center justify-center">
                  {/* Inactive outline icon */}
                  {!isActive && (
                    <Icon className="w-5 h-5 text-gray-500" />
                  )}
                  
                  {/* Active filled icon (simulated) */}
                  {isActive && (
                    <>
                      {/* White background circle to simulate fill */}
                      <div className="absolute w-5 h-5 bg-white rounded-full"></div>
                      {/* Icon on top */}
                      <Icon className="w-6 h-6 text-[#064473] relative z-10" />
                    </>
                  )}
                </div>
              </div>
              
              {/* Label */}
              <span className={`text-xs font-medium mt-1 ${
                isActive ? 'text-[#064473]' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;