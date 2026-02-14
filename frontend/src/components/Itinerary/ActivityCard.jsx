// components/Itinerary/ActivityCard.jsx
import React from 'react';
import { FiClock, FiMapPin, FiStar, FiUsers, FiZap } from 'react-icons/fi';

const ActivityCard = ({ activity, isAI = false }) => {
  const PRIMARY_COLOR = '#064473';
  
  // Image mapping for activity types
  const getActivityImage = (type) => {
    const images = {
      'Breakfast': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop',
      'Cultural': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop',
      'Food Experience': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      'Nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop',
      'Dinner': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
      'Museum': 'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&auto=format&fit=crop',
      'Space Center': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&auto=format&fit=crop',
      'Fine Dining': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
      'Activity': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&auto=format&fit=crop',
      'Food': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      'Culture': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop',
      'Morning Activity': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&auto=format&fit=crop',
      'Afternoon Activity': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop',
      'Evening Activity': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop'
    };
    return images[type] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop';
  };

  // Get activity type display name
  const getActivityType = () => {
    if (activity.type) return activity.type;
    if (activity.category === 'food') return 'Food Experience';
    if (activity.category === 'culture') return 'Cultural';
    if (activity.category === 'nature') return 'Nature';
    if (activity.category === 'activity') return 'Activity';
    return 'Experience';
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Activity Image */}
      <div className="relative h-40">
        <img
          src={activity.image || getActivityImage(getActivityType())}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* AI Badge */}
        {isAI && (
          <div className="absolute top-3 left-3 flex items-center">
            <div className="px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500 to-teal-500 text-white backdrop-blur-sm flex items-center">
              <FiZap className="w-3 h-3 mr-1" />
              AI
            </div>
          </div>
        )}
        
        {/* Activity Type Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
            {getActivityType()}
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm opacity-90">
              <FiClock className="w-3 h-3 mr-1" />
              <span>{activity.time}</span>
            </div>
            <div className="text-sm font-medium px-2 py-1 rounded bg-white/20 backdrop-blur-sm">
              ${typeof activity.price === 'number' ? activity.price.toFixed(2) : activity.price || '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Details */}
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>
        
        {/* Activity Info */}
        <div className="flex flex-wrap gap-3 mb-4">
          {activity.distance && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <FiMapPin className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-medium text-sm">{activity.distance}</p>
              </div>
            </div>
          )}
          
          {activity.rating && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <FiStar className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <p className="font-medium text-sm">{activity.rating}/5</p>
              </div>
            </div>
          )}
          
          {activity.reviews && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <FiUsers className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Reviews</p>
                <p className="font-medium text-sm">{activity.reviews}</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {activity.duration && (
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium text-sm">{activity.duration}</p>
              </div>
            )}
            
            {activity.category && (
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-medium text-sm capitalize">{activity.category}</p>
              </div>
            )}
          </div>
          
          {activity.price && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Price per person</p>
              <p className="font-bold text-lg" style={{ color: PRIMARY_COLOR }}>
                ${typeof activity.price === 'number' ? activity.price.toFixed(2) : activity.price}
              </p>
            </div>
          )}
        </div>

        {/* AI Source Indicator */}
        {isAI && activity.reviews === 'AI-curated' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 flex items-center">
              <FiZap className="w-3 h-3 mr-1 text-teal-500" />
              AI-recommended based on your preferences
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;