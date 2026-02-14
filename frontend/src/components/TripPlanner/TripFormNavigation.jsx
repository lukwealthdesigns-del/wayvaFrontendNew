// components/TripPlanner/TripFormNavigation.jsx - UI Component (No backend changes)
import React from 'react';
import { FiHome, FiMap, FiCompass, FiSettings } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const TripFormNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/home', icon: FiHome, label: 'Home' },
    { path: '/trips', icon: FiMap, label: 'Trips' },
    { path: '/discover', icon: FiCompass, label: 'Discover' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
      <div className="flex justify-around items-center py-2 px-4 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                active 
                  ? 'text-[#064473] bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 md:w-6 md:h-6 ${active ? 'font-bold' : ''}`} />
              <span className={`text-[10px] md:text-xs mt-1 font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TripFormNavigation;