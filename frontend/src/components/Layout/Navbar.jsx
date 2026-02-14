// components/Layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiMapPin, FiWifiOff, FiNavigation } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onLocationDetected, location: propLocation }) => {
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

  // Use propLocation if provided, otherwise detect automatically
  useEffect(() => {
    if (propLocation && propLocation !== "Detecting location...") {
      setUserLocation(propLocation);
      setLoadingLocation(false);
    } else {
      detectLocation();
    }
  }, [propLocation]);

  // **FIXED: Automatic location detection without asking**
  const detectLocation = async () => {
    setLoadingLocation(true);
    setLocationError(false);
    
    try {
      // **METHOD 1: Try to get location from localStorage first (fast)**
      const savedLocation = localStorage.getItem('wayva_user_location');
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          if (parsedLocation.displayName && parsedLocation.coordinates) {
            console.log('Using saved location from localStorage:', parsedLocation.displayName);
            setUserLocation(parsedLocation.displayName);
            setCoordinates(parsedLocation.coordinates);
            
            if (onLocationDetected) {
              onLocationDetected(parsedLocation);
            }
            
            setLoadingLocation(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing saved location:', e);
        }
      }

      // **METHOD 2: Try IP-based location (works without permission)**
      console.log('Attempting IP-based location detection...');
      const ipLocation = await getLocationByIP();
      
      if (ipLocation.success) {
        console.log('IP location successful:', ipLocation.data.displayName);
        handleLocationSuccess(ipLocation.data);
      } else {
        // **METHOD 3: Try browser geolocation with timeout**
        console.log('Trying browser geolocation...');
        await tryBrowserGeolocation();
      }
      
    } catch (error) {
      console.error('Location detection failed:', error);
      setUserLocation("Location unavailable");
      setLocationError(true);
      setLoadingLocation(false);
    }
  };

  // Get location by IP (no permission needed)
  const getLocationByIP = async () => {
    try {
      // Try ipapi.co first
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        
        const locationData = {
          displayName: `${data.city || 'Unknown'}, ${data.region || data.country_name || ''}`,
          city: data.city,
          country: data.country_name,
          coordinates: { lat: data.latitude, lon: data.longitude },
          source: 'ipapi'
        };
        
        return { success: true, data: locationData };
      }
    } catch (error) {
      console.log('ipapi.co failed, trying ipinfo.io...');
    }
    
    try {
      // Fallback to ipinfo.io
      const response = await fetch('https://ipinfo.io/json?token=test');
      if (response.ok) {
        const data = await response.json();
        const [lat, lon] = data.loc ? data.loc.split(',').map(Number) : [0, 0];
        
        const locationData = {
          displayName: `${data.city || 'Unknown'}, ${data.region || data.country || ''}`,
          city: data.city,
          country: data.country,
          coordinates: { lat, lon },
          source: 'ipinfo'
        };
        
        return { success: true, data: locationData };
      }
    } catch (error) {
      console.log('ipinfo.io also failed');
    }
    
    return { success: false, error: 'IP location services failed' };
  };

  // Try browser geolocation with better error handling
  const tryBrowserGeolocation = () => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        console.log('Geolocation not supported by browser');
        resolve(false);
        return;
      }
      
      const options = {
        enableHighAccuracy: false, // Set to false for faster response
        timeout: 8000, // Shorter timeout
        maximumAge: 300000 // 5 minutes cache
      };
      
      const successCallback = async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('Browser geolocation successful:', { latitude, longitude });
          
          const locationData = await reverseGeocode(latitude, longitude);
          const fullLocationData = {
            ...locationData,
            coordinates: { lat: latitude, lon: longitude },
            source: 'browser_geolocation'
          };
          
          handleLocationSuccess(fullLocationData);
          resolve(true);
          
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          // Still use coordinates even if reverse geocoding fails
          const { latitude, longitude } = position.coords;
          const locationData = {
            displayName: `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
            coordinates: { lat: latitude, lon: longitude },
            source: 'browser_coords_only'
          };
          
          handleLocationSuccess(locationData);
          resolve(true);
        }
      };
      
      const errorCallback = (error) => {
        console.warn('Browser geolocation error:', error.code, error.message);
        
        // Provide fallback based on error
        let fallbackName = "Location unavailable";
        if (error.code === error.PERMISSION_DENIED) {
          fallbackName = "Location permission denied";
        } else if (error.code === error.TIMEOUT) {
          fallbackName = "Location timeout";
        }
        
        setUserLocation(fallbackName);
        setLocationError(true);
        setLoadingLocation(false);
        resolve(false);
      };
      
      // Use getCurrentPosition with options
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    });
  };

  // Handle successful location detection
  const handleLocationSuccess = (locationData) => {
    console.log('Location success:', locationData.displayName);
    
    setUserLocation(locationData.displayName);
    setCoordinates(locationData.coordinates);
    setLocationError(false);
    
    // Save to localStorage for future use
    localStorage.setItem('wayva_user_location', JSON.stringify(locationData));
    
    // Call the callback with full location data
    if (onLocationDetected) {
      onLocationDetected(locationData);
    }
    
    setLoadingLocation(false);
  };

  // Enhanced reverse geocoding with fallback
  const reverseGeocode = async (lat, lon) => {
    try {
      // Try OpenStreetMap Nominatim first
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.address) {
          const { city, town, village, municipality, state, country } = data.address;
          const locationName = city || town || village || municipality || 'Unknown';
          const displayName = `${locationName}${state ? `, ${state}` : ''}${country ? `, ${country}` : ''}`;
          
          return {
            displayName,
            city: locationName,
            state: state,
            country: country,
            fullAddress: data.address
          };
        }
      }
    } catch (error) {
      console.log('OpenStreetMap geocoding failed, trying fallback...');
    }
    
    // Fallback: Use coordinates directly
    return {
      displayName: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      city: null,
      state: null,
      country: null
    };
  };

  // Profile picture handling
  useEffect(() => {
    if (user?.profile_picture) {
      const picUrl = user.profile_picture.startsWith('http') 
        ? user.profile_picture 
        : `http://localhost:8000${user.profile_picture}`;
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
    console.log('Refreshing location...');
    detectLocation();
  };

  // Handle profile picture click
  const handleProfileClick = () => {
    navigate('/settings/personal-info');
  };

  return (
    <nav className={`sticky top-0 z-50 px-4 py-4 transition-all duration-300 ${
      isScrolled ? 'bg-sky-100/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left: Dynamic Profile Avatar - CLICKABLE */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleProfileClick}
            className="focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full transition-transform hover:scale-105 active:scale-95"
            aria-label="Go to profile settings"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
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
          </button>
          {/* Welcome text on desktop */}
          <div className="hidden md:block">
            <p className="text-xs text-gray-600">Welcome back,</p>
            <p className="text-sm font-semibold text-gray-800">{getDisplayName()}</p>
          </div>
        </div>
        
        {/* Center: Location Info */}
        <div className="flex-1 max-w-xs mx-4">
          <div className="text-center">
            <p className="text-[10px] text-gray-600 font-medium tracking-wide">My Location</p>
            <div className="flex items-center justify-center gap-1.5">
              <button 
                onClick={refreshLocation}
                className="p-1 rounded-full hover:bg-gray-100 transition"
                title="Refresh location"
              >
                {loadingLocation ? (
                  <div className="w-3 h-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mx-auto"></div>
                  </div>
                ) : (
                  <FiMapPin className={`w-3 h-3 flex-shrink-0 ${
                    locationError ? 'text-red-400' : 'text-gray-500'
                  } hover:scale-110 transition-transform`} />
                )}
              </button>
              <div className="min-h-[20px] flex items-center justify-center">
                {loadingLocation ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">Detecting...</span>
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                ) : (
                  <p className={`text-xs font-semibold truncate max-w-[180px] ${
                    locationError ? 'text-red-500' : 'text-gray-800'
                  }`}>
                    {locationError && <FiWifiOff className="inline mr-1 w-3 h-3" />}
                    {userLocation}
                    {coordinates && !locationError && (
                      <FiNavigation className="inline ml-1 w-2.5 h-2.5 text-green-500" />
                    )}
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

export default Navbar;