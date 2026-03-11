// components/Itinerary/GeneratingScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiUsers, FiCalendar, FiTag, FiDollarSign, FiZap, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const GeneratingScreen = ({ formData, progress = 0, status, error, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [aiMessage, setAiMessage] = useState('Initializing AI travel assistant...');
  const stepsContainerRef = useRef(null);
  
  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';
  
  const generationSteps = [
    {
      title: 'Analyzing Destination',
      description: 'Researching visa requirements, local customs, and attractions.',
      icon: <FiMapPin className="w-6 h-6" />,
    },
    {
      title: 'Considering Travelers',
      description: 'Tailoring activities for your travel group preferences.',
      icon: <FiUsers className="w-6 h-6" />,
    },
    {
      title: 'Optimizing Dates',
      description: 'Checking weather patterns and seasonal events.',
      icon: <FiCalendar className="w-6 h-6" />,
    },
    {
      title: 'Customizing Preferences',
      description: 'Incorporating your selected interests and activities.',
      icon: <FiTag className="w-6 h-6" />,
    },
    {
      title: 'Budget Planning',
      description: 'Creating cost-effective options within your budget.',
      icon: <FiDollarSign className="w-6 h-6" />,
    },
    {
      title: 'Finalizing Itinerary',
      description: 'Generating your personalized travel plan.',
      icon: <FiZap className="w-6 h-6" />,
    }
  ];

  const aiMessages = [
    "Analyzing visa requirements for African passport holders...",
    "Checking local currency exchange rates...",
    "Researching budget-friendly accommodation options...",
    "Finding authentic local experiences...",
    "Optimizing transportation routes...",
    "Considering safety recommendations...",
    "Adding hidden gem recommendations...",
    "Finalizing day-by-day schedule..."
  ];

  // Drive current step from progress prop (0-100 → 0-5)
  useEffect(() => {
    const stepIndex = Math.min(
      Math.floor((progress / 100) * generationSteps.length),
      generationSteps.length - 1
    );
    setCurrentStep(stepIndex);

    // Scroll to current step card
    if (stepsContainerRef.current) {
      const stepElement = stepsContainerRef.current.querySelector(`[data-step="${stepIndex}"]`);
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [progress]);

  // AI message rotation — purely cosmetic, independent of navigation
  useEffect(() => {
    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * aiMessages.length);
      setAiMessage(aiMessages[randomIndex]);
    }, 2200);
    return () => clearInterval(messageInterval);
  }, []);

  const scrollSteps = (direction) => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth'
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const travelerLabels = {
    'only_me': 'Only Me',
    'solo':    'Only Me',
    'couple':  'A Couple',
    'family':  'Family',
    'friends': 'Friends',
    'work':    'Work'
  };

  const budgetLabels = {
    'budget_friendly': 'Budget-Friendly',
    'cheap':           'Budget-Friendly',
    'balanced':        'Balanced',
    'luxury':          'Luxury',
    'flexible':        'Flexible'
  };

  return (
    <div className="min-h-screen px-6 pt-8 pb-24 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse" 
               style={{ backgroundColor: PRIMARY_LIGHT }}>
            <FiZap className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Generating Your AI Itinerary
        </h1>
        <p className="text-gray-600">
          {status || 'Our AI is crafting your perfect travel plan'}
        </p>
      </div>

      {/* Trip Summary Card */}
      <div className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Trip Summary</h2>
          <div className="text-xs px-2 py-1 rounded-full font-medium"
               style={{ backgroundColor: PRIMARY_LIGHT, color: PRIMARY_COLOR }}>
            AI Processing
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <FiMapPin className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Destination</p>
              <p className="font-medium text-gray-900 text-sm">
                {formData?.destination?.city}{formData?.destination?.country ? `, ${formData.destination.country}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <FiUsers className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Travelers</p>
              <p className="font-medium text-gray-900 text-sm">
                {travelerLabels[formData?.travelers?.tripType] || travelerLabels[formData?.travelers] || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <FiCalendar className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Dates</p>
              <p className="font-medium text-gray-900 text-sm">
                {formatDate(formData?.startDate)} - {formatDate(formData?.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <FiDollarSign className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="font-medium text-gray-900 text-sm">
                {budgetLabels[formData?.budget?.type] || budgetLabels[formData?.budget] || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
            {Math.round(progress)}% Complete
          </span>
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {generationSteps.length}
          </span>
        </div>
        
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: PRIMARY_COLOR }}
          />
        </div>
      </div>

      {/* AI Processing Steps - Horizontal Carousel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">AI Processing Steps</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => scrollSteps('left')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: PRIMARY_COLOR }}
              disabled={currentStep === 0}
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scrollSteps('right')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: PRIMARY_COLOR }}
              disabled={currentStep === generationSteps.length - 1}
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          ref={stepsContainerRef}
          className="mt-4 flex space-x-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {generationSteps.map((step, index) => (
            <div
              key={index}
              data-step={index}
              className={`flex-shrink-0 w-64 rounded-xl p-4 transition-all duration-500 ${
                index === currentStep 
                  ? 'bg-blue-50 border-2 border-blue-200 transform scale-105 shadow-md' 
                  : index < currentStep
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-gray-50 border border-gray-200 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  index === currentStep ? 'bg-white shadow-sm' :
                  index < currentStep ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <div style={{ 
                    color: index === currentStep ? PRIMARY_COLOR : 
                           index < currentStep ? '#059669' : '#9CA3AF'
                  }}>
                    {step.icon}
                  </div>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  index === currentStep 
                    ? 'bg-blue-100 text-blue-700' 
                    : index < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {index === currentStep ? 'Processing' : 
                   index < currentStep ? 'Completed' : 'Pending'}
                </div>
              </div>
              
              <h4 className={`font-bold mb-1 ${
                index === currentStep ? 'text-gray-900' :
                index < currentStep ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {step.title}
              </h4>
              <p className={`text-xs ${
                index === currentStep ? 'text-gray-600' :
                index < currentStep ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {step.description}
              </p>
              
              {index === currentStep && (
                <div className="mt-4">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: PRIMARY_COLOR,
                        width: `${(progress % (100 / generationSteps.length)) * generationSteps.length}%`
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className={`mt-4 text-xs font-medium ${
                index === currentStep ? 'text-blue-600' :
                index < currentStep ? 'text-green-600' : 'text-gray-400'
              }`}>
                Step {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Message */}
      <div className="mt-auto p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full bg-white border border-blue-200 flex items-center justify-center mr-2">
            <FiZap className="w-3 h-3" style={{ color: PRIMARY_COLOR }} />
          </div>
          <p className="text-xs font-medium" style={{ color: PRIMARY_COLOR }}>AI Assistant</p>
        </div>
        <p className="text-sm text-gray-700">{aiMessage}</p>
        <div className="flex mt-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-1"></div>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* CSS to hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default GeneratingScreen;