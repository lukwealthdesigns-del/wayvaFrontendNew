// pages/AllActivitiesPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiSearch, FiX, FiUsers, FiClock, FiMapPin, FiStar, FiDollarSign, FiThermometer } from 'react-icons/fi';
import BottomNav from '../components/Layout/BottomNav';

const AllActivitiesPage = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const allActivities = [
    {
      id: 1,
      label: 'Adventure',
      category: 'Outdoor',
      images: [
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      ],
      description: 'Thrill-seeking activities for adrenaline junkies',
      fullDescription: 'Experience heart-pounding adventures including hiking, rock climbing, white water rafting, skydiving, and bungee jumping. Perfect for those who love pushing their limits and experiencing nature from exciting perspectives.',
      intensity: 'High',
      duration: '4-8 hours',
      groupSize: '2-12 people',
      bestSeason: 'Spring & Summer',
      priceRange: '$50 - $300',
      difficulty: 'Moderate to Hard',
      ageRestriction: '16+ years',
      rating: 4.7,
      reviewCount: 1240,
      popularSpots: ['Swiss Alps', 'New Zealand', 'Costa Rica', 'Colorado']
    },
    {
      id: 2,
      label: 'Relaxing',
      category: 'Wellness',
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      ],
      description: 'Peaceful activities for relaxation and rejuvenation',
      fullDescription: 'Unwind with calming activities including beach lounging, spa treatments, yoga retreats, meditation sessions, and nature walks. Perfect for reducing stress and finding inner peace during your travels.',
      intensity: 'Low',
      duration: '2-6 hours',
      groupSize: '1-6 people',
      bestSeason: 'All year round',
      priceRange: '$30 - $200',
      difficulty: 'Easy',
      ageRestriction: 'All ages',
      rating: 4.5,
      reviewCount: 890,
      popularSpots: ['Bali', 'Thailand', 'Maldives', 'Greek Islands']
    },
    {
      id: 3,
      label: 'Luxury',
      category: 'Premium',
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=400&fit=crop',
      ],
      description: 'High-end experiences and premium services',
      fullDescription: 'Indulge in luxury travel experiences including 5-star accommodations, private yacht tours, gourmet dining, exclusive shopping, and VIP access to attractions. For travelers who appreciate the finer things in life.',
      intensity: 'Low',
      duration: 'Flexible',
      groupSize: '1-10 people',
      bestSeason: 'All year round',
      priceRange: '$300 - $5000+',
      difficulty: 'Easy',
      ageRestriction: 'All ages',
      rating: 4.8,
      reviewCount: 560,
      popularSpots: ['Dubai', 'Monaco', 'Paris', 'Tokyo']
    },
    {
      id: 4,
      label: 'Nature',
      category: 'Outdoor',
      images: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop',
      ],
      description: 'Immersive experiences in natural environments',
      fullDescription: 'Connect with nature through activities like wildlife safaris, forest hiking, bird watching, camping under the stars, and visiting national parks. Perfect for nature lovers and environmental enthusiasts.',
      intensity: 'Medium',
      duration: '3-10 hours',
      groupSize: '1-15 people',
      bestSeason: 'Spring & Fall',
      priceRange: '$40 - $250',
      difficulty: 'Easy to Moderate',
      ageRestriction: 'All ages',
      rating: 4.6,
      reviewCount: 1120,
      popularSpots: ['Amazon Rainforest', 'Canadian Rockies', 'African Safari', 'Norwegian Fjords']
    },
    {
      id: 5,
      label: 'Beach',
      category: 'Water',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=400&fit=crop',
      ],
      description: 'Sun, sand, and sea activities',
      fullDescription: 'Enjoy beachside activities including swimming, snorkeling, surfing, beach volleyball, sunset cruises, and seaside dining. Perfect for sun worshippers and water sports enthusiasts.',
      intensity: 'Low to Medium',
      duration: '2-8 hours',
      groupSize: '1-20 people',
      bestSeason: 'Summer',
      priceRange: '$20 - $180',
      difficulty: 'Easy to Moderate',
      ageRestriction: 'All ages',
      rating: 4.4,
      reviewCount: 1560,
      popularSpots: ['Maldives', 'Caribbean', 'Australia', 'Hawaii']
    },
    {
      id: 6,
      label: 'Cultural',
      category: 'Educational',
      images: [
        'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1541919488c36c8c12f6c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1512476446317-8e2db5f3d3c4?w=400&h=400&fit=crop',
      ],
      description: 'Immersion in local traditions and heritage',
      fullDescription: 'Explore cultural activities including museum visits, historical site tours, traditional cooking classes, local festival participation, and artisan workshops. Perfect for history buffs and cultural explorers.',
      intensity: 'Low',
      duration: '2-6 hours',
      groupSize: '1-25 people',
      bestSeason: 'All year round',
      priceRange: '$25 - $150',
      difficulty: 'Easy',
      ageRestriction: 'All ages',
      rating: 4.5,
      reviewCount: 980,
      popularSpots: ['Rome', 'Kyoto', 'Istanbul', 'Marrakech']
    },
    {
      id: 7,
      label: 'City Break',
      category: 'Urban',
      images: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop',
      ],
      description: 'Urban exploration and city experiences',
      fullDescription: 'Discover city life through activities like architectural tours, food crawls, shopping districts, nightlife exploration, and rooftop bar visits. Perfect for urban explorers and city lovers.',
      intensity: 'Medium',
      duration: '3-8 hours',
      groupSize: '1-10 people',
      bestSeason: 'Spring & Fall',
      priceRange: '$40 - $200',
      difficulty: 'Easy',
      ageRestriction: '18+ for night activities',
      rating: 4.3,
      reviewCount: 1340,
      popularSpots: ['New York', 'London', 'Tokyo', 'Paris']
    },
    {
      id: 8,
      label: 'Food & Wine',
      category: 'Culinary',
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
      ],
      description: 'Culinary experiences and gastronomic tours',
      fullDescription: 'Savor food and drink activities including wine tasting tours, cooking classes, market visits, brewery tours, and fine dining experiences. Perfect for foodies and culinary enthusiasts.',
      intensity: 'Low',
      duration: '2-5 hours',
      groupSize: '2-12 people',
      bestSeason: 'All year round',
      priceRange: '$35 - $250',
      difficulty: 'Easy',
      ageRestriction: '21+ for alcohol activities',
      rating: 4.7,
      reviewCount: 1020,
      popularSpots: ['Italy', 'France', 'Spain', 'Thailand']
    },
  ];

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Custom Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 transition rounded-full hover:bg-gray-100 active:bg-gray-200 mr-3"
            aria-label="Go back to home"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-900">All Activities</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 pt-4">
        <div className="max-w-2xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                className="w-full bg-white rounded-xl py-3 px-4 pl-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <FiSearch className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Activity Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-[#064473]">{allActivities.length}</span> activities
            </p>
          </div>

          {/* Activities Grid - 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-4">
            {allActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Activity image collage */}
                <div className="relative h-48">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1">
                    <div className="col-span-2 row-span-2 rounded-lg overflow-hidden">
                      <img
                        src={activity.images[0]}
                        alt={`${activity.label} 1`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="col-start-3 row-start-1 rounded-lg overflow-hidden">
                      <img
                        src={activity.images[1]}
                        alt={`${activity.label} 2`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="col-start-3 row-start-2 rounded-lg overflow-hidden">
                      <img
                        src={activity.images[2]}
                        alt={`${activity.label} 3`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="col-start-1 row-start-3 rounded-lg overflow-hidden">
                      <img
                        src={activity.images[3]}
                        alt={`${activity.label} 4`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="col-start-2 col-span-2 row-start-3 rounded-lg overflow-hidden">
                      <img
                        src={activity.images[4]}
                        alt={`${activity.label} 5`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Category badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                    <span className="text-xs font-semibold text-gray-800">{activity.category}</span>
                  </div>
                  
                  {/* Rating badge */}
                  <div className="absolute top-2 right-2 flex items-center bg-black/70 text-white rounded-full px-2 py-1 backdrop-blur-sm">
                    <FiStar className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                    <span className="text-xs font-semibold">{activity.rating?.toFixed(1)}</span>
                  </div>
                  
                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* Activity label */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white drop-shadow-md text-center">
                      {activity.label}
                    </h3>
                  </div>
                </div>
                
                {/* View button */}
                <div className="p-3">
                  <button 
                    onClick={() => handleViewDetails(activity)}
                    className="w-full py-2.5 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition"
                  >
                    Explore {activity.label}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom back button */}
          <div className="mt-8 mb-4 text-center">
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </main>
      
      {/* Activity Details Modal */}
      {showModal && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedActivity.label} Activities</h3>
                <p className="text-sm text-gray-500">{selectedActivity.category}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6">
                {/* Hero Image Collage */}
                <div className="grid grid-cols-3 grid-rows-2 gap-2 mb-6 rounded-xl overflow-hidden h-48">
                  {selectedActivity.images.slice(0, 4).map((img, index) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden ${
                        index === 0 ? 'col-span-2 row-span-2' :
                        index === 1 ? 'col-start-3 row-start-1' :
                        index === 2 ? 'col-start-3 row-start-2' :
                        'col-span-3 row-start-3'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${selectedActivity.label} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Rating Summary */}
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{selectedActivity.rating?.toFixed(1)}</div>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(selectedActivity.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      Based on <span className="font-semibold">{selectedActivity.reviewCount?.toLocaleString()}</span> reviews
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">About {selectedActivity.label} Activities</h4>
                  <p className="text-gray-600">
                    {selectedActivity.fullDescription}
                  </p>
                </div>
                
                {/* Quick Facts Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiThermometer className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Intensity</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedActivity.intensity}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiClock className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Duration</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedActivity.duration}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiUsers className="w-4 h-4 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Group Size</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedActivity.groupSize}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiDollarSign className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Price Range</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedActivity.priceRange}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiMapPin className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Best Season</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedActivity.bestSeason}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiClock className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Difficulty</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedActivity.difficulty}</p>
                  </div>
                </div>
                
                {/* Popular Spots */}
                {selectedActivity.popularSpots && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Popular Destinations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.popularSpots.map((spot, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {spot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Age Restriction */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Age restriction: <span className="font-semibold">{selectedActivity.ageRestriction}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  closeModal();
                  navigate(`/activity/${selectedActivity.id}`);
                }}
                className="px-5 py-2.5 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition flex items-center space-x-2"
              >
                <span>Find {selectedActivity.label} Trips</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default AllActivitiesPage;