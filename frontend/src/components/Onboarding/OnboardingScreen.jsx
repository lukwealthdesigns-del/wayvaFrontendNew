// components/Onboarding/OnboardingScreen.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import wayvaLogo from './wayvaLogo.png';

const OnboardingScreen = ({ 
  title, 
  description, 
  imageUrl, 
  showSkip = true,
  showNext = true,
  showGetStarted = false,
  showPrevious = false,
  currentSlide,
  totalSlides,
  onSkip,
  onNext,
  onGetStarted,
  onPrevious 
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef(null);
  const MIN_SWIPE_DISTANCE = 50; // Minimum distance for a swipe to trigger navigation

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
      setCurrentTime(formattedTime);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    setTouchEndX(currentX);
    
    // Calculate swipe offset for visual feedback
    const offset = currentX - touchStartX;
    setSwipeOffset(offset);
    
    // Prevent vertical scrolling while swiping horizontally
    if (Math.abs(offset) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    const distance = touchEndX - touchStartX;
    const isLeftSwipe = distance < -MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance > MIN_SWIPE_DISTANCE;
    
    // Reset swipe state
    setIsSwiping(false);
    setSwipeOffset(0);
    
    // Handle navigation based on swipe direction
    if (isLeftSwipe && showNext) {
      // Swipe left = go to next
      onNext();
    } else if (isRightSwipe && showPrevious) {
      // Swipe right = go to previous
      onPrevious();
    }
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e) => {
    setTouchStartX(e.clientX);
    setTouchEndX(e.clientX);
    setIsDragging(true);
    setSwipeOffset(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    setTouchEndX(currentX);
    
    const offset = currentX - touchStartX;
    setSwipeOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const distance = touchEndX - touchStartX;
    const isLeftSwipe = distance < -MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance > MIN_SWIPE_DISTANCE;
    
    setIsDragging(false);
    setSwipeOffset(0);
    
    if (isLeftSwipe && showNext) {
      onNext();
    } else if (isRightSwipe && showPrevious) {
      onPrevious();
    }
  };

  // Handle mouse leave while dragging
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setSwipeOffset(0);
    }
  };

  // Add/remove event listeners for mouse
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDragging]);

  // Calculate swipe direction indicator
  const getSwipeIndicator = () => {
    if (!isSwiping && !isDragging) return null;
    
    const distance = touchEndX - touchStartX;
    const absDistance = Math.abs(distance);
    
    if (absDistance < 10) return null;
    
    const isSwipingLeft = distance < 0;
    const isSwipingRight = distance > 0;
    
    let directionText = '';
    let canNavigate = false;
    
    if (isSwipingLeft && showNext) {
      directionText = 'Swipe left for next';
      canNavigate = absDistance > MIN_SWIPE_DISTANCE;
    } else if (isSwipingRight && showPrevious) {
      directionText = 'Swipe right for previous';
      canNavigate = absDistance > MIN_SWIPE_DISTANCE;
    } else {
      return null;
    }
    
    return (
      <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-50">
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200 ${
          canNavigate 
            ? 'bg-[#064473] text-white' 
            : 'bg-gray-800/80 text-white'
        }`}>
          <span className="text-sm font-medium">
            {directionText}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            canNavigate ? 'bg-green-400' : 'bg-white/60'
          }`}></div>
        </div>
      </div>
    );
  };

  // Calculate swipe transform for visual feedback
  const getTransformStyle = () => {
    if (!isSwiping && !isDragging) return {};
    
    const distance = touchEndX - touchStartX;
    const maxOffset = 100;
    
    // Apply rubber band effect at edges
    let offset = distance;
    if ((distance < 0 && !showNext) || (distance > 0 && !showPrevious)) {
      offset = distance * 0.3; // Resistance at edges
    }
    
    // Clamp the offset
    offset = Math.max(-maxOffset, Math.min(maxOffset, offset));
    
    return {
      transform: `translateX(${offset}px)`,
      transition: isSwiping || isDragging ? 'none' : 'transform 0.3s ease',
    };
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col bg-white select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={getTransformStyle()}
    >
      {/* Swipe indicator */}
      {getSwipeIndicator()}
      
      {/* Header with Skip and Previous */}
      <div className="px-4 pt-6 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <div className="min-w-[44px]">
            {showPrevious && (
              <button
                onClick={onPrevious}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 transition rounded-full hover:bg-gray-100 active:bg-gray-200 border border-gray-200"
                aria-label="Go to previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="min-w-[44px] flex justify-end">
            {showSkip && (
              <button
                onClick={onSkip}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 font-medium text-sm transition rounded-lg hover:bg-gray-100 active:bg-gray-200"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gap between Header and Main Content */}
      <div className="h-8 sm:h-6"></div>

      {/* Main Content (City Image + Text) */}
      <div className="flex flex-col items-center px-4 sm:px-6">
        {/* Logo at top center */}
        <div className="mb-3 sm:mb-6 w-full max-w-sm flex justify-center">
          <div className="relative">
            <img 
              src={wayvaLogo} 
              alt="Wayva Logo" 
              className="h-8 sm:h-10 w-auto"
            />
          </div>
        </div>
        
        {/* City Image with swipe hint */}
        <div className="mb-3 sm:mb-6 w-full max-w-sm relative">
          <div className="relative h-[35vh] sm:h-[45vh] rounded-3xl overflow-hidden shadow-xl">
            <img
              src={imageUrl}
              alt="Travel destination"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-4xl mb-2">🏙️</div>
                      <div class="text-gray-600">City Image</div>
                    </div>
                  </div>
                `;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            {/* Swipe arrows overlay */}
            {(isSwiping || isDragging) && (
              <div className="absolute inset-0 flex items-center justify-between px-4">
                {touchEndX - touchStartX > 20 && showPrevious && (
                  <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center animate-pulse">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </div>
                )}
                {touchEndX - touchStartX < -20 && showNext && (
                  <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center animate-pulse ml-auto rotate-180">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Swipe hint text */}
          <div className="mt-2 sm:mt-3 text-center">
            <p className="text-xs text-gray-500">
              {showPrevious && showNext ? "Swipe left or right to navigate" : ""}
              {!showPrevious && showNext ? "Swipe left for next" : ""}
              {showPrevious && !showNext ? "Swipe right for previous" : ""}
            </p>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center max-w-md">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Gap between Main Content and Footer */}
      <div className="h-10 sm:h-8"></div>

      {/* Footer with Progress & Button */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-8">
        <div className="flex justify-center space-x-1.5 mb-4 sm:mb-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-[#064473] w-6'
                  : 'bg-gray-300 w-1.5'
              }`}
            />
          ))}
        </div>

        {showGetStarted ? (
          <button
            onClick={onGetStarted}
            className="w-full py-3 bg-[#064473] text-white rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            Get Started
          </button>
        ) : showNext ? (
          <button
            onClick={onNext}
            className="w-full py-3 bg-[#064473] text-white rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            Next
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default OnboardingScreen;