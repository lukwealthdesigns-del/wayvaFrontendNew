// components/TripPlanner/ReviewStep.jsx - Backend Integration
import React from 'react';
import { FiMapPin, FiUser, FiCalendar, FiTag, FiDollarSign, FiEdit2, FiZap, FiClock } from 'react-icons/fi';

const ReviewStep = ({ 
  destination, 
  travelers, 
  startDate, 
  endDate, 
  preferences, 
  budget,
  onGenerateItinerary,
  onEdit,
  loading = false
}) => {
  const PRIMARY_COLOR = '#064473';
  
  // Backend-compatible traveler labels
  const travelerLabels = {
    'only_me': 'Only me',
    'couple': 'A Couple',
    'family': 'Family',
    'friends': 'Friends',
    'work': 'Work'
  };

  const travelerIcons = {
    'only_me': '👤',
    'couple': '👫',
    'family': '👨‍👩‍👧‍👦',
    'friends': '👯‍♂️',
    'work': '💼'
  };

  // Backend-compatible budget labels
  const budgetLabels = {
    'budget_friendly': 'Budget-Friendly',
    'balanced': 'Balanced',
    'luxury': 'Luxury',
    'flexible': 'Flexible'
  };

  const budgetColors = {
    'budget_friendly': '#059669',
    'balanced': '#D97706',
    'luxury': '#7C3AED',
    'flexible': '#DC2626'
  };

  // Backend-compatible preference labels (matching TravelInterest enum)
  const preferenceLabels = {
    'wine_tours': 'Wine Tours',
    'road_trips': 'Road Trips',
    'food_tourism': 'Food Tourism',
    'cultural_exploration': 'Cultural Exploration',
    'adventure_travel': 'Adventure Travel',
    'city_breaks': 'City Breaks',
    'beach_vacation': 'Beach Vacation',
    'mountain_hiking': 'Mountain Hiking',
    'historical_sites': 'Historical Sites',
    'shopping': 'Shopping',
    'nightlife': 'Nightlife',
    'family_friendly': 'Family Friendly',
    'luxury': 'Luxury',
    'budget_travel': 'Budget Travel'
  };

  const formatDate = (date) => {
    if (!date) return 'Not selected';
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric' 
      });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const formatDateForBackend = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  // Calculate trip duration
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const duration = calculateDuration();

  // Get destination display name
  const getDestinationDisplay = () => {
    if (!destination) return 'Not selected';
    return `${destination.city || destination.name || ''}, ${destination.country || ''}`;
  };

  // Check if all required fields are filled
  const isComplete = destination && travelers && startDate && endDate && preferences?.length > 0 && budget?.type;

  return (
    <div className="px-6 pt-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Summary</h1>
      <p className="text-gray-600 mb-8">Review your trip details before generating your AI itinerary</p>

      <div className="space-y-4">
        {/* Destination */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiMapPin className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Destination</h3>
                <p className="text-xs text-gray-500">Where you're going</p>
              </div>
            </div>
            <button 
              onClick={() => onEdit(1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: PRIMARY_COLOR }}
              aria-label="Edit destination"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-10.5">
            <p className="font-medium text-gray-900 text-sm">
              {getDestinationDisplay()}
            </p>
            {destination?.flag && (
              <p className="text-xs text-gray-600 mt-0.5">
                <span className="mr-1">{destination.flag}</span>
                {destination.country}
              </p>
            )}
          </div>
        </div>

        {/* Travelers */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiUser className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Travelers</h3>
                <p className="text-xs text-gray-500">Who's going</p>
              </div>
            </div>
            <button 
              onClick={() => onEdit(2)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: PRIMARY_COLOR }}
              aria-label="Edit travelers"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-10.5 flex items-center">
            <span className="text-lg mr-2">{travelerIcons[travelers?.tripType] || '👤'}</span>
            <span className="font-medium text-gray-900 text-sm">
              {travelerLabels[travelers?.tripType] || travelers?.type || 'Not selected'}
              {travelers?.groupSize > 1 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({travelers.groupSize} travelers)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiCalendar className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Trip Dates</h3>
                <p className="text-xs text-gray-500">When you're traveling</p>
              </div>
            </div>
            <button 
              onClick={() => onEdit(3)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: PRIMARY_COLOR }}
              aria-label="Edit dates"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-10.5">
            <p className="font-medium text-gray-900 text-sm">
              {formatDate(startDate)} - {formatDate(endDate)}
            </p>
            <div className="flex items-center mt-1">
              <FiClock className="w-3 h-3 text-gray-400 mr-1" />
              <p className="text-xs text-gray-600">
                {duration} day{duration !== 1 ? 's' : ''} total
              </p>
              <span className="text-xs text-gray-400 ml-2">
                ({formatDateForBackend(startDate)} to {formatDateForBackend(endDate)})
              </span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiTag className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Preferences</h3>
                <p className="text-xs text-gray-500">{preferences?.length || 0} selected</p>
              </div>
            </div>
            <button 
              onClick={() => onEdit(4)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: PRIMARY_COLOR }}
              aria-label="Edit preferences"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-10.5">
            {preferences?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {preferences.map(prefId => (
                  <span
                    key={prefId}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 border border-blue-100 text-gray-700"
                  >
                    {preferenceLabels[prefId] || prefId.replace('_', ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No preferences selected</p>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiDollarSign className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Budget</h3>
                <p className="text-xs text-gray-500">Your spending preference</p>
              </div>
            </div>
            <button 
              onClick={() => onEdit(5)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: PRIMARY_COLOR }}
              aria-label="Edit budget"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-10.5">
            <div className="flex items-center flex-wrap gap-2">
              <span 
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ 
                  backgroundColor: `${budgetColors[budget?.type] || budgetColors.balanced}20`,
                  color: budgetColors[budget?.type] || budgetColors.balanced
                }}
              >
                {budgetLabels[budget?.type] || 'Not selected'}
              </span>
              {budget?.amount > 0 && (
                <span className="text-sm font-semibold text-gray-900">
                  ${budget.amount.toLocaleString()}
                </span>
              )}
            </div>
            {budget?.type === 'flexible' && budget?.amount > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Flexible budget with target of ${budget.amount.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trip Summary Card */}
      {isComplete && (
        <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#064473] flex items-center justify-center flex-shrink-0">
              <FiZap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-2" style={{ color: PRIMARY_COLOR }}>
                Your Trip Summary
              </p>
              <div className="text-xs text-gray-700 space-y-1.5">
                <p>
                  You're planning a <span className="font-semibold text-gray-900">
                    {travelerLabels[travelers?.tripType]?.toLowerCase() || 'solo'}
                  </span> trip to <span className="font-semibold text-gray-900">
                    {destination?.city}
                  </span> for <span className="font-semibold text-gray-900">
                    {duration} days
                  </span> with a <span className="font-semibold text-gray-900">
                    {budgetLabels[budget?.type]?.toLowerCase()}
                  </span> budget.
                </p>
                <p className="flex items-center">
                  <span>AI will personalize your itinerary based on</span>
                  <span className="font-semibold text-gray-900 mx-1">
                    {preferences.length} preferences
                  </span>
                  <span>and your travel style.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={onGenerateItinerary}
          disabled={!isComplete || loading}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-xl active:scale-[0.98]"
          style={{ 
            backgroundColor: PRIMARY_COLOR,
            color: 'white',
            boxShadow: `0 4px 14px 0 ${PRIMARY_COLOR}40`
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Your Itinerary...
            </>
          ) : (
            <>
              <FiZap className="w-5 h-5 mr-2" />
              Generate My AI Itinerary
            </>
          )}
        </button>
        {!isComplete && (
          <p className="text-xs text-red-500 text-center mt-2">
            Please complete all steps to generate your itinerary
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;