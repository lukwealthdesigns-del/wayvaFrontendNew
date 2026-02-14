// pages/OnboardingFlowPage.jsx - Backend Integration
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OnboardingScreen from '../components/Onboarding/OnboardingScreen';
import { useAuth } from '../context/AuthContext';

const OnboardingFlowPage = () => {
  const navigate = useNavigate();
  const { slideId } = useParams();
  const { user } = useAuth();
  const currentSlide = parseInt(slideId || '1') - 1;
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('wayva_onboarding_completed');
    if (onboardingCompleted === 'true' && user) {
      // User has already seen onboarding and is logged in, skip to home
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const onboardingSlides = [
    {
      id: 1,
      title: "Plan Smart. Travel Light.",
      description: "Wayva helps you create AI-powered travel plans tailored to your mood, pace, and preferences.",
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      showSkip: true,
      showNext: true,
      showGetStarted: false
    },
    {
      id: 2,
      title: "Your Journey, Your Style.",
      description: "Tell us what you love. Wayva crafts flexible itineraries that match your interests — from culture to cuisine.",
      imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      showSkip: true,
      showNext: true,
      showGetStarted: false
    },
    {
      id: 3,
      title: "Stay in Flow, Wherever You Go.",
      description: "Get real-time adjustments, smart updates, and seamless trip planning — all in one elegant app.",
      imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      showSkip: false,
      showNext: false,
      showGetStarted: true
    }
  ];

  // Validate slide ID
  if (currentSlide < 0 || currentSlide >= onboardingSlides.length) {
    navigate('/onboarding/1', { replace: true });
    return null;
  }

  const currentSlideData = onboardingSlides[currentSlide];

  const handleSkip = () => {
    // Mark onboarding as completed
    localStorage.setItem('wayva_onboarding_completed', 'true');
    navigate('/signup');
  };

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      navigate(`/onboarding/${currentSlide + 2}`);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      navigate(`/onboarding/${currentSlide}`);
    }
  };

  const handleGetStarted = () => {
    // Mark onboarding as completed
    localStorage.setItem('wayva_onboarding_completed', 'true');
    
    // If user is already logged in, go to home
    if (user) {
      navigate('/home', { replace: true });
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <OnboardingScreen
        title={currentSlideData.title}
        description={currentSlideData.description}
        imageUrl={currentSlideData.imageUrl}
        showSkip={currentSlideData.showSkip}
        showNext={currentSlideData.showNext}
        showGetStarted={currentSlideData.showGetStarted}
        showPrevious={currentSlide > 0}
        currentSlide={currentSlide}
        totalSlides={onboardingSlides.length}
        onSkip={handleSkip}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
};

export default OnboardingFlowPage;