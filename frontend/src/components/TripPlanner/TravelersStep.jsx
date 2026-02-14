// components/TripPlanner/TravelersStep.jsx - Backend Integration
import React, { useState } from 'react';
import { FiUser, FiUsers, FiHome, FiSmile, FiBriefcase, FiPlus, FiMinus } from 'react-icons/fi';

const TravelersStep = ({ selectedTravelers, onSelect, onContinue }) => {
  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';
  
  const [groupSize, setGroupSize] = useState(selectedTravelers?.groupSize || 1);
  
  // Backend-compatible traveler options
  const travelerOptions = [
    {
      id: 'only_me',
      title: 'Only Me',
      description: 'Traveling solo, just you.',
      icon: <FiUser className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      iconColor: '#064473',
      defaultSize: 1
    },
    {
      id: 'couple',
      title: 'A Couple',
      description: 'A romantic getaway for two.',
      icon: <FiUsers className="w-5 h-5" />,
      bgColor: 'bg-pink-50',
      iconColor: '#DB2777',
      defaultSize: 2
    },
    {
      id: 'family',
      title: 'Family',
      description: 'Quality time with your loved ones.',
      icon: <FiHome className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      iconColor: '#059669',
      defaultSize: 4
    },
    {
      id: 'friends',
      title: 'Friends',
      description: 'Adventure with your closest pals.',
      icon: <FiSmile className="w-5 h-5" />,
      bgColor: 'bg-purple-50',
      iconColor: '#7C3AED',
      defaultSize: 3
    },
    {
      id: 'work',
      title: 'Work',
      description: 'Business or corporate travel.',
      icon: <FiBriefcase className="w-5 h-5" />,
      bgColor: 'bg-gray-50',
      iconColor: '#4B5563',
      defaultSize: 2
    }
  ];

  const handleSelect = (optionId) => {
    const option = travelerOptions.find(o => o.id === optionId);
    const defaultSize = option?.defaultSize || 1;
    
    setGroupSize(defaultSize);
    
    onSelect({
      type: optionId,
      tripType: optionId,
      groupSize: defaultSize
    });
  };

  const handleGroupSizeChange = (increment) => {
    const newSize = Math.max(1, Math.min(20, groupSize + increment));
    setGroupSize(newSize);
    
    if (selectedTravelers) {
      onSelect({
        type: selectedTravelers.type || selectedTravelers,
        tripType: selectedTravelers.tripType || selectedTravelers,
        groupSize: newSize
      });
    }
  };

  const getSelectedOption = () => {
    if (!selectedTravelers) return null;
    const type = selectedTravelers.type || selectedTravelers.tripType || selectedTravelers;
    return travelerOptions.find(o => o.id === type);
  };

  const selectedOption = getSelectedOption();

  return (
    <>
      <div className="px-6 pt-4 pb-32">
        <h1 className="text-xl font-bold text-gray-900 mb-2">New Trip</h1>
        <h2 className="text-md text-gray-900 mb-8">
          Who is going? 🌤️<br />
          <span className="text-gray-600 text-[12px]">
            Let's get started by selecting who you're traveling with.
          </span>
        </h2>

        <div className="space-y-3">
          {travelerOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center hover:scale-[1.01] active:scale-[0.99] ${
                selectedOption?.id === option.id
                  ? 'ring-2 shadow-sm bg-blue-50/30'
                  : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                '--tw-ring-color': selectedOption?.id === option.id ? PRIMARY_COLOR : undefined,
                borderColor: selectedOption?.id === option.id ? PRIMARY_COLOR : undefined
              }}
            >
              {/* Icon Container */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${option.bgColor}`}>
                <div style={{ color: option.iconColor }}>
                  {option.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-base">{option.title}</h3>
                  {selectedOption?.id === option.id && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center ml-2" 
                         style={{ backgroundColor: PRIMARY_COLOR }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-xs mt-0.5">{option.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {option.defaultSize} traveler{option.defaultSize !== 1 ? 's' : ''} • Group size adjustable
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Group Size Selector - Only show when travelers selected */}
        {selectedOption && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2.5 ${selectedOption.bgColor}`}>
                  <div style={{ color: selectedOption.iconColor }}>
                    {selectedOption.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Number of Travelers
                  </h3>
                  <p className="text-xs text-gray-500">
                    Adjust the group size for your {selectedOption.title.toLowerCase()} trip
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mt-2">
              <button
                onClick={() => handleGroupSizeChange(-1)}
                disabled={groupSize <= 1}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease group size"
              >
                <FiMinus className="w-4 h-4 text-gray-600" />
              </button>
              
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900">{groupSize}</span>
                <p className="text-xs text-gray-500 mt-1">
                  traveler{groupSize !== 1 ? 's' : ''}
                </p>
              </div>
              
              <button
                onClick={() => handleGroupSizeChange(1)}
                disabled={groupSize >= 20}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase group size"
              >
                <FiPlus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-3">
              Maximum 20 travelers per trip
            </p>
          </div>
        )}

        {/* Selected Traveler Preview */}
        {selectedOption && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: PRIMARY_COLOR }}>
                Trip Configuration
              </p>
              <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 border border-blue-200">
                {groupSize} traveler{groupSize !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${selectedOption.bgColor}`}>
                <div style={{ color: selectedOption.iconColor }}>
                  {selectedOption.icon}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base">
                  {selectedOption.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    {selectedOption.description}
                  </p>
                  <span className="text-xs font-semibold text-gray-900">
                    {groupSize} ×
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Travel Tips */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">👥 Group Travel Tips:</p>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">•</span>
              <span>Larger groups may need advance bookings for activities</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">•</span>
              <span>Consider accommodation types that suit your group size</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">•</span>
              <span>Family trips often qualify for special discounts</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">•</span>
              <span>Work trips may have different tax implications</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={onContinue}
          disabled={!selectedTravelers}
          className="w-full py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
          style={{ 
            backgroundColor: selectedTravelers ? PRIMARY_COLOR : PRIMARY_LIGHT,
            color: selectedTravelers ? 'white' : PRIMARY_COLOR
          }}
        >
          {selectedTravelers ? 'Continue →' : 'Select traveler type to continue'}
        </button>
      </div>
    </>
  );
};

export default TravelersStep;