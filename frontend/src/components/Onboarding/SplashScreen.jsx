// components/Onboarding/SplashScreen.jsx - Even Simpler
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wayvaLogo from './wayvaLogo.png';


const SplashScreen = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      navigate('/onboarding/1');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!isVisible) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Status Bar */}
      {/* <div className="absolute top-6">
        <div className="text-sm text-gray-500 font-medium">9:41</div>
      </div> */}

      <div className="text-center px-4">
        {/* Logo */}
        <div className="mb-10">
          <div className="w-30 h-30 mx-auto mb-6">
            <img
              src={wayvaLogo}
              alt="Wayva Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full rounded-full bg-[#064473] flex items-center justify-center">
                    <span class="text-white text-3xl font-bold">W</span>
                  </div>
                `;
              }}
            />
          </div>
          
          <h1 
            className="text-5xl font-bold"
            style={{ color: '#064473' }}
          >
            WAYVA
          </h1>
          {/* <p className="text-gray-500 mt-2">
            AI Travel Planner
          </p> */}
        </div>

        {/* Loading Spinner at Bottom of Page */}
        <div className="fixed bottom-20 left-0 right-0">
          <div className="flex justify-center">
            <div className="relative w-15 h-15">
              {/* Main spinner with gradient fade */}
              <div 
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, #064473, rgba(6, 68, 115, 0.2))',
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))',
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="absolute bottom-8">
        <p className="text-gray-400 text-sm">Preparing your experience...</p>
      </div>
    </div>
  );
};

export default SplashScreen;