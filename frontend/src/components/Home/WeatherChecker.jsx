// components/Home/WeatherChecker.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiThermometer, FiWind, FiRefreshCw, FiMapPin, FiGlobe, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

// Open-Meteo WMO weather code mapping
const WMO_CODES = {
  0:  { label: 'Clear Sky',               condition: 'clear'   },
  1:  { label: 'Mainly Clear',            condition: 'clear'   },
  2:  { label: 'Partly Cloudy',           condition: 'cloud'   },
  3:  { label: 'Overcast',               condition: 'cloud'   },
  45: { label: 'Foggy',                  condition: 'fog'     },
  48: { label: 'Icy Fog',               condition: 'fog'     },
  51: { label: 'Light Drizzle',          condition: 'drizzle' },
  53: { label: 'Drizzle',               condition: 'drizzle' },
  55: { label: 'Heavy Drizzle',          condition: 'drizzle' },
  61: { label: 'Light Rain',             condition: 'rain'    },
  63: { label: 'Rain',                   condition: 'rain'    },
  65: { label: 'Heavy Rain',             condition: 'rain'    },
  71: { label: 'Light Snow',             condition: 'snow'    },
  73: { label: 'Snow',                   condition: 'snow'    },
  75: { label: 'Heavy Snow',             condition: 'snow'    },
  80: { label: 'Light Showers',          condition: 'rain'    },
  81: { label: 'Showers',               condition: 'rain'    },
  82: { label: 'Heavy Showers',          condition: 'rain'    },
  95: { label: 'Thunderstorm',           condition: 'thunder' },
  96: { label: 'Thunderstorm w/ Hail',   condition: 'thunder' },
  99: { label: 'Severe Thunderstorm',    condition: 'thunder' },
};

const getCondition = (code) => WMO_CODES[code] || { label: 'Unknown', condition: 'cloud' };

const WeatherChecker = ({ userLocation }) => {
  const { user } = useAuth();
  const filterTabs = ['All', 'Popular', 'Recommended', 'Most Viewed'];

  // Weather states
  const [weatherData, setWeatherData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [refreshing, setRefreshing]     = useState(false);

  // Search + location states
  const [placeholder, setPlaceholder]         = useState('');
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Refs
  const searchRef   = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  const firstName = user?.first_name || '';
  const greeting  = firstName
    ? `Hello ${firstName}, where would you like to go?`
    : 'Where would you like to go today?';

  // Typing animation
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

  // Click outside handler
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

  // Fetch weather from Open-Meteo — no API key, no registration
  const fetchWeatherData = useCallback(async (location, forceRefresh = false) => {
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
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code` +
        `&wind_speed_unit=kmh&timezone=auto`
      );

      if (!response.ok) throw new Error(`Open-Meteo Error: ${response.status}`);

      const data = await response.json();
      const c = data.current;

      setWeatherData({
        temp:        c.temperature_2m,
        feelsLike:   c.apparent_temperature,
        humidity:    c.relative_humidity_2m,
        windSpeed:   c.wind_speed_10m,
        pressure:    c.surface_pressure,
        weatherCode: c.weather_code,
        locationName: location.displayName || location.city || 'Your Location',
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Weather data unavailable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Re-fetch on location or selected location change
  useEffect(() => {
    const loc = selectedLocation || userLocation;
    fetchWeatherData(loc);

    const intervalId = setInterval(() => fetchWeatherData(selectedLocation || userLocation), 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [userLocation, selectedLocation, fetchWeatherData]);

  // Search cities using Nominatim (OpenStreetMap) — no API key, no registration
  const searchLocations = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    setShowSuggestions(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      if (!response.ok) throw new Error('Nominatim search failed');

      const data = await response.json();

      if (data.length > 0) {
        const formatted = data.map((place, i) => {
          const addr = place.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || place.name;
          const state = addr.state || addr.county || '';
          const country = addr.country || '';
          return {
            id: place.place_id || `place-${i}`,
            name: city,
            state,
            country,
            adminName: state,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            displayName: [city, state, country].filter(Boolean).join(', '),
          };
        });

        // Deduplicate
        const seen = new Set();
        const unique = formatted.filter((item) => {
          if (seen.has(item.displayName)) return false;
          seen.add(item.displayName);
          return true;
        });

        setSearchResults(unique);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Location search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => searchLocations(query), 400);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  // Select a location from dropdown
  const handleLocationSelect = (location) => {
    const newLoc = {
      displayName: location.displayName,
      city: location.name,
      country: location.country,
      coordinates: { lat: location.lat, lon: location.lng },
    };
    setSelectedLocation(newLoc);
    setSearchQuery(location.displayName);
    setShowSuggestions(false);
    setSearchResults([]);
  };

  // Clear selected location back to device location
  const clearSelectedLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const handleRefresh = () => fetchWeatherData(selectedLocation || userLocation, true);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      handleLocationSelect(searchResults[0]);
    } else if (searchQuery.trim().length >= 2) {
      searchLocations(searchQuery);
    }
  };

  // Weather icon renderer
  const getWeatherIcon = () => {
    const code = weatherData?.weatherCode ?? 0;
    const { condition } = getCondition(code);
    const isDay = new Date().getHours() >= 6 && new Date().getHours() < 20;

    if (condition === 'clear') {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
          <circle cx="40" cy="25" r="13" fill="#FDB022" />
          {isDay && [0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={40 + 16 * Math.cos(rad)} y1={25 + 16 * Math.sin(rad)}
                x2={40 + 21 * Math.cos(rad)} y2={25 + 21 * Math.sin(rad)}
                stroke="#FDB022" strokeWidth="2" strokeLinecap="round"
              />
            );
          })}
        </svg>
      );
    }

    if (condition === 'rain' || condition === 'drizzle') {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
          <ellipse cx="45" cy="28" rx="18" ry="11" fill="#94A3B8" opacity="0.95" />
          <ellipse cx="58" cy="30" rx="14" ry="10" fill="#94A3B8" opacity="0.9" />
          <ellipse cx="35" cy="30" rx="13" ry="9" fill="#94A3B8" opacity="0.85" />
          <line x1="36" y1="38" x2="34" y2="46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          <line x1="46" y1="40" x2="44" y2="48" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="38" x2="54" y2="46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          {isDay && <circle cx="18" cy="14" r="7" fill="#FDB022" opacity="0.5" />}
        </svg>
      );
    }

    if (condition === 'snow') {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
          <ellipse cx="45" cy="28" rx="18" ry="11" fill="#E2E8F0" opacity="0.95" />
          <ellipse cx="58" cy="30" rx="14" ry="10" fill="#E2E8F0" opacity="0.9" />
          <ellipse cx="35" cy="30" rx="13" ry="9" fill="#E2E8F0" opacity="0.85" />
          {[36, 46, 56].map((x, i) => (
            <circle key={i} cx={x} cy={42 + i} r="2" fill="white" />
          ))}
        </svg>
      );
    }

    if (condition === 'thunder') {
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
          <ellipse cx="45" cy="26" rx="18" ry="11" fill="#475569" opacity="0.95" />
          <ellipse cx="58" cy="28" rx="14" ry="10" fill="#475569" opacity="0.9" />
          <ellipse cx="35" cy="28" rx="13" ry="9" fill="#475569" opacity="0.85" />
          <polyline points="46,34 41,42 46,42 41,50" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    }

    // Cloudy / fog / default
    return (
      <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
        <ellipse cx="45" cy="30" rx="18" ry="12" fill="white" opacity="0.95" />
        <ellipse cx="58" cy="33" rx="15" ry="11" fill="white" opacity="0.9" />
        <ellipse cx="35" cy="33" rx="13" ry="10" fill="white" opacity="0.85" />
        {isDay && <circle cx="20" cy="18" r="8" fill="#FDB022" opacity="0.6" />}
      </svg>
    );
  };

  const formatTemp  = (t) => (t !== undefined && t !== null ? `${Math.round(t)}°` : '--°');
  const activeLocation = selectedLocation || userLocation;

  // Full loading state
  if (loading && !weatherData) {
    return (
      <div className="bg-[#60AAE2] rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white text-sm">Detecting location & weather...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#60AAE2] rounded-2xl p-4 mb-6 shadow-sm">
      {/* Location bar + Refresh */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FiMapPin className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
          <p className="text-[11px] text-white/90 font-medium truncate">
            {activeLocation?.displayName || 'Current Location'}
          </p>
          {selectedLocation && (
            <button
              onClick={clearSelectedLocation}
              className="flex-shrink-0 p-0.5 rounded-full bg-white/20 hover:bg-white/30 transition"
              title="Back to current location"
            >
              <FiX className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition disabled:opacity-50 ml-2"
          title="Refresh weather"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Weather Info */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-4xl font-bold text-white">{formatTemp(weatherData?.temp)}</p>
          <p className="text-sm text-white mt-1 flex items-center gap-2">
            {weatherData ? getCondition(weatherData.weatherCode).label : 'Loading...'}
            {error && (
              <span className="text-xs bg-red-500/30 px-2 py-0.5 rounded">Limited data</span>
            )}
          </p>
          {lastUpdated && (
            <p className="text-[10px] text-white/70 mt-1">
              Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className="relative">{getWeatherIcon()}</div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-white mb-3">
        <div className="flex items-center gap-1">
          <FiThermometer className="w-3 h-3" />
          <span>Feels like {formatTemp(weatherData?.feelsLike)}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiWind className="w-3 h-3" />
          <span>Humidity: {weatherData?.humidity ?? '--'}%</span>
        </div>
      </div>

      {/* Wind + Pressure */}
      {weatherData && (
        <div className="flex items-center justify-between text-[11px] text-white/90 mb-3">
          <span>💨 Wind: {weatherData.windSpeed} km/h</span>
          <span>🔵 Pressure: {Math.round(weatherData.pressure)} hPa</span>
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
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <FiSearch className="w-4 h-4 text-gray-400" />
            </div>
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={clearSelectedLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 border border-gray-200"
          >
            {searchLoading ? (
              <div className="p-3 text-center">
                <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500 mt-2">Searching locations...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                  <FiGlobe className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-medium text-gray-600">Search Results</p>
                </div>
                {searchResults.map((location, index) => (
                  <button
                    key={location.id || index}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{location.name}</p>
                        <p className="text-xs text-gray-500">
                          {location.adminName && `${location.adminName}, `}{location.country}
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