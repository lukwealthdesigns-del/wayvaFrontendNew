// components/Itinerary/SuccessScreen.jsx - Updated with floating button
import React from 'react';
import { FiCheckCircle, FiMapPin, FiUsers, FiCalendar, FiDollarSign, FiEye } from 'react-icons/fi';

const SuccessScreen = ({ formData, onViewItinerary }) => {
  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';
  
  const travelerLabels = {
    'solo': 'Only Me',
    'couple': 'A Couple',
    'family': 'Family',
    'friends': 'Friends',
    'work': 'Work'
  };

  const budgetLabels = {
    'cheap': 'Budget-Friendly',
    'balanced': 'Balanced',
    'luxury': 'Luxury',
    'flexible': 'Flexible'
  };

  const budgetColors = {
    'cheap': '#059669',
    'balanced': '#D97706',
    'luxury': '#7C3AED',
    'flexible': '#DC2626'
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  // Calculate trip duration
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const duration = calculateDuration();

  return (
    <>
      {/* Main Content */}
      <div className="px-6 pt-12 pb-28 flex flex-col">
        {/* Success Animation/Icon */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center animate-bounce" 
                   style={{ backgroundColor: PRIMARY_LIGHT }}>
                <FiCheckCircle className="w-12 h-12" style={{ color: PRIMARY_COLOR }} />
              </div>
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full border-4 opacity-20 animate-ping" 
                   style={{ borderColor: PRIMARY_COLOR, top: '-8px', left: '-8px', right: '-8px', bottom: '-8px' }}></div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Itinerary Generated Successfully! 🎉
          </h1>
          <p className="text-gray-600">
            Your AI-powered travel plan is ready
          </p>
        </div>

        {/* Trip Summary Card */}
        <div className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Your Trip Details</h2>
            <div className="text-xs px-2 py-1 rounded-full font-medium"
                 style={{ backgroundColor: `${PRIMARY_COLOR}10`, color: PRIMARY_COLOR }}>
              AI Generated
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <FiMapPin className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="font-medium text-gray-900">
                  {formData.destination?.city}, {formData.destination?.region}
                </p>
                <p className="text-xs text-gray-600">{formData.destination?.country}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <FiUsers className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Travelers</p>
                <p className="font-medium text-gray-900">
                  {travelerLabels[formData.travelers]}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <FiCalendar className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Trip Dates</p>
                <p className="font-medium text-gray-900">
                  {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
                </p>
                <p className="text-xs text-gray-600">{duration} day{duration !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <FiDollarSign className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <div className="flex items-center">
                  <p className="font-medium text-gray-900 mr-2">
                    {budgetLabels[formData.budget]}
                  </p>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ 
                      backgroundColor: `${budgetColors[formData.budget]}20`,
                      color: budgetColors[formData.budget]
                    }}
                  >
                    {formData.budget === 'cheap' ? '$' : 
                     formData.budget === 'balanced' ? '$$' : 
                     formData.budget === 'luxury' ? '$$$' : 'Custom'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Highlight */}
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
          <h3 className="font-bold text-gray-900 mb-3" style={{ color: PRIMARY_COLOR }}>
            ✨ AI-Powered Features Included:
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-white border border-blue-200 flex items-center justify-center mr-2 mt-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }}></div>
              </div>
              <span className="text-sm text-gray-700">Smart budget optimization for African travelers</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-white border border-blue-200 flex items-center justify-center mr-2 mt-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }}></div>
              </div>
              <span className="text-sm text-gray-700">Visa requirement analysis</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-white border border-blue-200 flex items-center justify-center mr-2 mt-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }}></div>
              </div>
              <span className="text-sm text-gray-700">Local currency exchange considerations</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-white border border-blue-200 flex items-center justify-center mr-2 mt-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }}></div>
              </div>
              <span className="text-sm text-gray-700">Personalized daily activities</span>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">📋 What's Next?</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-2 font-medium">1</span>
              <span>Review your detailed day-by-day itinerary</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-2 font-medium">2</span>
              <span>Save or share your travel plan</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-2 font-medium">3</span>
              <span>Book flights and accommodations</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-2 font-medium">4</span>
              <span>Set reminders for visa applications</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Floating View Itinerary Button - Above Bottom Nav */}
      <div className="fixed bottom-20 left-0 right-0 px-6 z-10">
        <button
          onClick={onViewItinerary}
          className="w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center shadow-lg"
          style={{ 
            backgroundColor: PRIMARY_COLOR,
            color: 'white',
            boxShadow: `0 8px 24px 0 ${PRIMARY_COLOR}60`
          }}
        >
          <FiEye className="w-6 h-6 mr-3" />
          View Full Itinerary
        </button>
      </div>
    </>
  );
};

export default SuccessScreen;