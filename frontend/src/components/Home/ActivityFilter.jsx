// components/Home/ActivityFilter.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const ActivityFilter = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Define the 4 main categories we want to show
  const mainCategories = ['adventure', 'relaxing', 'luxury', 'nature'];
  
  // Image sets for each category
  const categoryImages = {
    adventure: [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
    ],
    relaxing: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=400&fit=crop',
    ],
    luxury: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=400&fit=crop',
    ],
    nature: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=400&fit=crop',
    ]
  };
  
  // Category descriptions
  const categoryDescriptions = {
    adventure: "Thrilling experiences and outdoor adventures",
    relaxing: "Peaceful retreats and wellness activities",
    luxury: "Premium experiences and exclusive services",
    nature: "Outdoor explorations and natural wonders"
  };
  
  // Fetch activities for each category
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Instead of fetching featured activities, we create category objects
        const categoryActivities = mainCategories.map((category, index) => {
          const images = categoryImages[category] || categoryImages.nature;
          
          return {
            label: category.charAt(0).toUpperCase() + category.slice(1),
            category: category,
            images: images,
            description: categoryDescriptions[category] || `${category} activities`
          };
        });
        
        setActivities(categoryActivities);
        
      } catch (err) {
        console.error('Error setting up activities:', err);
        setError(err.message);
        // Fallback to category data
        const fallbackCategories = mainCategories.map((category, index) => ({
          label: category.charAt(0).toUpperCase() + category.slice(1),
          category: category,
          images: categoryImages[category] || categoryImages.nature,
          description: categoryDescriptions[category] || `${category} activities`
        }));
        setActivities(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Browse by Activity</h2>
          <button className="flex items-center text-[#064473] text-sm font-medium">
            See All
            <FiChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-full aspect-square mb-2 rounded-2xl bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      {/* Header with See All */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Browse by Activity</h2>
        <button 
          onClick={() => navigate('/activities')}
          className="flex items-center text-[#064473] text-sm font-medium hover:underline"
        >
          See All
          <FiChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          Could not load activities. Showing sample data.
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4">
        {activities.map((activity, index) => (
          <button
            key={`${activity.label}-${index}`}
            className="flex flex-col items-center group"
            onClick={() => navigate(`/activities?category=${activity.category}`)}
          >
            {/* Stacked Images Container */}
            <div className="relative w-full aspect-square mb-2">
              {/* Background decorative shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl transform rotate-3"></div>
              
              {/* Image stack - Vertical rectangles with white outline */}
              <div className="relative w-full h-full flex items-center justify-center">
                {activity.images.map((image, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="absolute rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 border-2 border-white"
                    style={{
                      width: '55%',
                      height: '80%',
                      top: `${imgIndex * 10}%`,
                      left: `${imgIndex * 15}%`,
                      transform: `rotate(${(imgIndex - 1) * 4}deg)`,
                      zIndex: 3 - imgIndex,
                    }}
                  >
                    <img
                      src={image}
                      alt={`${activity.label} ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-gray-${300 + imgIndex * 100} to-gray-${400 + imgIndex * 100} flex items-center justify-center rounded-xl">
                            <span class="text-white text-xs">${activity.label}</span>
                          </div>
                        `;
                      }}
                    />
                    {/* Overlay gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Label */}
            <span className="font-medium text-gray-800 text-sm group-hover:text-[#064473] transition-colors">
              {activity.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityFilter;