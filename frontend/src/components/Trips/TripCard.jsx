// components/Trips/TripCard.jsx - Backend Integration
import React from 'react';
import { FiCalendar, FiUsers, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const TripCard = ({ trip, onViewItinerary }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'planning':
        return 'Planning';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Planning';
    }
  };

  const getTripTypeLabel = (tripType) => {
    switch (tripType) {
      case 'only_me':
        return 'Solo';
      case 'couple':
        return 'Couple';
      case 'family':
        return 'Family';
      case 'friends':
        return 'Friends';
      case 'work':
        return 'Work';
      default:
        return tripType?.charAt(0).toUpperCase() + tripType?.slice(1) || 'Traveler';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates TBD';
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    
    if (startYear === endYear) {
      return `${start} - ${end}, ${endYear}`;
    }
    return `${start}, ${startYear} - ${end}, ${endYear}`;
  };

  const getDestinationImage = () => {
    if (trip.destination_images && trip.destination_images.length > 0) {
      return trip.destination_images[0];
    }
    if (trip.image) {
      return trip.image;
    }
    return `https://source.unsplash.com/800x600/?${trip.destination || trip.city},travel`;
  };

  const handleViewItinerary = () => {
    if (onViewItinerary) {
      onViewItinerary(trip);
    } else {
      navigate(`/itinerary-detail/${trip.id}`);
    }
  };

  const isActive = trip.status === 'active' || trip.is_active === true;
  const isUpcoming = trip.is_upcoming === true;
  const isPast = trip.is_past === true;
  
  const destinationCity = trip.destination?.split(',')[0] || trip.city || 'Unknown';
  const destinationCountry = trip.destination?.split(',')[1]?.trim() || trip.country || '';
  const tripTypeLabel = getTripTypeLabel(trip.trip_type);
  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const destinationImage = getDestinationImage();
  const duration = trip.duration_days || 
                   (trip.start_date && trip.end_date ? 
                    Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1 : 
                    null);
  
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
      {/* Destination Image */}
      <div className="h-32 relative group">
        <img 
          src={destinationImage}
          alt={trip.destination || `${destinationCity}, ${destinationCountry}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://source.unsplash.com/800x600/?${destinationCity},travel`;
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        
        {/* Style/Budget Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
          <span className="text-xs font-semibold text-gray-800">
            {trip.budget_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Balanced'}
          </span>
        </div>
        
        {/* Location Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <FiMapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-sm font-medium">
              {destinationCity}
            </span>
            {destinationCountry && (
              <span className="text-white/80 text-xs">
                {destinationCountry}
              </span>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute bottom-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(trip.status)}`}>
            {getStatusText(trip.status)}
            {isActive && <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {/* Destination and Trip Type */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {trip.title || `${destinationCity} Adventure`}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                <FiCalendar className="w-3 h-3" />
                <span>{dateRange}</span>
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                <FiUsers className="w-3 h-3" />
                <span>{tripTypeLabel}</span>
              </div>
              {duration && (
                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                  <FiClock className="w-3 h-3" />
                  <span>{duration} days</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Trip Preferences/Interests */}
        {trip.travel_interests && trip.travel_interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {trip.travel_interests.slice(0, 3).map((interest, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-50 text-[#064473] rounded-full text-xs font-medium"
              >
                {interest.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
            {trip.travel_interests.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{trip.travel_interests.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Budget and Action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <FiDollarSign className="w-4 h-4 text-[#064473]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated Budget</p>
              <p className="font-semibold text-gray-900">
                {trip.estimated_budget ? `$${trip.estimated_budget.toLocaleString()}` : 'Custom'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleViewItinerary}
            className="px-5 py-2.5 bg-[#064473] text-white rounded-xl font-medium text-sm hover:bg-[#043254] transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            {trip.itinerary ? 'View Itinerary' : 'Create Itinerary'}
          </button>
        </div>
        
        {/* Trip ID (for debugging - remove in production) */}
        {/* <div className="mt-2 text-xs text-gray-400">
          ID: {trip.id}
        </div> */}
      </div>
    </div>
  );
};

export default TripCard;