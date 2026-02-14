// components/Trips/TripList.jsx - Backend Integration
import React from 'react';
import TripCard from './TripCard';
import { FiMap, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';

const TripList = ({ trips, activeTab, onViewItinerary, loading = false }) => {
  
  const filterTripsByTab = (trip) => {
    if (!trip) return false;
    
    switch (activeTab) {
      case 'Active':
        return trip.status === 'active' || trip.is_active === true;
      case 'Upcoming':
        return trip.status === 'planning' || trip.is_upcoming === true;
      case 'Completed':
        return trip.status === 'completed' || trip.is_past === true;
      case 'Passed':
        return trip.status === 'completed' || trip.status === 'cancelled' || trip.is_past === true;
      case 'All':
      default:
        return true;
    }
  };

  const getEmptyStateIcon = () => {
    switch (activeTab) {
      case 'Active':
        return <FiMap className="w-10 h-10 text-gray-400" />;
      case 'Upcoming':
        return <FiCalendar className="w-10 h-10 text-gray-400" />;
      case 'Completed':
        return <FiCheckCircle className="w-10 h-10 text-gray-400" />;
      case 'Passed':
        return <FiClock className="w-10 h-10 text-gray-400" />;
      default:
        return <span className="text-4xl">✈️</span>;
    }
  };

  const getEmptyStateTitle = () => {
    switch (activeTab) {
      case 'Active':
        return 'No active trips';
      case 'Upcoming':
        return 'No upcoming trips';
      case 'Completed':
        return 'No completed trips';
      case 'Passed':
        return 'No past trips';
      default:
        return 'No trips found';
    }
  };

  const getEmptyStateDescription = () => {
    switch (activeTab) {
      case 'Active':
        return "You don't have any active trips right now";
      case 'Upcoming':
        return "Plan your next adventure to see it here";
      case 'Completed':
        return "Your completed trips will appear here";
      case 'Passed':
        return "No past trips to show";
      default:
        return 'Start planning your first trip!';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="h-32 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredTrips = trips?.filter(filterTripsByTab) || [];
  
  if (filteredTrips.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-inner">
          <div className="text-4xl text-gray-400">
            {getEmptyStateIcon()}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          {getEmptyStateTitle()}
        </h3>
        
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {getEmptyStateDescription()}
        </p>
        
        {activeTab !== 'Active' && activeTab !== 'Passed' && (
          <button
            onClick={() => window.location.href = '/plan-trip'}
            className="px-6 py-3 bg-[#064473] text-white rounded-xl font-medium hover:bg-[#043254] transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            Plan Your First Trip
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4 mb-8">
      {/* Trip count indicator */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-[#064473]">{filteredTrips.length}</span> trip{filteredTrips.length !== 1 ? 's' : ''}
        </p>
        {activeTab === 'Active' && (
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
            {filteredTrips.filter(t => t.status === 'active').length} active now
          </span>
        )}
      </div>

      {filteredTrips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onViewItinerary={onViewItinerary}
        />
      ))}
    </div>
  );
};

export default TripList;