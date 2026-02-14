// components/Layout/Navbar.jsx - Backend Integration
import React, { useState, useEffect } from 'react';
import { FiBell, FiMapPin, FiWifiOff, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { destinationsAPI } from '../../api/destinations';
import { useNavigate } from 'react-router-dom';

const LocationChecker = ({ onLocationDetected, location: propLocation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userLocation, setUserLocation] = useState("Detecting location...");
  const [locationError, setLocationError] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [profilePic, setProfilePic] = useState('');
  const [profilePicError, setProfilePicError] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use propLocation if provided, otherwise detect
  useEffect(() => {
    if (propLocation) {
      setUserLocation(propLocation);
      setLoadingLocation(false);
    } else {
      detectLocation();
    }
  }, [propLocation]);

  // Location detection with backend geocoding
  const detectLocation = async () => {
    setLoadingLocation(true);
    
    // Method 1: Try browser geolocation first
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setCoordinates({ lat: latitude, lon: longitude });
            
            const locationData = await reverseGeocode(latitude, longitude);
            const locationName = locationData.displayName;
            
            setUserLocation(locationName);
            setLocationError(false);
            
            // Call the callback with full location data
            if (onLocationDetected) {
              onLocationDetected({
                ...locationData,
                coordinates: { lat: latitude, lon: longitude }
              });
            }
            
          } catch (error) {
            console.error("Geocoding error:", error);
            fallbackToIPLocation();
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.warn("Geolocation permission denied or error:", error);
          fallbackToIPLocation();
          setLoadingLocation(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000,
          maximumAge: 60000 
        }
      );
    } else {
      fallbackToIPLocation();
      setLoadingLocation(false);
    }
  };

  // Enhanced reverse geocoding using backend
  const reverseGeocode = async (lat, lon) => {
    try {
      // Try backend geocoding first
      const response = await destinationsAPI.reverseGeocode(lat, lon);
      
      if (response.data) {
        return {
          displayName: response.data.address || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          city: response.data.city,
          state: response.data.state,
          country: response.data.country,
          countryCode: response.data.country_code,
          fullAddress: response.data
        };
      }
    } catch (error) {
      console.error("Backend reverse geocoding failed:", error);
    }
    
    // Fallback to OpenStreetMap
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
      );
      const data = await response.json();
      
      if (data.address) {
        const { city, town, village, state, country } = data.address;
        const locationParts = [
          city || town || village,
          state,
          country
        ].filter(Boolean);
        
        const displayName = locationParts.join(', ') || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        
        return {
          displayName,
          city: city || town || village,
          state: state,
          country: country,
          countryCode: data.address.country_code?.toUpperCase(),
          fullAddress: data.address
        };
      }
    } catch (error) {
      console.error("OSM reverse geocoding failed:", error);
    }
    
    // Ultimate fallback
    return {
      displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      city: null,
      state: null,
      country: null
    };
  };

  // Fallback to IP-based location
  const fallbackToIPLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const locationName = data.city 
        ? `${data.city}${data.region ? `, ${data.region}` : ''}${data.country_name ? `, ${data.country_name}` : ''}`
        : 'Unknown location';
      
      setUserLocation(locationName);
      setLocationError(false);
      
      // Call the callback with IP location data
      if (onLocationDetected) {
        onLocationDetected({
          displayName: locationName,
          city: data.city,
          state: data.region,
          country: data.country_name,
          countryCode: data.country_code,
          coordinates: data.latitude && data.longitude ? 
            { lat: data.latitude, lon: data.longitude } : null
        });
      }
      
    } catch (error) {
      console.error("IP location failed:", error);
      setUserLocation("Location unavailable");
      setLocationError(true);
      
      // Still call callback with error state
      if (onLocationDetected) {
        onLocationDetected({
          displayName: "Location unavailable",
          error: true
        });
      }
    }
  };

  // Profile picture handling - Cloudinary URLs from backend
  useEffect(() => {
    if (user?.profile_picture) {
      // Backend returns full Cloudinary URL
      const picUrl = user.profile_picture;
      setProfilePic(picUrl);
      setProfilePicError(false);
    } else {
      setProfilePic('');
      setProfilePicError(true);
    }
  }, [user]);

  // Generate user initials
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return "U";
  };

  // Get user display name
  const getDisplayName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    return "User";
  };

  // Refresh location manually
  const refreshLocation = () => {
    if (!propLocation) {
      detectLocation();
    }
  };

  // Navigate to profile
  const navigateToProfile = () => {
    navigate('/settings/personal-info');
  };

  return (
    <nav className={`sticky top-0 z-50 px-4 py-4 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left: Dynamic Profile Avatar */}
        <button 
          onClick={navigateToProfile}
          className="flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-r from-[#064473] to-[#0a5c9c] flex items-center justify-center group-hover:opacity-90 transition">
            {profilePic && !profilePicError ? (
              <img 
                src={profilePic} 
                alt={`${getDisplayName()}'s profile`}
                className="w-full h-full object-cover"
                onError={() => setProfilePicError(true)}
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {getUserInitials()}
              </span>
            )}
          </div>
          {/* Welcome text on desktop */}
          <div className="hidden md:block text-left">
            <p className="text-xs text-gray-600">Welcome back,</p>
            <p className="text-sm font-semibold text-gray-800">{getDisplayName()}</p>
          </div>
        </button>
        
        {/* Center: Location Info */}
        <div className="flex-1 max-w-xs mx-4">
          <div className="text-center">
            <p className="text-[10px] text-gray-600 font-medium tracking-wide">My Location</p>
            <div className="flex items-center justify-center gap-1.5">
              <button 
                onClick={refreshLocation}
                className={`p-1 rounded-full hover:bg-gray-100 transition ${!propLocation ? 'cursor-pointer' : 'cursor-default'}`}
                disabled={!!propLocation}
                title={propLocation ? "Using provided location" : "Refresh location"}
              >
                <FiMapPin className={`w-3 h-3 flex-shrink-0 ${
                  locationError ? 'text-red-400' : 'text-[#064473]'
                } ${!propLocation && 'hover:scale-110 transition-transform'}`} />
              </button>
              <div className="min-h-[20px] flex items-center">
                {loadingLocation ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#064473] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#064473] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-[#064473] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                ) : (
                  <p className={`text-xs font-semibold truncate max-w-[150px] ${
                    locationError ? 'text-red-500' : 'text-gray-800'
                  }`}>
                    {locationError && <FiWifiOff className="inline mr-1 w-3 h-3" />}
                    {userLocation}
                    {propLocation && <span className="ml-1 text-[10px] text-gray-500">(provided)</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Notification Icon */}
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full bg-white hover:bg-gray-50 transition shadow-sm relative group"
            aria-label="Notifications"
            onClick={() => navigate('/notifications')}
          >
            <FiBell className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <p className="text-sm font-semibold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-500 mt-1">No new notifications</p>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LocationChecker;