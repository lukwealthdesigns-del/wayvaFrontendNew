// components/Discover/DestinationCard.jsx - Backend Integration
import React, { useState } from 'react';
import { FiMapPin, FiCalendar, FiUsers, FiHeart, FiBookmark, FiStar, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const DestinationCard = ({ destination, onSave, onPlanTrip }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';
  
  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSave) {
      onSave(destination);
    }
  };
  
  const handlePlanTrip = () => {
    if (onPlanTrip) {
      onPlanTrip(destination);
    } else {
      // Default navigation to trip planner
      navigate('/plan-trip', {
        state: {
          prefillDestination: {
            city: destination.city || destination.name,
            country: destination.country,
            full: destination.display_name || `${destination.city || destination.name}, ${destination.country}`
          }
        }
      });
    }
  };
  
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Custom';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: destination.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDailyCost = (min, max, currency) => {
    if (!min && !max) return null;
    
    if (min && max) {
      return `${currency || 'USD'} ${Math.round(min)}-${Math.round(max)}/day`;
    }
    if (min) {
      return `From ${currency || 'USD'} ${Math.round(min)}/day`;
    }
    return null;
  };

  const getDestinationImage = () => {
    if (destination.images && destination.images.length > 0) {
      return destination.images[0];
    }
    if (destination.featured_image) {
      return destination.featured_image;
    }
    if (destination.image) {
      return destination.image;
    }
    return `https://source.unsplash.com/800x600/?${destination.city || destination.name},${destination.country},travel`;
  };

  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const destinationName = destination.city || destination.name || 'Unknown';
  const destinationCountry = destination.country || 'Unknown';
  const flagEmoji = getFlagEmoji(destination.country_code);
  const dailyCost = formatDailyCost(
    destination.avg_daily_cost_low || destination.estimated_cost_range?.min,
    destination.avg_daily_cost_high || destination.estimated_cost_range?.max,
    destination.currency
  );
  
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Destination Image */}
      <div className="relative h-48 group">
        <img
          src={getDestinationImage()}
          alt={`${destinationName}, ${destinationCountry}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImageError(true)}
        />
        
        {/* Style/Category Badge */}
        {destination.categories && destination.categories.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
              {destination.categories[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        )}
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
        >
          {isSaved ? (
            <FiBookmark className="w-5 h-5" style={{ color: '#FBBF24' }} />
          ) : (
            <FiHeart className="w-5 h-5" />
          )}
        </button>
        
        {/* Rating Badge */}
        {destination.popularity_score > 0 && (
          <div className="absolute top-3 right-16 bg-black/70 text-white rounded-full px-3 py-1 backdrop-blur-sm flex items-center">
            <FiStar className="w-3 h-3 mr-1 fill-current text-yellow-400" />
            <span className="text-xs font-semibold">{destination.popularity_score.toFixed(1)}</span>
          </div>
        )}
        
        {/* Destination Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{flagEmoji}</span>
            <h3 className="font-bold text-xl">{destinationName}</h3>
          </div>
          <div className="flex items-center text-sm opacity-90">
            <FiMapPin className="w-4 h-4 mr-1" />
            {destinationCountry}
          </div>
        </div>
      </div>
      
      {/* Destination Details */}
      <div className="p-4">
        {/* Short Description */}
        {destination.short_description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {destination.short_description}
          </p>
        )}
        
        {/* Destination Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Best Time to Visit */}
          {destination.best_time_to_visit && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                <FiCalendar className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div className="truncate">
                <p className="text-xs text-gray-500">Best Time</p>
                <p className="font-medium text-sm truncate">{destination.best_time_to_visit}</p>
              </div>
            </div>
          )}
          
          {/* Daily Cost */}
          {dailyCost && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                <FiDollarSign className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div className="truncate">
                <p className="text-xs text-gray-500">Daily Budget</p>
                <p className="font-medium text-sm truncate">{dailyCost}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Categories/Tags */}
        {destination.categories && destination.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {destination.categories.slice(0, 3).map((category, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
            {destination.categories.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                +{destination.categories.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Price and Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">
              {destination.price ? 'Starting from' : 'Custom Trip'}
            </p>
            {destination.price ? (
              <p className="font-bold text-xl" style={{ color: PRIMARY_COLOR }}>
                {formatPrice(destination.price)}
              </p>
            ) : (
              <p className="font-semibold text-sm" style={{ color: PRIMARY_COLOR }}>
                Plan Your Trip
              </p>
            )}
          </div>
          <button
            onClick={handlePlanTrip}
            className="px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: PRIMARY_COLOR,
              color: 'white',
              boxShadow: `0 4px 14px 0 ${PRIMARY_COLOR}40`
            }}
          >
            Plan Trip
          </button>
        </div>
        
        {/* Popularity/Visit Count */}
        {destination.visit_count > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            {formatNumber(destination.visit_count)} travelers visited
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationCard;