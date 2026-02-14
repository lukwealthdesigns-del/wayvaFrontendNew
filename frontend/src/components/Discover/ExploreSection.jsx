// components/Discover/ExploreSection.jsx
import React from 'react';
import DestinationCard from './DestinationCard';
import { FiSearch } from 'react-icons/fi';

const ExploreSection = ({ destinations, onSaveDestination, onPlanTrip }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Popular Destinations</h2>
        <button className="text-sm font-medium text-blue-600">
          View All →
        </button>
      </div>
      
      <div className="space-y-4">
        {destinations.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            onSave={() => onSaveDestination(destination)}
            onPlanTrip={() => onPlanTrip(destination)}
          />
        ))}
      </div>
      
      {destinations.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FiSearch className="text-2xl text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No destinations found</h3>
          <p className="text-gray-600">Try searching with different keywords</p>
        </div>
      )}
    </div>
  );
};

export default ExploreSection;