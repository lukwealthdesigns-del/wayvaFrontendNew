import React, { useState, useEffect } from 'react';
import { FiCloud } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { destinationsAPI } from '../api/destinations';
import Navbar from '../components/Layout/Navbar';
import WeatherWidget from '../components/Home/WeatherWidget';
import ActivityFilter from '../components/Home/ActivityFilter';
import DestinationGrid from '../components/Home/DestinationGrid';
import BottomNav from '../components/Layout/BottomNav';
import FloatingActionButton from '../components/Shared/FloatingActionButton';

const HomePage = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Fetch popular destinations on mount
  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        const response = await destinationsAPI.getPopularDestinations(false, 10);
        setPopularDestinations(response.data);
      } catch (error) {
        console.error('Failed to fetch popular destinations:', error);
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  // Function to update location from Navbar
  const handleLocationDetected = async (locationData) => {
    setUserLocation(locationData);
    
    // Extract location name for display in Navbar
    if (locationData && typeof locationData === 'object') {
      if (locationData.city) {
        setLocationName(`${locationData.city}, ${locationData.country || ''}`);
      } else if (locationData.displayName) {
        setLocationName(locationData.displayName);
      } else if (locationData.name) {
        setLocationName(locationData.name);
      }
    } else if (typeof locationData === 'string') {
      setLocationName(locationData);
    }

    // Save to localStorage
    if (locationData) {
      localStorage.setItem('wayva_user_location', JSON.stringify(locationData));
    }
  };

  // Get location from localStorage on initial load (if available)
  useEffect(() => {
    const savedLocation = localStorage.getItem('wayva_user_location');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setUserLocation(parsedLocation);
        if (parsedLocation.displayName) {
          setLocationName(parsedLocation.displayName);
        } else if (parsedLocation.city) {
          setLocationName(`${parsedLocation.city}, ${parsedLocation.country || ''}`);
        }
      } catch (e) {
        console.error('Error parsing saved location:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Sky Background - Gradient stops at ActivityFilter */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-sky-400 via-sky-100 to-transparent z-0"></div>
      
      {/* Realistic Cloud 1 - Large fluffy cloud */}
      <div className="absolute top-24 left-8 z-0">
        <div className="relative">
          {/* Main cloud body with shadow and blur */}
          <div className="absolute w-24 h-16 bg-white rounded-full shadow-lg shadow-sky-200/50 blur-sm"></div>
          {/* Cloud puff 1 */}
          <div className="absolute -top-2 -left-2 w-14 h-14 bg-white rounded-full shadow-lg shadow-sky-200/40 blur-sm"></div>
          {/* Cloud puff 2 */}
          <div className="absolute -top-1 right-2 w-16 h-16 bg-white rounded-full shadow-lg shadow-sky-200/30 blur-sm"></div>
          {/* Cloud puff 3 */}
          <div className="absolute top-6 -left-4 w-12 h-12 bg-white rounded-full shadow-lg shadow-sky-200/20 blur-sm"></div>
          {/* Cloud icon overlay */}
          <FiCloud className="relative w-20 h-20 text-white/90 drop-shadow-lg" />
        </div>
      </div>
      
      {/* Realistic Cloud 2 - Medium cloud */}
      <div className="absolute top-21 right-12 z-0">
        <div className="relative">
          <div className="absolute w-20 h-14 bg-white rounded-full shadow-lg shadow-sky-200/40 blur-sm"></div>
          <div className="absolute -top-1 -left-3 w-12 h-12 bg-white rounded-full shadow-lg shadow-sky-200/30 blur-sm"></div>
          <div className="absolute top-4 right-0 w-14 h-14 bg-white rounded-full shadow-lg shadow-sky-200/20 blur-sm"></div>
          <FiCloud className="relative w-16 h-16 text-white/90 drop-shadow-lg" />
        </div>
      </div>
      
      {/* Realistic Cloud 3 - Small cloud */}
      <div className="absolute top-40 left-1/3 z-0">
        <div className="relative">
          <div className="absolute w-16 h-12 bg-white rounded-full shadow-lg shadow-sky-200/50 blur-sm"></div>
          <div className="absolute -top-1 left-2 w-10 h-10 bg-white rounded-full shadow-lg shadow-sky-200/40 blur-sm"></div>
          <div className="absolute top-3 -right-2 w-8 h-8 bg-white rounded-full shadow-lg shadow-sky-200/30 blur-sm"></div>
          <FiCloud className="relative w-12 h-12 text-white/90 drop-shadow-lg" />
        </div>
      </div>
      
      {/* Realistic Cloud 4 - Floating cloud */}
      <div className="absolute top-28 right-1/4 z-0">
        <div className="relative">
          <div className="absolute w-18 h-13 bg-white rounded-full shadow-lg shadow-sky-200/40 blur-sm"></div>
          <div className="absolute top-1 -left-2 w-11 h-11 bg-white rounded-full shadow-lg shadow-sky-200/30 blur-sm"></div>
          <div className="absolute top-5 right-1 w-9 h-9 bg-white rounded-full shadow-lg shadow-sky-200/20 blur-sm"></div>
          <FiCloud className="relative w-14 h-14 text-white/90 drop-shadow-lg" />
        </div>
      </div>
      
      {/* Simple small cloud 5 - using just icon with effects */}
      <div className="absolute top-52 left-3/4 z-0">
        <div className="relative">
          <div className="absolute w-14 h-10 bg-white/80 rounded-full blur-sm"></div>
          <FiCloud className="relative w-10 h-10 text-white drop-shadow-lg" />
        </div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Update Navbar to pass location data */}
        <Navbar 
          onLocationDetected={handleLocationDetected}
          location={locationName}
          user={user}
        />
        
        <main className="px-4 pt-4">
          <div className="max-w-2xl mx-auto">
            {/* Welcome Message for Logged-in User */}
            {/* {user && (
              <div className="mb-4 px-4 py-3 bg-blue-50 rounded-xl">
                <h2 className="text-lg font-semibold text-[#064473]">
                  Welcome back, {user.first_name}! 👋
                </h2>
                <p className="text-sm text-gray-600">
                  Ready to plan your next adventure?
                </p>
              </div>
            )} */}
            
            {/* Pass userLocation to WeatherWidget */}
            <WeatherWidget 
              userLocation={userLocation} 
              coordinates={userLocation?.coordinates}
            />
            
            <ActivityFilter />
            
            {/* White background starts from DestinationGrid */}
            <div className="bg-white rounded-2xl -mx-4 px-4 py-0 mt-6">
              {/* <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Popular Destinations</h2>
                <button 
                  onClick={() => navigate('/discover')}
                  className="text-sm text-[#064473] font-medium hover:underline"
                >
                  View All
                </button>
              </div> */}
              <DestinationGrid 
                destinations={popularDestinations}
                loading={loadingDestinations}
              />
            </div>
          </div>
        </main>
        
        <BottomNav />
        
        {/* Floating Action Button */}
        <FloatingActionButton />
      </div>
    </div>
  );
};

export default HomePage;