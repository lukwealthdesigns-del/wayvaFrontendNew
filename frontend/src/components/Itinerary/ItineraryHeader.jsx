// components/Itinerary/ItineraryHeader.jsx
import React from 'react';
import { FiMapPin, FiCalendar, FiUsers, FiDollarSign, FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ItineraryHeader = ({ itinerary }) => {
  const navigate = useNavigate();
  const PRIMARY_COLOR = '#064473';
  
  // Get destination image based on location
  const getDestinationImage = (city) => {
    const images = {
      'Yishun': 'https://plus.unsplash.com/premium_photo-1697730373939-3ebcaa9d295e?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2luZ2Fwb3JlfGVufDB8fDB8fHww',
      'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&auto=format&fit=crop',
      'Houston': 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&auto=format&fit=crop',
      'Paris': 'https://images.unsplash.com/photo-1502602898663-d6d34556a2b8?w=1600&auto=format&fit=crop',
      'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&auto=format&fit=crop',
      'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&auto=format&fit=crop',
      'Cape Town': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&auto=format&fit=crop',
      'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1600&auto=format&fit=crop'
    };
    return images[city] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

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

  return (
    <div className="relative">
      {/* Destination Image Background */}
      <div className="relative h-90">
        <img
          src={getDestinationImage(itinerary.destination?.city)}
          alt={itinerary.destination?.city}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        
        {/* Destination Info */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-2xl font-bold mb-1">{itinerary.destination?.city}</h1>
          <div className="flex items-center mb-3">
            <FiMapPin className="w-4 h-4 mr-1" />
            <span className="text-sm opacity-90">
              {itinerary.destination?.region}, {itinerary.destination?.country}
            </span>
          </div>
          
          {/* Trip Details */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                <FiCalendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs opacity-80">Dates</p>
                <p className="text-sm font-medium">
                  {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                <FiUsers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs opacity-80">Travelers</p>
                <p className="text-sm font-medium">{travelerLabels[itinerary.travelers]}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                <FiDollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs opacity-80">Budget</p>
                <p className="text-sm font-medium">{budgetLabels[itinerary.budget]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryHeader;