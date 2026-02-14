// components/TripPlanner/PreferencesStep.jsx - Backend Integration
import React from 'react';
import { 
  FiCompass, FiMap, FiGlobe, FiCoffee, FiSun, FiNavigation,
  FiHeart, FiPackage, FiAnchor, FiBook,
  FiCamera, FiStar, FiTrendingUp, FiHome, FiZap, FiAward,
} from 'react-icons/fi';

const PreferencesStep = ({ selectedPreferences, onTogglePreference, onContinue }) => {
  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';
  
  // Backend-compatible preference options matching TravelInterest enum
  const preferenceOptions = [
    { id: 'wine_tours', label: 'Wine Tours', icon: <FiTrendingUp className="w-5 h-5" />, color: '#7C3AED' },
    { id: 'road_trips', label: 'Road Trips', icon: <FiNavigation className="w-5 h-5" />, color: '#059669' },
    { id: 'food_tourism', label: 'Food Tourism', icon: <FiCoffee className="w-5 h-5" />, color: '#D97706' },
    { id: 'cultural_exploration', label: 'Cultural Exploration', icon: <FiGlobe className="w-5 h-5" />, color: '#DC2626' },
    { id: 'adventure_travel', label: 'Adventure Travel', icon: <FiCompass className="w-5 h-5" />, color: '#059669' },
    { id: 'city_breaks', label: 'City Breaks', icon: <FiMap className="w-5 h-5" />, color: '#7C3AED' },
    { id: 'beach_vacation', label: 'Beach Vacations', icon: <FiSun className="w-5 h-5" />, color: '#D97706' },
    { id: 'mountain_hiking', label: 'Mountain Hiking', icon: <FiHome className="w-5 h-5" />, color: '#059669' },
    { id: 'historical_sites', label: 'Historical Sites', icon: <FiBook className="w-5 h-5" />, color: '#DC2626' },
    { id: 'shopping', label: 'Shopping', icon: <FiPackage className="w-5 h-5" />, color: '#7C3AED' },
    { id: 'nightlife', label: 'Nightlife', icon: <FiStar className="w-5 h-5" />, color: '#DB2777' },
    { id: 'family_friendly', label: 'Family Friendly', icon: <FiHeart className="w-5 h-5" />, color: '#DB2777' },
    { id: 'luxury', label: 'Luxury', icon: <FiAward className="w-5 h-5" />, color: '#7C3AED' },
    { id: 'budget_travel', label: 'Budget Travel', icon: <FiZap className="w-5 h-5" />, color: '#059669' },
  ];

  const handleToggle = (prefId) => {
    onTogglePreference(prefId);
  };

  const isStepValid = selectedPreferences.length >= 1 && selectedPreferences.length <= 10;

  // Get recommendation count based on selected preferences
  const getRecommendationMessage = () => {
    if (selectedPreferences.length === 0) {
      return 'Select at least 1 preference';
    }
    if (selectedPreferences.length > 10) {
      return 'Maximum 10 preferences allowed';
    }
    return `${selectedPreferences.length} preference${selectedPreferences.length !== 1 ? 's' : ''} selected`;
  };

  return (
    <>
      <div className="px-6 pt-4 pb-32">
        <h1 className="text-xl font-bold text-gray-900 mb-2">New Trip</h1>
        <h2 className="text-md text-gray-900 mb-8">
          Tailor your adventure to your tastes<br />
          <span className="text-gray-600 text-[12px]">
            Select your travel preferences to customize your trip plan.
          </span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {preferenceOptions.map((pref) => (
            <button
              key={pref.id}
              onClick={() => handleToggle(pref.id)}
              className={`p-3 rounded-lg text-left transition-all duration-200 flex items-center hover:scale-[1.02] active:scale-[0.98] ${
                selectedPreferences.includes(pref.id)
                  ? 'ring-2 shadow-sm bg-blue-50/30'
                  : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                '--tw-ring-color': selectedPreferences.includes(pref.id) ? PRIMARY_COLOR : undefined,
                borderColor: selectedPreferences.includes(pref.id) ? PRIMARY_COLOR : undefined
              }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0"
                style={{ 
                  backgroundColor: selectedPreferences.includes(pref.id) ? `${pref.color}20` : `${pref.color}10`,
                  color: pref.color
                }}
              >
                {pref.icon}
              </div>
              <span className="text-sm font-medium text-gray-900 line-clamp-2">{pref.label}</span>
            </button>
          ))}
        </div>

        {/* Selection Counter & Validation */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${
            selectedPreferences.length === 0 ? 'text-gray-400' :
            selectedPreferences.length > 10 ? 'text-red-500' : 'text-gray-600'
          }`}>
            {getRecommendationMessage()}
          </p>
          {selectedPreferences.length > 0 && selectedPreferences.length <= 10 && (
            <p className="text-xs text-gray-500 mt-1">
              ✓ Good to continue
            </p>
          )}
          {selectedPreferences.length > 10 && (
            <p className="text-xs text-red-500 mt-1">
              Please remove {selectedPreferences.length - 10} preference{selectedPreferences.length - 10 !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Selected Preferences Preview */}
        {selectedPreferences.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: PRIMARY_COLOR }}>
                Your Travel Preferences
              </p>
              <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 border border-blue-200">
                {selectedPreferences.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedPreferences.map(prefId => {
                const pref = preferenceOptions.find(p => p.id === prefId);
                if (!pref) return null;
                
                return (
                  <div 
                    key={pref.id}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
                    style={{ 
                      backgroundColor: `${pref.color}15`,
                      color: pref.color,
                      border: `1px solid ${pref.color}30`
                    }}
                  >
                    <span className="mr-1.5">{pref.icon}</span>
                    {pref.label}
                  </div>
                );
              })}
            </div>
            
            {/* AI Personalization Note */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-600 flex items-center">
                <FiZap className="w-3 h-3 mr-1" style={{ color: PRIMARY_COLOR }} />
                AI will personalize your itinerary based on these {selectedPreferences.length} preferences
              </p>
            </div>
          </div>
        )}

        {/* Preferences Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
            <FiStar className="w-3.5 h-3.5 mr-1.5" style={{ color: PRIMARY_COLOR }} />
            Tips for selecting preferences:
          </p>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">✓</span>
              <span>Select <strong>1-10 preferences</strong> (backend limit: 10 max)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">✓</span>
              <span>Mix different types for a balanced itinerary</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">✓</span>
              <span>Consider your travel companions' interests</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">✓</span>
              <span>Be realistic about daily activity levels</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={onContinue}
          disabled={!isStepValid}
          className="w-full py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
          style={{ 
            backgroundColor: isStepValid ? PRIMARY_COLOR : PRIMARY_LIGHT,
            color: isStepValid ? 'white' : PRIMARY_COLOR
          }}
        >
          {isStepValid ? 'Continue →' : 
           selectedPreferences.length === 0 ? 'Select at least 1 preference' :
           selectedPreferences.length > 10 ? `Remove ${selectedPreferences.length - 10} preference${selectedPreferences.length - 10 !== 1 ? 's' : ''}` : 
           'Continue →'}
        </button>
      </div>
    </>
  );
};

export default PreferencesStep;