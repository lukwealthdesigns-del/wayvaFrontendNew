// components/TripPlanner/DestinationStep.jsx - Add mock fallback
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiMapPin, FiChevronLeft, FiChevronRight, FiCheck, FiGlobe, FiSearch, FiLoader } from 'react-icons/fi';
import { destinationsAPI } from '../../api/destinations';

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const DestinationStep = ({ selectedDestination, onSelect, onContinue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  
  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';

  // Mock popular destinations as fallback
  const mockPopularDestinations = [
    { id: 1, city: 'Paris', country: 'France', region: 'Paris', flag: '🇫🇷', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
    { id: 2, city: 'London', country: 'United Kingdom', region: 'London', flag: '🇬🇧', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
    { id: 3, city: 'Tokyo', country: 'Japan', region: 'Tokyo', flag: '🇯🇵', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
    { id: 4, city: 'Dubai', country: 'UAE', region: 'Dubai', flag: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
    { id: 5, city: 'Cape Town', country: 'South Africa', region: 'Western Cape', flag: '🇿🇦', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' },
    { id: 6, city: 'Lagos', country: 'Nigeria', region: 'Lagos', flag: '🇳🇬', image: 'https://i.redd.it/rbpx8j40bxzb1.jpg' },
    { id: 7, city: 'New York', country: 'USA', region: 'New York', flag: '🇺🇸', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
    { id: 8, city: 'Bali', country: 'Indonesia', region: 'Bali', flag: '🇮🇩', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400' },
  ];

  // Fetch popular destinations with 5s timeout
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchPopularDestinations = async () => {
      setIsLoading(true);
      setIsLoadingTimeout(false);
      
      // Set 5 second timeout to show mock data
      timeoutId = setTimeout(() => {
        if (isMounted && isLoading) {
          console.log('⚠️ Popular destinations timeout - showing mock data');
          setPopularDestinations(mockPopularDestinations);
          setIsLoading(false);
          setIsLoadingTimeout(true);
        }
      }, 5000);

      try {
        const response = await destinationsAPI.getPopularDestinations(false, 12);
        
        if (isMounted) {
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            const formatted = response.data.map((item, index) => {
              const dest = item.destination;
              return {
                id: dest.id || `popular-${index}`,
                city: dest.city || dest.name,
                country: dest.country,
                region: dest.city || dest.name,
                image: getDestinationImage(dest),
                flag: getFlagEmoji(dest.country_code),
                type: 'popular',
                popularity_score: dest.popularity_score,
                is_trending: item.is_trending
              };
            });
            
            clearTimeout(timeoutId);
            setPopularDestinations(formatted);
            setIsLoading(false);
            setIsLoadingTimeout(false);
            console.log('✅ Loaded real popular destinations');
          } else {
            // No data received, use mock
            clearTimeout(timeoutId);
            setPopularDestinations(mockPopularDestinations);
            setIsLoading(false);
            setIsLoadingTimeout(true);
            console.log('⚠️ No popular destinations from API - using mock');
          }
        }
      } catch (error) {
        console.error('Error fetching popular destinations:', error);
        if (isMounted) {
          clearTimeout(timeoutId);
          setPopularDestinations(mockPopularDestinations);
          setIsLoading(false);
          setIsLoadingTimeout(true);
          console.log('⚠️ Error fetching - using mock destinations');
        }
      }
    };

    fetchPopularDestinations();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Mock search fallback when API fails
  const mockSearchDestinations = (query) => {
    const queryLower = query.toLowerCase();
    return mockPopularDestinations.filter(dest => 
      dest.city.toLowerCase().includes(queryLower) ||
      dest.country.toLowerCase().includes(queryLower)
    ).slice(0, 5).map(dest => ({
      ...dest,
      type: 'destination',
      id: `mock-${dest.id}`
    }));
  };

  // Search destinations using backend API with fallback
  const searchDestinations = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await destinationsAPI.searchDestinations({
          query: query,
          page: 1,
          page_size: 20
        });

        if (response.data && response.data.destinations && response.data.destinations.length > 0) {
          const formattedResults = response.data.destinations.map((dest) => ({
            id: dest.id,
            city: dest.city || dest.name,
            country: dest.country,
            region: dest.city || dest.name,
            type: 'destination',
            flag: getFlagEmoji(dest.country_code),
            image: getDestinationImage(dest),
            popularity_score: dest.popularity_score,
            best_time_to_visit: dest.best_time_to_visit,
            avg_daily_cost: dest.avg_daily_cost_mid
          }));
          setSearchResults(formattedResults);
        } else {
          // Fallback to mock search results
          console.log('⚠️ No search results from API - using mock');
          const mockResults = mockSearchDestinations(query);
          setSearchResults(mockResults);
        }
      } catch (error) {
        console.error('Error searching destinations:', error);
        // Fallback to mock search results
        const mockResults = mockSearchDestinations(query);
        setSearchResults(mockResults);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      searchDestinations(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchDestinations]);

  const getDestinationImage = (destination) => {
    if (destination.images && destination.images.length > 0) {
      return destination.images[0];
    }
    if (destination.featured_image) {
      return destination.featured_image;
    }
    return `https://source.unsplash.com/featured/400x300/?${destination.city || destination.name || destination.country},travel`;
  };

  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '🏳️';
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
    } catch (error) {
      return '🏳️';
    }
  };

  const handleDestinationSelect = (destination) => {
    const selected = {
      id: destination.id,
      city: destination.city || destination.name,
      country: destination.country,
      region: destination.region || destination.country,
      image: destination.image || getDestinationImage(destination),
      type: destination.type || 'destination',
      flag: destination.flag,
      display_name: `${destination.city || destination.name}, ${destination.country}`
    };
    
    onSelect(selected);
    setShowResults(false);
    setSearchQuery(destination.city || destination.name || '');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length > 0) {
      setShowResults(true);
    }
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayName = (dest) => {
    if (dest.type === 'country') {
      return `${dest.flag || '🏳️'} ${dest.country}`;
    }
    return `${dest.flag || '📍'} ${dest.city}, ${dest.country}`;
  };

  const scrollPopularDestinations = (direction) => {
    const container = document.getElementById('popular-destinations-scroll');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="px-6 pt-2 pb-32">
        <h1 className="text-xl font-bold text-gray-900 mb-2">New Trip</h1>
        <p className="text-gray-600 mb-4 text-md">Where would you love to go today?</p>

        {/* Search Input */}
        <div className="mb-4 relative" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              placeholder="Search cities, countries..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': PRIMARY_COLOR }}
            />
            {isLoading && searchQuery.length > 0 && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                <FiLoader className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-lg">
              {isLoading && searchQuery.length > 0 ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#064473] mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Searching destinations...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((destination) => (
                    <button
                      key={destination.id}
                      onClick={() => handleDestinationSelect(destination)}
                      className={`w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        selectedDestination?.id === destination.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0 mr-3">
                          <span className="text-xl">{destination.flag || '📍'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {destination.city || destination.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {destination.country}
                          </p>
                        </div>
                      </div>
                      {selectedDestination?.id === destination.id && (
                        <div className="ml-2 flex-shrink-0">
                          <FiCheck className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-6 text-center">
                  <FiMapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No destinations found</p>
                  <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-600">Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular Destinations Section */}
        {!showResults && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Popular Destinations</h2>
                {isLoadingTimeout && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    ⚡ Sample Data
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => scrollPopularDestinations('left')}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  style={{ color: PRIMARY_COLOR }}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scrollPopularDestinations('right')}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  style={{ color: PRIMARY_COLOR }}
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Container */}
            {isLoading && !isLoadingTimeout ? (
              <div className="flex space-x-4 overflow-x-auto pb-2 pt-2 -mx-2 px-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-shrink-0 w-56 animate-pulse">
                    <div className="h-36 bg-gray-200 rounded-xl"></div>
                    <div className="p-2 bg-white">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                id="popular-destinations-scroll"
                className="flex space-x-4 overflow-x-auto pb-2 pt-2 -mx-2 px-2 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {popularDestinations.map((destination) => (
                  <div key={destination.id} className="flex-shrink-0 w-56 relative">
                    {/* Trending Badge */}
                    {destination.is_trending && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                          🔥 Trending
                        </span>
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    {selectedDestination?.id === destination.id && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg" 
                            style={{ backgroundColor: PRIMARY_COLOR }}>
                          <FiCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleDestinationSelect(destination)}
                      className={`w-full overflow-hidden rounded-xl transition-all duration-200 ${
                        selectedDestination?.id === destination.id
                          ? 'ring-3 shadow-md'
                          : 'ring-1 ring-gray-200 hover:ring-gray-300'
                      }`}
                      style={{
                        '--tw-ring-color': selectedDestination?.id === destination.id ? PRIMARY_COLOR : undefined
                      }}
                    >
                      <div className="relative h-36">
                        <img
                          src={destination.image}
                          alt={`${destination.city}, ${destination.country}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://source.unsplash.com/featured/400x300/?${destination.city},${destination.country}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2 text-white">
                          <h3 className="font-bold text-base">{destination.city}</h3>
                          <p className="text-xs opacity-90 flex items-center">
                            <span className="mr-1">{destination.flag}</span>
                            {destination.country}
                          </p>
                        </div>
                      </div>
                      <div className="p-2 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" style={{ color: PRIMARY_COLOR }} />
                            <span className="text-xs text-gray-600 truncate">{destination.region}</span>
                          </div>
                          {destination.popularity_score && (
                            <span className="text-xs text-yellow-600">
                              ★ {destination.popularity_score.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Retry button if timeout occurred with no data */}
            {isLoadingTimeout && popularDestinations.length === 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#064473] text-white rounded-lg text-sm hover:bg-[#043254] transition"
                >
                  Retry Loading
                </button>
              </div>
            )}
          </div>
        )}

        {/* Selected Destination Preview */}
        {selectedDestination && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: PRIMARY_COLOR }}>
                Selected Destination
              </p>
              <span className="text-xs px-2 py-1 rounded bg-white border border-blue-200 text-blue-700">
                Ready to plan
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 border-2 border-white shadow-sm">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.city}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base truncate">
                  {selectedDestination.city}, {selectedDestination.country}
                </h3>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <FiMapPin className="w-3 h-3 mr-1 flex-shrink-0" style={{ color: PRIMARY_COLOR }} />
                  <span className="truncate">
                    {selectedDestination.region || selectedDestination.country}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Destination Selection Tips */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">📍 Tips for choosing a destination:</p>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">•</span>
              <span>Search for cities or countries worldwide</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">•</span>
              <span>Type at least 2 characters to search</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">•</span>
              <span>Check visa requirements for your passport</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#064473] mr-2">•</span>
              <span>Browse popular destinations for inspiration</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={onContinue}
          disabled={!selectedDestination}
          className="w-full py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
          style={{ 
            backgroundColor: selectedDestination ? PRIMARY_COLOR : PRIMARY_LIGHT,
            color: selectedDestination ? 'white' : PRIMARY_COLOR
          }}
        >
          {selectedDestination ? 'Continue →' : 'Select a destination to continue'}
        </button>
      </div>

      {/* CSS to hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default DestinationStep;