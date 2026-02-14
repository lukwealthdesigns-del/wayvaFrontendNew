// components/Home/DestinationGrid.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiUsers, FiChevronRight, FiStar, FiX, FiGlobe, FiDollarSign, FiClock, FiThermometer, FiShield, FiBriefcase } from 'react-icons/fi';

const DestinationGrid = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [destinationDetails, setDestinationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Country flag emojis mapping
  const countryFlags = {
    'FR': '🇫🇷', // France
    'ID': '🇮🇩', // Indonesia
    'ZA': '🇿🇦', // South Africa
    'JP': '🇯🇵', // Japan
    'NG': '🇳🇬', // Nigeria
    'US': '🇺🇸', // United States
    'GB': '🇬🇧', // United Kingdom
    'IT': '🇮🇹', // Italy
    'ES': '🇪🇸', // Spain
    'AU': '🇦🇺', // Australia
  };
  
  // Fetch destinations from backend
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8000/api/destinations/featured?limit=4');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch destinations: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map backend data to frontend format
        const mappedDestinations = data.map((dest, index) => {
          // Get primary image or first image
          let primaryImage = '';
          if (dest.images && dest.images.length > 0) {
            const primary = dest.images.find(img => img.is_primary);
            primaryImage = primary ? primary.image_url : dest.images[0].image_url;
          }
          
          // If no image from backend, use fallback based on destination
          if (!primaryImage) {
            primaryImage = getFallbackImage(dest.name, index);
          }
          
          // Format name - extract city if it contains comma
          let cityName = dest.name;
          if (dest.name.includes(',')) {
            cityName = dest.name.split(',')[0];
          }
          
          // Get country code for flag
          const countryCode = dest.country_code || getCountryCode(dest.country);
          
          // Get flag emoji
          const flag = countryFlags[countryCode] || '🏳️';
          
          // Get style based on destination characteristics
          const style = getDestinationStyle(cityName, dest.country, index);
          
          // Get travelers type
          const travelers = getTravelersType(index);
          
          // Generate date range
          const dateRange = generateDateRange(index);
          
          return {
            id: dest.id,
            city: cityName,
            country: dest.country,
            countryCode: countryCode,
            flag: flag,
            dateRange: dateRange,
            travelers: travelers,
            style: style,
            image: primaryImage,
            rating: dest.rating || 4.5 + (index * 0.1),
            reviewCount: dest.review_count || Math.floor(Math.random() * 500) + 100,
            description: dest.short_description || dest.description,
            fullDescription: dest.description,
            timezone: dest.timezone || 'GMT',
            currency: dest.currency || 'USD',
            language: dest.language || 'English',
            bestTimeToVisit: dest.best_time_to_visit || 'All year round',
            averageTemperature: dest.average_temperature || '20°C',
            visaRequirements: dest.visa_requirements || 'Check requirements',
            safetyRating: dest.safety_rating || 4.0
          };
        });
        
        setDestinations(mappedDestinations);
        
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError(err.message);
        // Fallback to default data with flag emojis
        setDestinations(getFallbackDestinations());
      } finally {
        setLoading(false);
      }
    };
    
    fetchDestinations();
  }, []);
  
  // Fetch detailed destination data when modal opens
  const fetchDestinationDetails = async (destinationId) => {
    try {
      setLoadingDetails(true);
      const response = await fetch(`http://localhost:8000/api/destinations/${destinationId}?include_activities=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch destination details: ${response.status}`);
      }
      
      const data = await response.json();
      setDestinationDetails(data);
      
      // Also fetch activities for this destination
      const activitiesResponse = await fetch(`http://localhost:8000/api/destinations/${destinationId}/activities?limit=5`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setDestinationDetails(prev => ({
          ...prev,
          activities: activitiesData
        }));
      }
    } catch (err) {
      console.error('Error fetching destination details:', err);
      // Use existing data if fetch fails
      const existingDest = destinations.find(d => d.id === destinationId);
      setDestinationDetails(existingDest);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  // Handle view details click
  const handleViewDetails = (destination) => {
    setSelectedDestination(destination);
    setShowModal(true);
    fetchDestinationDetails(destination.id);
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedDestination(null);
    setDestinationDetails(null);
  };
  
  // Helper functions
  const getFallbackImage = (destinationName, index) => {
    const destinationImages = {
      'Paris': [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      'Bali': [
        'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      'Cape Town': [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1573849666082-3fec19c6d360?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      'Tokyo': [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      'Lagos': [
        'https://i.redd.it/rbpx8j40bxzb1.jpg',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1592923656277-6a5c596f0832?w=800&h=600&fit=crop'
      ],
      'Abuja': [
        'https://outravelandtour.com/wp-content/uploads/2019/12/Best-Neighborhoods-To-Stay-In-Abuja.jpg',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1523480717984-24cba35ae1eb?w=800&h=600&fit=crop'
      ]
    };
    
    // Extract city name
    let city = destinationName;
    if (destinationName.includes(',')) {
      city = destinationName.split(',')[0].trim();
    }
    
    // Get images for this city
    const images = destinationImages[city] || [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    
    return images[index % images.length];
  };
  
  const getCountryCode = (country) => {
    const codes = {
      'France': 'FR',
      'Indonesia': 'ID',
      'South Africa': 'ZA',
      'Japan': 'JP',
      'Nigeria': 'NG',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Italy': 'IT',
      'Spain': 'ES',
      'Australia': 'AU'
    };
    return codes[country] || country.substring(0, 2).toUpperCase();
  };
  
  const getDestinationStyle = (cityName, country, index) => {
    const styles = [
      'Luxury', 'Vibrant', 'Adventure', 'Cultural', 
      'Relaxing', 'Historic', 'Modern', 'Scenic'
    ];
    
    if (cityName.includes('Paris')) return 'Luxury';
    if (cityName.includes('Bali')) return 'Relaxing';
    if (cityName.includes('Cape Town')) return 'Adventure';
    if (cityName.includes('Tokyo')) return 'Modern';
    if (cityName.includes('Lagos')) return 'Vibrant';
    if (cityName.includes('Abuja')) return 'Cultural';
    
    return styles[index % styles.length];
  };
  
  const getTravelersType = (index) => {
    const travelers = ['A couple', 'Friends', 'Solo', 'Family'];
    return travelers[index % travelers.length];
  };
  
  const generateDateRange = (index) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month1 = months[(index + 3) % 12];
    const month2 = months[(index + 5) % 12];
    return `${month1} 24 - ${month2} 24, 2025`;
  };
  
  const getFallbackDestinations = () => {
    return [
      {
        id: 1,
        city: 'Paris',
        country: 'France',
        countryCode: 'FR',
        flag: '🇫🇷',
        dateRange: 'Jan 24 - May 24, 2025',
        travelers: 'A couple',
        style: 'Luxury',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        reviewCount: 1250,
        description: 'Romantic city with iconic landmarks',
        fullDescription: 'Paris, France\'s capital, is a major European city and a global center for art, fashion, gastronomy and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine.',
        timezone: 'CET (UTC+1)',
        currency: 'EUR (Euro)',
        language: 'French',
        bestTimeToVisit: 'April to June and September to November',
        averageTemperature: '15°C',
        visaRequirements: 'Schengen Visa required',
        safetyRating: 4.5
      },
      {
        id: 2,
        city: 'Lagos',
        country: 'Nigeria',
        countryCode: 'NG',
        flag: '🇳🇬',
        dateRange: 'Mar 10 - Mar 20, 2025',
        travelers: 'Friends',
        style: 'Vibrant',
        image: 'https://i.redd.it/rbpx8j40bxzb1.jpg',
        rating: 4.3,
        reviewCount: 850,
        description: 'Bustling economic capital of Nigeria',
        fullDescription: 'Lagos is the largest city in Nigeria and the African continent. It is a major financial center and economic hub, known for its vibrant music scene, nightlife, and beaches.',
        timezone: 'WAT (UTC+1)',
        currency: 'NGN (Naira)',
        language: 'English, Yoruba',
        bestTimeToVisit: 'November to March',
        averageTemperature: '27°C',
        visaRequirements: 'Visa on Arrival for many countries',
        safetyRating: 3.8
      },
      {
        id: 3,
        city: 'Tokyo',
        country: 'Japan',
        countryCode: 'JP',
        flag: '🇯🇵',
        dateRange: 'Mar 15 - Mar 25, 2025',
        travelers: 'Solo',
        style: 'Adventure',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        reviewCount: 1100,
        description: 'Vibrant metropolis blending tradition and modernity',
        fullDescription: 'Tokyo, Japan\'s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples. The city is known for its vibrant pop culture and numerous districts.',
        timezone: 'JST (UTC+9)',
        currency: 'JPY (Yen)',
        language: 'Japanese',
        bestTimeToVisit: 'March to April and September to November',
        averageTemperature: '16°C',
        visaRequirements: 'Visa required for most',
        safetyRating: 4.7
      },
      {
        id: 4,
        city: 'Abuja',
        country: 'Nigeria',
        countryCode: 'NG',
        flag: '🇳🇬',
        dateRange: 'Apr 5 - Apr 15, 2025',
        travelers: 'Family',
        style: 'Cultural',
        image: 'https://outravelandtour.com/wp-content/uploads/2019/12/Best-Neighborhoods-To-Stay-In-Abuja.jpg',
        rating: 4.4,
        reviewCount: 720,
        description: 'Modern capital city of Nigeria',
        fullDescription: 'Abuja is the capital city of Nigeria, located in the center of the country. It is a planned city known for its modern architecture, government buildings, and the Aso Rock presidential villa.',
        timezone: 'WAT (UTC+1)',
        currency: 'NGN (Naira)',
        language: 'English',
        bestTimeToVisit: 'November to February',
        averageTemperature: '26°C',
        visaRequirements: 'Visa on Arrival for many countries',
        safetyRating: 4.2
      }
    ];
  };
  
  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Popular Destination</h2>
          <button className="flex items-center text-[#064473] text-sm font-medium">
            See all
            <FiChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="space-y-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header with See All */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Popular Destination</h2>
        <button 
          onClick={() => navigate('/destinations')}
          className="flex items-center text-[#064473] text-sm font-medium hover:underline"
        >
          See all
          <FiChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-600 rounded-lg text-sm">
          Could not load destinations. Showing sample data.
        </div>
      )}
      
      <div className="space-y-6">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* High-quality destination image */}
            <div className="h-48 relative overflow-hidden">
              <img
                src={dest.image}
                alt={`${dest.city}, ${dest.country}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full bg-[#064473] flex items-center justify-center">
                      <div class="text-center text-white">
                        <div class="text-3xl mb-2">${dest.flag}</div>
                        <div class="text-lg font-bold">${dest.city}</div>
                      </div>
                    </div>
                  `;
                }}
              />
              
              {/* Style badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
                <span className="text-sm font-semibold text-gray-800">{dest.style}</span>
              </div>
              
              {/* Rating badge */}
              <div className="absolute top-4 left-4 flex items-center bg-black/70 text-white rounded-full px-3 py-1 backdrop-blur-sm">
                <FiStar className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                <span className="text-xs font-semibold">{dest.rating?.toFixed(1) || '4.5'}</span>
                <span className="text-xs opacity-80 ml-1">({dest.reviewCount?.toLocaleString() || '1.2k'})</span>
              </div>
              
              {/* Gradient overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* City and flag at bottom left */}
              <div className="absolute bottom-4 left-4 flex items-center">
                <div className="text-2xl mr-2">{dest.flag}</div>
                <div>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">{dest.city}</h3>
                  <p className="text-white/90 text-sm drop-shadow-md">{dest.country}</p>
                </div>
              </div>
            </div>
            
            {/* Details section */}
            <div className="p-4">
              {/* Trip dates */}
              <div className="flex items-center space-x-2 text-gray-600 mb-3">
                <FiCalendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{dest.dateRange}</span>
              </div>
              
              {/* Travelers and button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiUsers className="w-4 h-4" />
                  <span className="text-sm">{dest.travelers}</span>
                </div>
                
                <button 
                  onClick={() => handleViewDetails(dest)}
                  className="px-5 py-2.5 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition flex items-center space-x-2"
                >
                  <span>View Details</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Destination Details Modal */}
      {showModal && selectedDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{selectedDestination.flag}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDestination.city}, {selectedDestination.country}</h3>
                  <p className="text-sm text-gray-500">{selectedDestination.style} Destination</p>
                </div>
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
              {loadingDetails ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-gray-600">Loading destination details...</p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Hero Image */}
                  <div className="rounded-xl overflow-hidden mb-6">
                    <img
                      src={selectedDestination.image}
                      alt={selectedDestination.city}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">About {selectedDestination.city}</h4>
                    <p className="text-gray-600">
                      {destinationDetails?.fullDescription || destinationDetails?.description || selectedDestination.description || 'No description available.'}
                    </p>
                  </div>
                  
                  {/* Quick Facts Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiGlobe className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Timezone</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{destinationDetails?.timezone || selectedDestination.timezone || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiDollarSign className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Currency</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{destinationDetails?.currency || selectedDestination.currency || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiBriefcase className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Language</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{destinationDetails?.language || selectedDestination.language || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiClock className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Best Time</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{destinationDetails?.bestTimeToVisit || selectedDestination.bestTimeToVisit || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiThermometer className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Temperature</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{destinationDetails?.averageTemperature || selectedDestination.averageTemperature || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiShield className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Safety</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-900 font-semibold mr-2">
                          {destinationDetails?.safetyRating || selectedDestination.safetyRating || 4.0}/5.0
                        </span>
                        <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Visa Information */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Visa Requirements</h4>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-blue-800">
                        {destinationDetails?.visaRequirements || selectedDestination.visaRequirements || 'Visa requirements vary by nationality. Please check with your local embassy.'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Activities (if available) */}
                  {destinationDetails?.activities && destinationDetails.activities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Popular Activities</h4>
                      <div className="space-y-3">
                        {destinationDetails.activities.slice(0, 3).map((activity) => (
                          <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                              <FiStar className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{activity.name}</p>
                              <p className="text-sm text-gray-500">{activity.category} • {activity.duration_hours || '2-3'} hours</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                  navigate(`/destination/${selectedDestination.id}`);
                }}
                className="px-5 py-2.5 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition flex items-center space-x-2"
              >
                <span>Plan Trip to {selectedDestination.city}</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationGrid;