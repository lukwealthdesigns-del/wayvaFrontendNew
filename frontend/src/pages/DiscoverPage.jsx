// pages/DiscoverPage.jsx - Backend Integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiStar, 
  FiGlobe, 
  FiUsers, 
  FiCalendar, 
  FiMapPin, 
  FiFilter,
  FiChevronRight,
  FiX,
  FiSun,
  FiHome,
  FiCompass,
  FiCamera,
  FiHeart,
  FiAward,
  FiBookmark
} from 'react-icons/fi';
import { FaCity, FaMountain, FaLandmark, FaUmbrellaBeach } from 'react-icons/fa';
import { GiMountains, GiEarthAmerica } from 'react-icons/gi';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import SearchBar from '../components/Discover/SearchBar';
import FilterButton from '../components/Discover/FilterButton';
import ExploreSection from '../components/Discover/ExploreSection';
import FloatingActionButton from '../components/Shared/FloatingActionButton';
import { destinationsAPI } from '../api/destinations';
import { tripsAPI } from '../api/trips';
import { useAuth } from '../context/AuthContext';

const DiscoverPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const PRIMARY_COLOR = '#064473';

  // Fetch popular destinations and public trips on mount
  useEffect(() => {
    fetchPopularDestinations();
    fetchPublicTrips();
  }, []);

  // Filter destinations when search changes
  useEffect(() => {
    if (searchQuery) {
      searchDestinations();
    } else {
      setFilteredDestinations(popularDestinations);
    }
  }, [searchQuery, popularDestinations]);

  const fetchPopularDestinations = async () => {
    setLoading(true);
    try {
      const response = await destinationsAPI.getPopularDestinations(false, 20);
      const destinations = response.data.map(item => item.destination);
      setPopularDestinations(destinations);
      setFilteredDestinations(destinations);
    } catch (error) {
      console.error('Failed to fetch popular destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicTrips = async () => {
    setLoadingTrips(true);
    try {
      const response = await tripsAPI.discoverTrips(null, 1, 10);
      setPublicTrips(response.data.trips || []);
    } catch (error) {
      console.error('Failed to fetch public trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const searchDestinations = async () => {
    setLoading(true);
    try {
      const response = await destinationsAPI.searchDestinations({
        query: searchQuery,
        page: 1,
        page_size: 20
      });
      setFilteredDestinations(response.data.destinations || []);
    } catch (error) {
      console.error('Failed to search destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setSearchQuery(category);
    
    try {
      setLoading(true);
      const response = await destinationsAPI.searchDestinations({
        categories: [category],
        page: 1,
        page_size: 20
      });
      setFilteredDestinations(response.data.destinations || []);
    } catch (error) {
      console.error(`Failed to fetch ${category} destinations:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDestination = async (destination) => {
    console.log('Save destination:', destination);
    // Will implement save to wishlist feature in future
    // This would require a new backend endpoint
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

  const handleViewTrip = (trip) => {
    navigate(`/itinerary-detail/${trip.id}`, {
      state: { tripId: trip.id }
    });
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Discover" showSearch={false} user={user} />
      
      <main className="px-6 pt-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Discover</h1>
          <p className="text-gray-600 mb-6">Find your next adventure</p>
          
          <div className="flex space-x-3 mb-6">
            <div className="flex-1">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={searchDestinations}
                placeholder="Search destinations..."
              />
            </div>
            <FilterButton onClick={() => {}} />
          </div>
          
          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-medium flex items-center" style={{ color: PRIMARY_COLOR }}>
                <FiSearch className="mr-2" size={16} />
                Searching for: "{searchQuery}"
              </p>
              <p className="text-xs text-gray-600 mt-1 flex items-center">
                <FiStar className="mr-1" size={12} />
                Found {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          {/* Popular Destinations Section */}
          <div className="mt-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FiAward className="mr-2" style={{ color: PRIMARY_COLOR }} size={20} />
              Popular Destinations
            </h2>
            <ExploreSection 
              destinations={filteredDestinations}
              onSaveDestination={handleSaveDestination}
              onPlanTrip={handlePlanTrip}
              loading={loading}
              getFlagEmoji={getFlagEmoji}
              getImage={getDestinationImage}
            />
          </div>
          
          {/* Community Trips Section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FiUsers className="mr-2" style={{ color: PRIMARY_COLOR }} size={20} />
              Community Adventures
            </h2>
            {loadingTrips ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : publicTrips.length > 0 ? (
              <div className="space-y-4">
                {publicTrips.map((trip) => (
                  <div 
                    key={trip.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewTrip(trip)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {trip.user?.profile_picture ? (
                            <img 
                              src={trip.user.profile_picture} 
                              alt={trip.user.first_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#064473] flex items-center justify-center text-white font-bold">
                              {trip.user?.first_name?.[0] || 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {trip.user?.first_name} {trip.user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FiMapPin className="mr-1" size={10} />
                            {trip.user?.country || 'Traveler'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 px-3 py-1 rounded-full flex items-center">
                        <FiCalendar className="mr-1" size={10} />
                        {trip.duration_days} days
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <h3 className="font-bold text-gray-900">{trip.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 flex items-start">
                        <FiMapPin className="mr-1 mt-1 flex-shrink-0" size={12} />
                        {trip.destination}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {trip.trip_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {trip.budget_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <button 
                        className="text-sm font-medium flex items-center"
                        style={{ color: PRIMARY_COLOR }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTrip(trip);
                        }}
                      >
                        View Itinerary <FiChevronRight className="ml-1" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <FiGlobe className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600">No community trips yet</p>
                <p className="text-sm text-gray-500 mt-1">Be the first to share your adventure!</p>
              </div>
            )}
          </div>
          
          {/* Browse by Category Section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FiCompass className="mr-2" style={{ color: PRIMARY_COLOR }} size={20} />
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`relative h-24 rounded-xl overflow-hidden group cursor-pointer ${
                  selectedCategory === 'beach' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{ ringColor: PRIMARY_COLOR }}
                onClick={() => handleCategoryClick('beach')}
              >
                <img 
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop"
                  alt="Beach Destinations"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-bold flex items-center">
                    <FaUmbrellaBeach className="mr-1" size={14} /> Beach
                  </p>
                  <p className="text-xs opacity-90">Tropical getaways</p>
                </div>
              </div>
              
              <div 
                className={`relative h-24 rounded-xl overflow-hidden group cursor-pointer ${
                  selectedCategory === 'city' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{ ringColor: PRIMARY_COLOR }}
                onClick={() => handleCategoryClick('city')}
              >
                <img 
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop"
                  alt="City Breaks"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-bold flex items-center">
                    <FaCity className="mr-1" size={14} /> City Breaks
                  </p>
                  <p className="text-xs opacity-90">Urban adventures</p>
                </div>
              </div>
              
              <div 
                className={`relative h-24 rounded-xl overflow-hidden group cursor-pointer ${
                  selectedCategory === 'adventure' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{ ringColor: PRIMARY_COLOR }}
                onClick={() => handleCategoryClick('adventure')}
              >
                <img 
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop"
                  alt="Adventure"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-bold flex items-center">
                    <GiMountains className="mr-1" size={14} /> Adventure
                  </p>
                  <p className="text-xs opacity-90">Thrill-seeking</p>
                </div>
              </div>
              
              <div 
                className={`relative h-24 rounded-xl overflow-hidden group cursor-pointer ${
                  selectedCategory === 'cultural' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{ ringColor: PRIMARY_COLOR }}
                onClick={() => handleCategoryClick('cultural')}
              >
                <img 
                  src="https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&auto=format&fit=crop"
                  alt="Cultural"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-bold flex items-center">
                    <FaLandmark className="mr-1" size={14} /> Cultural
                  </p>
                  <p className="text-xs opacity-90">History & heritage</p>
                </div>
              </div>
            </div>
            
            {selectedCategory && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setFilteredDestinations(popularDestinations);
                }}
                className="mt-3 text-sm font-medium flex items-center"
                style={{ color: PRIMARY_COLOR }}
              >
                Clear filter <FiX className="ml-1" size={16} />
              </button>
            )}
          </div>
          
          {/* View All Destinations Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/all-destinations')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center mx-auto"
            >
              <FiGlobe className="mr-2" size={18} />
              View All Destinations
            </button>
          </div>
        </div>
      </main>
      
      <BottomNav />
      <FloatingActionButton />
    </div>
  );
};

export default DiscoverPage;