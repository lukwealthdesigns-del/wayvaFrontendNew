// components/Home/WeatherWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiThermometer, FiWind, FiRefreshCw, FiMapPin, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const WeatherChecker = ({ userLocation }) => {
  const { user } = useAuth();
  const filterTabs = ['All', 'Popular', 'Recommended', 'Most Viewed'];
  
  // Weather states
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and location states
  const [placeholder, setPlaceholder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Refs
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Get user's first name
  const firstName = user?.first_name || '';
  const greeting = firstName ? `Hello ${firstName}, where would you like to go today?` : 'Where would you like to go today?';
  
  // API keys
  const WEATHER_API_KEY = 'c42c0e6f266b9c2ba34d4bb4951b21e8';
  const GEONAMES_USERNAME = 'wayva_travel'; // Free GeoNames username (you may need to register)
  
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

  // Fetch weather data based on location
  const fetchWeatherData = async (location = userLocation, forceRefresh = false) => {
    // Skip if no location data
    if (!location || !location.coordinates) {
      if (!forceRefresh && !selectedLocation) {
        setLoading(false);
        setError('Waiting for location...');
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
      const { lat, lon } = location.coordinates;
      const cityName = location.city || location.displayName;
      
      console.log('Fetching weather for:', { lat, lon, cityName });
      
      // Fetch weather data using coordinates
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`API Error: ${weatherResponse.status}`);
      }
      
      const data = await weatherResponse.json();
      setWeatherData(data);
      setLastUpdated(new Date());
      
      console.log('Weather data fetched successfully:', {
        temp: data.main.temp,
        condition: data.weather[0].main,
        location: data.name
      });
      
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(`Weather unavailable: ${err.message}`);
      
      // Fallback: Try to fetch by city name
      if (location.city || location.displayName) {
        try {
          const city = location.city || location.displayName.split(',')[0];
          const fallbackResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`
          );
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setWeatherData(fallbackData);
            setLastUpdated(new Date());
            setError(null);
            console.log('Used fallback city-based weather');
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch error:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch weather when location changes
  useEffect(() => {
    if (selectedLocation) {
      fetchWeatherData(selectedLocation);
    } else {
      fetchWeatherData(userLocation);
    }
    
    // Refresh weather every 10 minutes
    const intervalId = setInterval(() => {
      if (selectedLocation) {
        fetchWeatherData(selectedLocation);
      } else {
        fetchWeatherData(userLocation);
      }
    }, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [userLocation, selectedLocation]);

  // Search for cities/countries
  const searchLocations = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    
    setSearchLoading(true);
    setShowSuggestions(true);
    
    try {
      // Using GeoNames API for city search (free, no API key needed for small usage)
      const response = await fetch(
        `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=10&username=${GEONAMES_USERNAME}&featureClass=P&featureClass=A`
      );
      
      if (!response.ok) {
        throw new Error('Search service unavailable');
      }
      
      const data = await response.json();
      
      if (data.geonames && data.geonames.length > 0) {
        const formattedResults = data.geonames.map(place => ({
          name: place.name,
          country: place.countryName,
          adminName: place.adminName1 || place.adminName2 || '',
          lat: place.lat,
          lng: place.lng,
          population: place.population,
          displayName: `${place.name}, ${place.countryName}${place.adminName1 ? `, ${place.adminName1}` : ''}`
        }));
        
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Location search error:', err);
      // Fallback: Use OpenWeatherMap geocoding
      try {
        const fallbackResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=10&appid=${WEATHER_API_KEY}`
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const formattedResults = fallbackData.map(place => ({
            name: place.name,
            country: place.country,
            adminName: place.state || '',
            lat: place.lat,
            lng: place.lon,
            displayName: `${place.name}, ${place.country}${place.state ? `, ${place.state}` : ''}`
          }));
          
          setSearchResults(formattedResults);
        }
      } catch (fallbackErr) {
        console.error('Fallback search error:', fallbackErr);
        setSearchResults([]);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      searchLocations(query);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  // Handle location selection from suggestions
  const handleLocationSelect = (location) => {
    setSelectedLocation({
      displayName: location.displayName,
      city: location.name,
      country: location.country,
      coordinates: { lat: parseFloat(location.lat), lon: parseFloat(location.lng) }
    });
    
    setSearchQuery(location.displayName);
    setShowSuggestions(false);
    setSearchResults([]);
  };

  // Clear selected location and revert to current location
  const clearSelectedLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  // Manual refresh
  const handleRefresh = () => {
    if (selectedLocation) {
      fetchWeatherData(selectedLocation, true);
    } else {
      fetchWeatherData(userLocation, true);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      handleLocationSelect(searchResults[0]);
    }
  };

  // Get weather icon based on conditions
  const getWeatherIcon = () => {
    if (!weatherData) {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="45" cy="32" rx="18" ry="12" fill="white" opacity="0.95"/>
          <ellipse cx="58" cy="35" rx="15" ry="11" fill="white" opacity="0.9"/>
          <ellipse cx="35" cy="35" rx="13" ry="10" fill="white" opacity="0.85"/>
        </svg>
      );
    }
    
    const condition = weatherData.weather[0].main.toLowerCase();
    const iconCode = weatherData.weather[0].icon;
    const isDay = iconCode.includes('d');
    
    // Return appropriate SVG based on weather condition
    if (condition.includes('clear')) {
      return (
        <svg className="absolute -top-2 right-0" width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="22.5" y1="2" x2="22.5" y2="8" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="37" y1="8" x2="33" y2="13" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="43" y1="22.5" x2="37" y2="22.5" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="37" y1="37" x2="33" y2="32" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="8" y1="8" x2="12" y2="13" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="2" y1="22.5" x2="8" y2="22.5" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="22.5" cy="22.5" r="11" fill="#FDB022"/>
        </svg>
      );
    } else if (condition.includes('cloud')) {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="45" cy="32" rx="18" ry="12" fill="white" opacity="0.95"/>
          <ellipse cx="58" cy="35" rx="15" ry="11" fill="white" opacity="0.9"/>
          <ellipse cx="35" cy="35" rx="13" ry="10" fill="white" opacity="0.85"/>
          {isDay && (
            <circle cx="65" cy="20" r="8" fill="#FDB022" opacity="0.7"/>
          )}
        </svg>
      );
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="45" cy="32" rx="18" ry="12" fill="#A0AEC0" opacity="0.95"/>
          <ellipse cx="58" cy="35" rx="15" ry="11" fill="#A0AEC0" opacity="0.9"/>
          <ellipse cx="35" cy="35" rx="13" ry="10" fill="#A0AEC0" opacity="0.85"/>
          <line x1="40" y1="42" x2="40" y2="48" stroke="#4299E1" strokeWidth="2" strokeLinecap="round"/>
          <line x1="50" y1="44" x2="50" y2="50" stroke="#4299E1" strokeWidth="2" strokeLinecap="round"/>
          <line x1="60" y1="43" x2="60" y2="49" stroke="#4299E1" strokeWidth="2" strokeLinecap="round"/>
          {isDay && <circle cx="20" cy="20" r="6" fill="#FDB022" opacity="0.5"/>}
        </svg>
      );
    } else if (condition.includes('snow')) {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="45" cy="32" rx="18" ry="12" fill="#E2E8F0" opacity="0.95"/>
          <ellipse cx="58" cy="35" rx="15" ry="11" fill="#E2E8F0" opacity="0.9"/>
          <ellipse cx="35" cy="35" rx="13" ry="10" fill="#E2E8F0" opacity="0.85"/>
          <circle cx="40" cy="45" r="1.5" fill="white"/>
          <circle cx="50" cy="43" r="1.5" fill="white"/>
          <circle cx="60" cy="46" r="1.5" fill="white"/>
          <circle cx="45" cy="48" r="1.5" fill="white"/>
        </svg>
      );
    } else {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="45" cy="32" rx="18" ry="12" fill="white" opacity="0.95"/>
          <ellipse cx="58" cy="35" rx="15" ry="11" fill="white" opacity="0.9"/>
          <ellipse cx="35" cy="35" rx="13" ry="10" fill="white" opacity="0.85"/>
        </svg>
      );
    }
  };

  // Format temperature
  const formatTemp = (temp) => {
    return temp ? `${Math.round(temp)}°` : '--°';
  };

  // Get weather description
  const getWeatherDescription = () => {
    if (!weatherData) return 'Loading...';
    return weatherData.weather[0].description
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Show loading/error states
  if (loading && !weatherData) {
    return (
      <div className="bg-[#60AAE2] rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-sm">Detecting location and weather...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#60AAE2] rounded-2xl p-4 mb-6 shadow-sm">
      {/* Weather Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <FiMapPin className="w-3.5 h-3.5 text-white/80" />
          <p className="text-[10px] text-white/80 font-medium">
            {selectedLocation ? selectedLocation.displayName : (userLocation?.displayName || 'Current Location')}
          </p>
          {selectedLocation && (
            <button
              onClick={clearSelectedLocation}
              className="text-[10px] text-white/60 hover:text-white ml-2"
              title="Return to current location"
            >
              (clear)
            </button>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition disabled:opacity-50"
          title="Refresh weather"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Weather Info */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-4xl font-bold text-white">
            {formatTemp(weatherData?.main?.temp)}
          </p>
          <p className="text-sm text-white mt-1 flex items-center gap-2">
            {getWeatherDescription()}
            {error && (
              <span className="text-xs bg-red-500/30 px-2 py-0.5 rounded">
                Limited data
              </span>
            )}
          </p>
          {lastUpdated && (
            <p className="text-[10px] text-white/70 mt-1">
              Updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          )}
        </div>
        
        {/* Dynamic Weather Icon */}
        <div className="relative">
          {getWeatherIcon()}
        </div>
      </div>
      
      {/* Additional weather info */}
      <div className="flex items-center justify-between text-xs text-white mb-4">
        <div className="flex items-center gap-1">
          <FiThermometer className="w-3 h-3" />
          <p>Feels like {formatTemp(weatherData?.main?.feels_like)}</p>
        </div>
        <div className="flex items-center gap-1">
          <FiWind className="w-3 h-3" />
          <p>Humidity: {weatherData?.main?.humidity || '--'}%</p>
        </div>
      </div>
      
      {/* Wind and Pressure info */}
      {weatherData?.wind && (
        <div className="flex items-center justify-between text-[11px] text-white/90 mb-4">
          <div className="flex items-center gap-1">
            <span className="rotate-45">⚡</span>
            <p>Wind: {Math.round(weatherData.wind.speed * 3.6)} km/h</p>
          </div>
          <div className="flex items-center gap-1">
            <span>🔄</span>
            <p>Pressure: {weatherData.main.pressure} hPa</p>
          </div>
        </div>
      )}
      
      {/* Search Bar with Autocomplete */}
      <div className="mb-4 relative" ref={searchRef}>
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
        
        {/* Search Suggestions Dropdown */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 border border-gray-200"
          >
            {searchLoading ? (
              <div className="p-3 text-center">
                <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 mt-2">Searching locations...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FiGlobe className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-medium text-gray-600">Search Results</p>
                  </div>
                </div>
                {searchResults.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{location.name}</p>
                        <p className="text-xs text-gray-500">
                          {location.adminName && `${location.adminName}, `}{location.country}
                          {location.population && (
                            <span className="ml-2 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                              {location.population > 1000000 
                                ? `${(location.population / 1000000).toFixed(1)}M` 
                                : location.population > 1000 
                                  ? `${(location.population / 1000).toFixed(0)}K` 
                                  : location.population}
                            </span>
                          )}
                        </p>
                      </div>
                      <FiMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No locations found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {filterTabs.map((tab, index) => (
          <button
            key={index}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${
              index === 0 
                ? 'bg-[#064473] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeatherChecker;