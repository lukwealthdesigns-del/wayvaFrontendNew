// components/Home/WeatherWidget.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiThermometer, FiWind, FiDroplet, FiGlobe, FiNavigation } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

// Open-Meteo WMO weather code mapping
const WMO_CODES = {
  0:  { label: 'Clear Sky',             condition: 'clear'   },
  1:  { label: 'Mainly Clear',          condition: 'clear'   },
  2:  { label: 'Partly Cloudy',         condition: 'cloud'   },
  3:  { label: 'Overcast',             condition: 'cloud'   },
  45: { label: 'Foggy',                condition: 'fog'     },
  48: { label: 'Icy Fog',              condition: 'fog'     },
  51: { label: 'Light Drizzle',        condition: 'drizzle' },
  53: { label: 'Drizzle',             condition: 'drizzle' },
  55: { label: 'Heavy Drizzle',        condition: 'drizzle' },
  61: { label: 'Light Rain',           condition: 'rain'    },
  63: { label: 'Rain',                 condition: 'rain'    },
  65: { label: 'Heavy Rain',           condition: 'rain'    },
  71: { label: 'Light Snow',           condition: 'snow'    },
  73: { label: 'Snow',                 condition: 'snow'    },
  75: { label: 'Heavy Snow',           condition: 'snow'    },
  80: { label: 'Light Showers',        condition: 'rain'    },
  81: { label: 'Showers',             condition: 'rain'    },
  82: { label: 'Heavy Showers',        condition: 'rain'    },
  95: { label: 'Thunderstorm',         condition: 'thunder' },
  96: { label: 'Thunderstorm w/ Hail', condition: 'thunder' },
  99: { label: 'Severe Thunderstorm',  condition: 'thunder' },
};

const getConditionFromCode = (code) => WMO_CODES[code] || { label: 'Unknown', condition: 'cloud' };

const WeatherWidget = ({ userLocation, onDestinationSelect }) => {
  const { user } = useAuth();
  const filterTabs = ['All', 'Popular', 'Recommended', 'Most Viewed'];

  // Weather states
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing]   = useState(false);

  // Search states
  const [placeholder, setPlaceholder]         = useState('');
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [searchError, setSearchError]         = useState(null);

  // Refs
  const searchRef      = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef    = useRef(null);

  const firstName = user?.first_name || '';
  const greeting  = firstName
    ? `Hello ${firstName}, where would you like to go?`
    : 'Where would you like to go today?';

  // Typing effect
  useEffect(() => {
    let i = 0;
    const typeWriter = () => {
      if (i < greeting.length) {
        setPlaceholder(greeting.substring(0, i + 1));
        i++;
        setTimeout(typeWriter, 50);
      }
    };
    const timer = setTimeout(typeWriter, 300);
    return () => clearTimeout(timer);
  }, [greeting]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        suggestionsRef.current && !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch weather from Open-Meteo — no API key needed
  const fetchWeatherData = useCallback(async (location = userLocation, forceRefresh = false) => {
    if (!location?.coordinates) {
      setLoading(false);
      setError('Waiting for location...');
      return;
    }
    forceRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const { lat, lon } = location.coordinates;
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&wind_speed_unit=kmh&timezone=auto`
      );
      if (!response.ok) throw new Error(`Weather API Error: ${response.status}`);
      const data = await response.json();
      const c = data.current;
      setWeatherData({
        temp:        c.temperature_2m,
        feelsLike:   c.apparent_temperature,
        humidity:    c.relative_humidity_2m,
        windSpeed:   c.wind_speed_10m,
        weatherCode: c.weather_code,
        locationName: location.displayName || location.city || 'Your Location',
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Could not fetch weather.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userLocation]);

  // Fetch on location change + auto-refresh every 10 mins
  useEffect(() => {
    fetchWeatherData(userLocation);
    const intervalId = setInterval(() => fetchWeatherData(userLocation), 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [userLocation]);

  // Live search using Nominatim — no API key, no registration
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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      if (data.length > 0) {
        const formatted = data.map((place, i) => {
          const addr    = place.address || {};
          const city    = addr.city || addr.town || addr.village || addr.municipality || place.name;
          const state   = addr.state || addr.county || '';
          const country = addr.country || '';
          return {
            id:          place.place_id || `place-${i}`,
            name:        city,
            state,
            country,
            lat:         parseFloat(place.lat),
            lon:         parseFloat(place.lon),
            displayName: [city, state, country].filter(Boolean).join(', '),
          };
        });
        const seen   = new Set();
        const unique = formatted.filter((item) => {
          if (seen.has(item.displayName)) return false;
          seen.add(item.displayName);
          return true;
        });
        setSearchResults(unique);
      } else {
        setSearchResults([]);
        setSearchError('No destinations found. Try a different search.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Search unavailable. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => searchDestinations(query), 400);
      setShowSuggestions(true);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
      setSearchError(null);
    }
  };

  // On click — call parent handler (HomePage handles the navigate)
  const handleDestinationSelect = (destination) => {
    setSearchQuery(destination.displayName);
    setShowSuggestions(false);
    setSearchResults([]);
    setSearchError(null);
    if (onDestinationSelect) {
      onDestinationSelect(destination);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleDestinationSelect(searchResults[0]);
    } else if (searchQuery.trim().length >= 2) {
      searchDestinations(searchQuery);
    }
  };

  // Weather Icon SVG renderer
  const getWeatherIcon = () => {
    if (refreshing) {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    const code = weatherData?.weatherCode ?? 0;
    const { condition } = getConditionFromCode(code);
    const isDay = new Date().getHours() >= 6 && new Date().getHours() < 20;

    if (condition === 'clear') {
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="10" fill="#FDB022" />
          {isDay && [0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return <line key={i} x1={24 + 13 * Math.cos(rad)} y1={24 + 13 * Math.sin(rad)} x2={24 + 17 * Math.cos(rad)} y2={24 + 17 * Math.sin(rad)} stroke="#FDB022" strokeWidth="2" strokeLinecap="round" />;
          })}
        </svg>
      );
    }
    if (condition === 'rain' || condition === 'drizzle') {
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <ellipse cx="28" cy="22" rx="13" ry="8" fill="#94A3B8" opacity="0.95" />
          <ellipse cx="36" cy="24" rx="10" ry="7" fill="#94A3B8" opacity="0.9" />
          <ellipse cx="22" cy="24" rx="9"  ry="6" fill="#94A3B8" opacity="0.85" />
          <line x1="22" y1="32" x2="20" y2="40" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="34" x2="26" y2="42" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="32" x2="32" y2="40" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (condition === 'snow') {
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <ellipse cx="28" cy="22" rx="13" ry="8" fill="#E2E8F0" opacity="0.95" />
          <ellipse cx="36" cy="24" rx="10" ry="7" fill="#E2E8F0" opacity="0.9" />
          <ellipse cx="22" cy="24" rx="9"  ry="6" fill="#E2E8F0" opacity="0.85" />
          {[22, 28, 34].map((x, i) => <circle key={i} cx={x} cy={36 + i * 2} r="2" fill="white" />)}
        </svg>
      );
    }
    if (condition === 'thunder') {
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <ellipse cx="28" cy="20" rx="13" ry="8" fill="#475569" opacity="0.95" />
          <ellipse cx="36" cy="22" rx="10" ry="7" fill="#475569" opacity="0.9" />
          <ellipse cx="22" cy="22" rx="9"  ry="6" fill="#475569" opacity="0.85" />
          <polyline points="28,28 24,36 28,36 24,44" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    }
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <ellipse cx="28" cy="22" rx="13" ry="8" fill="white" opacity="0.95" />
        <ellipse cx="36" cy="24" rx="10" ry="7" fill="white" opacity="0.9" />
        <ellipse cx="22" cy="24" rx="9"  ry="6" fill="white" opacity="0.85" />
        {isDay && <circle cx="10" cy="14" r="6" fill="#FDB022" opacity="0.6" />}
      </svg>
    );
  };

  const formatTemp      = (temp) => (temp !== undefined && temp !== null ? `${Math.round(temp)}°` : '--°');
  const getWeatherLabel = () => {
    if (loading)               return 'Detecting weather...';
    if (error && !weatherData) return 'Weather unavailable';
    if (!weatherData)          return '...';
    return getConditionFromCode(weatherData.weatherCode).label;
  };

  return (
    <div className="bg-[#60AAE2] rounded-2xl p-4 mb-5 shadow-sm">
      {/* Weather Section */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            {loading && !weatherData ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm">Detecting weather...</p>
              </div>
            ) : (
              <>
                <p className="text-4xl font-bold text-white">{formatTemp(weatherData?.temp)}</p>
                <p className="text-sm text-white mt-1">{getWeatherLabel()}</p>
                {lastUpdated && (
                  <p className="text-[10px] text-white/70 mt-1">
                    Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="mb-1">{getWeatherIcon()}</div>
            <div className="flex flex-col items-end space-y-1">
              <div className="flex items-center gap-1">
                <FiDroplet className="w-3 h-3 text-white" />
                <p className="text-xs text-white">{weatherData?.humidity ?? '--'}%</p>
              </div>
              <div className="flex items-center gap-1">
                <FiThermometer className="w-3 h-3 text-white" />
                <p className="text-xs text-white">Feels {formatTemp(weatherData?.feelsLike)}</p>
              </div>
              <div className="flex items-center gap-1">
                <FiWind className="w-3 h-3 text-white" />
                <p className="text-xs text-white">{weatherData?.windSpeed ?? '--'} km/h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative" ref={searchRef}>
        {searchError && (
          <div className="mb-2 p-2 rounded-lg text-xs bg-red-500/20 text-red-100">
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
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <FiSearch className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </form>

        {/* Live Suggestions Dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 border border-gray-200"
          >
            {searchLoading ? (
              <div className="p-3 text-center">
                <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500 mt-2">Searching destinations...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                  <FiGlobe className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-medium text-gray-600">Travel Destinations</p>
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
                        <p className="text-xs text-gray-500">
                          {destination.state && `${destination.state}, `}{destination.country}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiNavigation className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-500 font-medium">Plan</span>
                      </div>
                    </div>
                  </button>
                ))}
                <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    {searchResults.length} destination{searchResults.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            ) : searchQuery.length >= 2 && !searchLoading ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No destinations found for "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">Try: Paris, Tokyo, New York, London</p>
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
            onClick={() => console.log(`Filter: ${tab}`)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;