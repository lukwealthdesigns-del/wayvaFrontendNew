// pages/AllDestinationsPage.jsx - Backend Integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiMapPin, FiCalendar, FiUsers, FiChevronRight, FiX, FiStar, FiGlobe, FiDollarSign, FiClock, FiThermometer, FiShield, FiBriefcase, FiSearch } from 'react-icons/fi';
import BottomNav from '../components/Layout/BottomNav';
import { destinationsAPI } from '../api/destinations';
import { tripsAPI } from '../api/trips';
import { useAuth } from '../context/AuthContext';

const AllDestinationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popularStats, setPopularStats] = useState({});
  
  const PRIMARY_COLOR = '#064473';

  // Fetch destinations on mount
  useEffect(() => {
    fetchDestinations();
    fetchPopularStats();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await destinationsAPI.searchDestinations({
        page: 1,
        page_size: 50
      });
      setDestinations(response.data.destinations || []);
      setFilteredDestinations(response.data.destinations || []);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularStats = async () => {
    try {
      const response = await destinationsAPI.getPopularDestinations(false, 20);
      const stats = {};
      response.data.forEach(item => {
        stats[item.destination.id] = {
          total_trips: item.total_trips,
          avg_rating: item.avg_rating,
          is_trending: item.is_trending
        };
      });
      setPopularStats(stats);
    } catch (error) {
      console.error('Failed to fetch popular stats:', error);
    }
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDestinations(destinations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = destinations.filter(dest => 
        dest.name?.toLowerCase().includes(query) ||
        dest.city?.toLowerCase().includes(query) ||
        dest.country?.toLowerCase().includes(query) ||
        dest.description?.toLowerCase().includes(query)
      );
      setFilteredDestinations(filtered);
    }
  }, [searchQuery, destinations]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const handleViewDetails = async (destination) => {
    setSelectedDestination(destination);
    setShowModal(true);
    setLoadingDetails(true);
    
    try {
      // Fetch detailed destination info
      const response = await destinationsAPI.getDestination(destination.id, true, true);
      setSelectedDestination(response.data);
    } catch (error) {
      console.error('Failed to fetch destination details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePlanTrip = (destination) => {
    navigate('/plan-trip', {
      state: {
        prefillDestination: {
          city: destination.city || destination.name,
          country: destination.country,
          full: destination.display_name || `${destination.city || destination.name}, ${destination.country}`
        }
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDestination(null);
  };

  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  const getDestinationImage = (destination) => {
    if (destination.images && destination.images.length > 0) {
      return destination.images[0];
    }
    if (destination.featured_image) {
      return destination.featured_image;
    }
    return `https://source.unsplash.com/800x600/?${destination.city || destination.name},${destination.country},travel`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
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
          
          <h1 className="text-xl font-bold text-gray-900">All Destinations</h1>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="w-full bg-white rounded-xl py-3 px-4 pl-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm border border-gray-200"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <FiSearch className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Destination Count */}
          <div className="mb-4">
            {loading ? (
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-gray-600">
                Showing <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>{filteredDestinations.length}</span> destinations
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Destinations Grid */
            <div className="grid grid-cols-1 gap-6">
              {filteredDestinations.map((dest) => {
                const stats = popularStats[dest.id] || {};
                const imageUrl = getDestinationImage(dest);
                const flag = getFlagEmoji(dest.country_code);
                const rating = stats.avg_rating || dest.popularity_score || 4.5;
                
                return (
                  <div
                    key={dest.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Destination image */}
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${dest.city || dest.name}, ${dest.country}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://source.unsplash.com/800x600/?${dest.city || dest.name},${dest.country},travel`;
                        }}
                      />
                      
                      {/* Trending badge */}
                      {stats.is_trending && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-4 py-1.5 shadow-sm">
                          <span className="text-xs font-semibold">🔥 Trending</span>
                        </div>
                      )}
                      
                      {/* Rating badge */}
                      <div className="absolute top-4 left-4 flex items-center bg-black/70 text-white rounded-full px-3 py-1 backdrop-blur-sm">
                        <FiStar className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                        <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
                        {stats.total_trips > 0 && (
                          <span className="text-xs opacity-80 ml-1">({formatNumber(stats.total_trips)})</span>
                        )}
                      </div>
                      
                      {/* Gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      {/* City and flag */}
                      <div className="absolute bottom-4 left-4 flex items-center">
                        <div className="text-2xl mr-2">{flag}</div>
                        <div>
                          <h3 className="text-xl font-bold text-white drop-shadow-md">{dest.city || dest.name}</h3>
                          <p className="text-white/90 text-sm drop-shadow-md">{dest.country}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Details section */}
                    <div className="p-4">
                      {/* Short description */}
                      {dest.short_description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {dest.short_description}
                        </p>
                      )}
                      
                      {/* Cost range */}
                      {dest.avg_daily_cost_mid && (
                        <div className="flex items-center space-x-2 text-gray-600 mb-3">
                          <FiDollarSign className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">
                            ~{dest.currency || 'USD'} {dest.avg_daily_cost_mid}/day
                          </span>
                        </div>
                      )}
                      
                      {/* Best time to visit */}
                      {dest.best_time_to_visit && (
                        <div className="flex items-center space-x-2 text-gray-600 mb-3">
                          <FiClock className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">Best: {dest.best_time_to_visit}</span>
                        </div>
                      )}
                      
                      {/* Button */}
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleViewDetails(dest)}
                          className="px-5 py-2.5 text-white rounded-xl font-medium hover:opacity-90 transition flex items-center space-x-2"
                          style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                          <span>View Details</span>
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredDestinations.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiMapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No destinations found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search query
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-2 bg-[#064473] text-white rounded-lg text-sm"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Back button at bottom */}
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
      
      {/* Destination Details Modal */}
      {showModal && selectedDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{getFlagEmoji(selectedDestination.country_code)}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDestination.city || selectedDestination.name}, {selectedDestination.country}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedDestination.continent || 'International'} Destination
                  </p>
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
                      src={getDestinationImage(selectedDestination)}
                      alt={selectedDestination.city || selectedDestination.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      About {selectedDestination.city || selectedDestination.name}
                    </h4>
                    <p className="text-gray-600">
                      {selectedDestination.description || 'No description available.'}
                    </p>
                  </div>
                  
                  {/* Quick Facts Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiGlobe className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Timezone</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{selectedDestination.timezone || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiDollarSign className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Currency</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{selectedDestination.currency || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiBriefcase className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Language</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{selectedDestination.language || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiClock className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Best Time</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{selectedDestination.best_time_to_visit || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiThermometer className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Avg. Temp</span>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {selectedDestination.avg_temperature || 
                         `${selectedDestination.avg_daily_cost_low || '20'}°C - ${selectedDestination.avg_daily_cost_high || '30'}°C`}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FiShield className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Popularity</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-900 font-semibold mr-2">
                          {selectedDestination.popularity_score?.toFixed(1) || '4.0'}/10
                        </span>
                        <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Cost Information */}
                  {(selectedDestination.avg_daily_cost_low || selectedDestination.avg_daily_cost_mid) && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Estimated Daily Costs</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedDestination.avg_daily_cost_low && (
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-600 mb-1">Budget</p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedDestination.currency || 'USD'} {selectedDestination.avg_daily_cost_low}
                            </p>
                          </div>
                        )}
                        {selectedDestination.avg_daily_cost_mid && (
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-600 mb-1">Standard</p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedDestination.currency || 'USD'} {selectedDestination.avg_daily_cost_mid}
                            </p>
                          </div>
                        )}
                        {selectedDestination.avg_daily_cost_high && (
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-600 mb-1">Luxury</p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedDestination.currency || 'USD'} {selectedDestination.avg_daily_cost_high}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Categories / Tags */}
                  {selectedDestination.categories && selectedDestination.categories.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDestination.categories.map((cat, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Weather Info */}
                  {selectedDestination.weather_info && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Weather Forecast</h4>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Current Conditions</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedDestination.weather_info.condition || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Temperature</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedDestination.weather_info.temp || 'N/A'}°C
                            </p>
                          </div>
                        </div>
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
                  handlePlanTrip(selectedDestination);
                }}
                className="px-5 py-2.5 text-white rounded-xl font-medium hover:opacity-90 transition flex items-center space-x-2"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                <span>Plan Trip to {selectedDestination.city || selectedDestination.name}</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default AllDestinationsPage;