// pages/OnboardingPage.jsx (updated)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/Layout/AuthLayout';

const OnboardingPage = () => {
  const navigate = useNavigate();

  const heroImageStyle = {
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        {/* Hero Section */}
        <div 
          className="w-64 h-64 rounded-3xl mb-8 flex items-center justify-center overflow-hidden shadow-2xl"
          style={heroImageStyle}
        >
          <div className="text-white text-center p-6">
            <div className="text-5xl mb-4">✈️</div>
            <div className="text-xl font-bold">WAYVA</div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to explore with Wayva?
          </h1>
          <p className="text-gray-600 text-lg">
            Start your personalized journey now.<br />
            Smart, flexible, and effortless.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <button 
            onClick={() => navigate('/signup')}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg"
          >
            Sign up
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition"
          >
            Log in
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            By continuing, you agree to our<br />
            <a href="#" className="text-blue-600 font-medium">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default OnboardingPage;