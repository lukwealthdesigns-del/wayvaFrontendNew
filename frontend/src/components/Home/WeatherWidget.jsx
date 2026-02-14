// components/Home/WeatherWidget.jsx - Backend Integration
import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiThermometer, FiWind, FiRefreshCw, FiMapPin, FiGlobe, FiNavigation } from 'react-icons/fi';
import { WiHumidity } from 'react-icons/wi';
import { useAuth } from '../../context/AuthContext';
import { destinationsAPI } from '../../api/destinations';
import { useNavigate } from 'react-router-dom';

const WeatherWidget = ({ userLocation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const filterTabs = ['All', 'Popular', 'Recommended', 'Most Viewed'];
  
  // Weather states
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dummy weather data for loading state
  const dummyWeatherData = {
    weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
    main: { 
      temp: 22, 
      feels_like: 23, 
      humidity: 65,
      temp_min: 20,
      temp_max: 25
    },
    wind: { speed: 5 },
    name: userLocation?.displayName || 'Your Location'
  };
  
  // Travel search states
  const [placeholder, setPlaceholder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // Refs
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Get user's first name
  const firstName = user?.first_name || '';
  const greeting = firstName ? `Hello ${firstName}, where would you like to go today?` : 'Where would you like to go today?';
  
  // API keys
  const WEATHER_API_KEY = 'c42c0e6f266b9c2ba34d4bb4951b21e8';
  
  // Typing effect for greeting
  useEffect(() => {
    let i = 0;
    const typeWriter = () => {
      if (i < greeting.length) {
        setPlaceholder(greeting.substring(0, i + 1));
        i++;
        setTimeout(typeWriter, 50);
      }
    };
    
    const timer = setTimeout(() => {
      typeWriter();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [greeting]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch weather data for current location
  const fetchWeatherData = async (forceRefresh = false) => {
    if (!userLocation || !userLocation.coordinates) {
      if (!forceRefresh) {
        setLoading(false);
        setError('Waiting for location...');
        setWeatherData(dummyWeatherData);
        setLastUpdated(new Date());
      }
      return;
    }
    
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const { lat, lon } = userLocation.coordinates;
      
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API Error: ${weatherResponse.status}`);
      }
      
      const data = await weatherResponse.json();
      setWeatherData(data);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(`Fetching Weather: ${err.message}`);
      
      setWeatherData({
        ...dummyWeatherData,
        name: userLocation?.displayName || 'Location Error'
      });
      setLastUpdated(new Date());
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch weather on location change
  useEffect(() => {
    setWeatherData(dummyWeatherData);
    setLastUpdated(new Date());
    fetchWeatherData();
    
    const intervalId = setInterval(() => fetchWeatherData(), 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [userLocation]);

  // **FIXED: Use backend location search API**
  const searchDestinations = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      setSearchError(null);
      return;
    }
    
    setSearchLoading(true);
    setShowSuggestions(true);
    setSearchError(null);
    
    try {
      // Use backend location search endpoint
      const response = await destinationsAPI.searchLocations(query, 10);
      
      if (response.data && response.data.suggestions) {
        const formattedResults = response.data.suggestions.map((place, index) => ({
          id: `${place.name}-${place.country}-${index}`,
          name: place.name,
          country: place.country,
          city: place.city || place.name,
          lat: place.latitude,
          lon: place.longitude,
          displayName: place.name,
          countryCode: place.country_code
        }));
        
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
        setSearchError('No destinations found. Try a different search.');
      }
    } catch (err) {
      console.error('Search error:', err);
      
      // Fallback to static list if backend fails
      const staticFallback = getStaticFallbackCities(query);
      if (staticFallback.length > 0) {
        setSearchResults(staticFallback);
        setSearchError(null);
      } else {
        setSearchError('Search service unavailable. Please try again.');
        setSearchResults([]);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // Static fallback for common cities
  const getStaticFallbackCities = (query) => {
    const queryLower = query.toLowerCase();
    const popularCities = [
      { id: 'paris-fr', name: 'Paris', country: 'France', city: 'Paris', displayName: 'Paris, France' },
      { id: 'london-uk', name: 'London', country: 'United Kingdom', city: 'London', displayName: 'London, UK' },
      { id: 'new-york-us', name: 'New York', country: 'United States', city: 'New York', displayName: 'New York, USA' },
      { id: 'tokyo-jp', name: 'Tokyo', country: 'Japan', city: 'Tokyo', displayName: 'Tokyo, Japan' },
      { id: 'dubai-ae', name: 'Dubai', country: 'UAE', city: 'Dubai', displayName: 'Dubai, UAE' },
      { id: 'singapore-sg', name: 'Singapore', country: 'Singapore', city: 'Singapore', displayName: 'Singapore' },
      { id: 'bali-id', name: 'Bali', country: 'Indonesia', city: 'Bali', displayName: 'Bali, Indonesia' },
      { id: 'sydney-au', name: 'Sydney', country: 'Australia', city: 'Sydney', displayName: 'Sydney, Australia' },
      { id: 'rome-it', name: 'Rome', country: 'Italy', city: 'Rome', displayName: 'Rome, Italy' },
      { id: 'lagos-ng', name: 'Lagos', country: 'Nigeria', city: 'Lagos', displayName: 'Lagos, Nigeria' },
      { id: 'cape-town-za', name: 'Cape Town', country: 'South Africa', city: 'Cape Town', displayName: 'Cape Town, South Africa' },
      { id: 'nairobi-ke', name: 'Nairobi', country: 'Kenya', city: 'Nairobi', displayName: 'Nairobi, Kenya' }
    ];

    return popularCities.filter(city => 
      city.name.toLowerCase().includes(queryLower) ||
      city.country.toLowerCase().includes(queryLower) ||
      city.displayName.toLowerCase().includes(queryLower)
    ).slice(0, 5);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length >= 2) {
      searchDestinations(query);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
      setSearchError(null);
    }
  };

  // Handle destination selection - Navigate to trip planner
  const handleDestinationSelect = (destination) => {
    navigate('/plan-trip', {
      state: {
        prefillDestination: {
          city: destination.city || destination.name,
          country: destination.country,
          coordinates: destination.lat && destination.lon ? 
            { lat: destination.lat, lon: destination.lon } : null,
          displayName: destination.displayName || `${destination.name}, ${destination.country}`
        }
      }
    });
    
    setSearchQuery('');
    setShowSuggestions(false);
    setSearchResults([]);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      handleDestinationSelect(searchResults[0]);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchWeatherData(true);
  };

  // Responsive Weather Icon Function
  const getWeatherIcon = () => {
    const data = weatherData || dummyWeatherData;
    const condition = data.weather[0].main.toLowerCase();
    const description = data.weather[0].description.toLowerCase();
    const iconCode = data.weather[0].icon;
    const isDay = iconCode.includes('d');
    
    if (refreshing) {
      return (
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (condition.includes('clear')) {
      return (
        <div className="relative w-12 h-12">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="10" fill="#FDB022"/>
            {isDay && (
              <>
                <line x1="24" y1="4" x2="24" y2="10" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
                <line x1="38" y1="10" x2="33" y2="15" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
                <line x1="44" y1="24" x2="38" y2="24" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
                <line x1="38" y1="38" x2="33" y2="33" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="10" x2="15" y2="15" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4" y1="24" x2="10" y2="24" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </div>
      );
    }
    
    else if (condition.includes('cloud') && !description.includes('rain') && !description.includes('snow')) {
      return (
        <div className="relative w-12 h-12">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="28" rx="12" ry="8" fill="white" opacity="0.95"/>
            <ellipse cx="38" cy="30" rx="10" ry="7" fill="white" opacity="0.9"/>
            <ellipse cx="24" cy="30" rx="9" ry="6" fill="white" opacity="0.85"/>
            {isDay && <circle cx="12" cy="16" r="6" fill="#FDB022" opacity="0.6"/>}
          </svg>
        </div>
      );
    }
    
    else if (description.includes('rain') || description.includes('drizzle')) {
      return (
        <div className="relative w-12 h-12">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="28" rx="12" ry="8" fill="#A0AEC0" opacity="0.95"/>
            <ellipse cx="38" cy="30" rx="10" ry="7" fill="#A0AEC0" opacity="0.9"/>
            <ellipse cx="24" cy="30" rx="9" ry="6" fill="#A0AEC0" opacity="0.85"/>
            <line x1="24" y1="36" x2="24" y2="42" stroke="#4299E1" strokeWidth="2" strokeLinecap="round"/>
            <line x1="30" y1="38" x2="30" y2="44" stroke="#4299E1" strokeWidth="2" strokeLinecap="round"/>
            <line x1="36" y1="37" x2="36" y2="43" stroke="#4299E1" strokeWidth="2" strokeLinecap="round"/>
            {isDay && <circle cx="12" cy="16" r="4" fill="#FDB022" opacity="0.4"/>}
          </svg>
        </div>
      );
    }
    
    else if (description.includes('snow')) {
      return (
        <div className="relative w-12 h-12">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="28" rx="12" ry="8" fill="#E2E8F0" opacity="0.95"/>
            <ellipse cx="38" cy="30" rx="10" ry="7" fill="#E2E8F0" opacity="0.9"/>
            <ellipse cx="24" cy="30" rx="9" ry="6" fill="#E2E8F0" opacity="0.85"/>
            <circle cx="24" cy="40" r="1.5" fill="white"/>
            <circle cx="30" cy="38" r="1.5" fill="white"/>
            <circle cx="36" cy="41" r="1.5" fill="white"/>
          </svg>
        </div>
      );
    }
    
    else {
      return (
        <div className="relative w-12 h-12">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="28" rx="12" ry="8" fill="white" opacity="0.95"/>
            <ellipse cx="38" cy="30" rx="10" ry="7" fill="white" opacity="0.9"/>
            <ellipse cx="24" cy="30" rx="9" ry="6" fill="white" opacity="0.85"/>
          </svg>
        </div>
      );
    }
  };

  const formatTemp = (temp) => {
    return temp !== undefined ? `${Math.round(temp)}°` : '22°';
  };

  const getWeatherDescription = () => {
    if (loading) return 'Detecting weather...';
    if (error) return 'Fetching Weather';
    const data = weatherData || dummyWeatherData;
    return data.weather[0].description
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getLocationName = () => {
    if (userLocation?.displayName) return userLocation.displayName;
    if (weatherData?.name) return weatherData.name;
    return 'Your Location';
  };

  return (
    <div className="bg-[#60AAE2] rounded-2xl p-4 mb-5 shadow-sm">
      {/* Compact Weather Section with New Layout */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          {/* Temperature and Description */}
          <div>
            <p className="text-4xl font-bold text-white">
              {formatTemp(weatherData?.main?.temp)}
            </p>
            <p className="text-sm text-white mt-1">
              {getWeatherDescription()}
            </p>
            {lastUpdated && (
              <p className="text-[10px] text-white/70 mt-1">
                Updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                {loading && !weatherData ? ' (Detecting...)' : ''}
                {error ? ' (Using demo data)' : ''}
              </p>
            )}
          </div>
          
          {/* Weather Icon at Top Right */}
          <div className="flex flex-col items-end">
            <div className="mb-1">
              {getWeatherIcon()}
            </div>
            
            {/* Weather Stats Under Icon */}
            <div className="flex flex-col items-end space-y-1">
              {/* Humidity */}
              <div className="flex items-center gap-1">
                <WiHumidity className="w-4 h-4 text-white" />
                <p className="text-xs text-white">
                  {(weatherData?.main?.humidity ?? dummyWeatherData.main.humidity)}%
                  {loading && !weatherData?.main?.humidity && <span className="ml-1 text-white/60">(demo)</span>}
                </p>
              </div>
              
              {/* Feels Like */}
              <div className="flex items-center gap-1">
                <FiThermometer className="w-3 h-3 text-white" />
                <p className="text-xs text-white">
                  {formatTemp(weatherData?.main?.feels_like)}
                  {loading && !weatherData?.main?.feels_like && <span className="ml-1 text-white/60">demo</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Travel Destination Search */}
      <div className="mb-4 relative" ref={searchRef}>
        {/* Search Error Message */}
        {searchError && (
          <div className={`mb-2 p-2 rounded-lg text-xs ${searchError.startsWith('✓') ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
            {searchError}
          </div>
        )}
        
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full bg-white rounded-xl py-2.5 px-4 pl-11 text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              ref={searchRef}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FiSearch className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </form>
        
        {/* Destination Suggestions Dropdown - Using Backend Data */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 border border-gray-200"
          >
            {searchLoading ? (
              <div className="p-3 text-center">
                <div className="inline-block w-5 h-5 border-2 border-[#064473] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 mt-2">Searching destinations...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FiGlobe className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-medium text-gray-600">Travel Destinations</p>
                  </div>
                </div>
                {searchResults.map((destination) => (
                  <button
                    key={destination.id}
                    onClick={() => handleDestinationSelect(destination)}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{destination.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500">
                            {destination.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiNavigation className="w-3 h-3 text-[#064473]" />
                        <span className="text-xs text-[#064473] font-medium">Plan</span>
                      </div>
                    </div>
                  </button>
                ))}
                <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    Found {searchResults.length} destination{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No destinations found for "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">Try: Paris, Tokyo, New York, London, Lagos</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Quick Travel Filters - Placeholder until backend supports */}
      <div className="flex space-x-2 overflow-x-auto">
        {filterTabs.map((tab, index) => (
          <button
            key={index}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${
              index === 0 
                ? 'bg-[#064473] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => console.log(`Filter by: ${tab}`)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;