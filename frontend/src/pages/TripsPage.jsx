// pages/TripsPage.jsx (Updated with Backend Integration)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import TripTabs from '../components/Trips/TripTabs';
import TripList from '../components/Trips/TripList';
import { FiCompass, FiZap, FiMapPin, FiGlobe, FiChevronDown, FiX, FiClock, FiDollarSign, FiCalendar, FiCheck, FiNavigation, FiStar, FiUsers, FiInfo, FiMap, FiCoffee, FiCamera, FiActivity, FiSun, FiMoon, FiAlertCircle } from 'react-icons/fi';
import { tripsAPI } from '../api/trips';
import { aiAPI } from '../api/ai';
import { useAuth } from '../context/AuthContext';

const TripsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Active');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAPIError, setShowAPIError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiSearchStatus, setAiSearchStatus] = useState('initializing');
  const [userTrips, setUserTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  ];

  // Fetch user trips from backend
  useEffect(() => {
    fetchUserTrips();
  }, [activeTab]);

  const fetchUserTrips = async (page = 1) => {
    setTripsLoading(true);
    try {
      const status = activeTab === 'Active' ? 'active' : 
                     activeTab === 'Upcoming' ? 'planning' : 
                     'completed';
      
      const response = await tripsAPI.getUserTrips(status, page, 20);
      setUserTrips(response.data.trips);
      setPagination({
        page: response.data.page,
        total: response.data.total,
        totalPages: response.data.total_pages
      });
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      setErrorMessage('Failed to load your trips. Please try again.');
      setShowAPIError(true);
    } finally {
      setTripsLoading(false);
    }
  };

  // AI API call to find destinations by budget
  const findDestinationsByBudget = async (budgetAmount, currencyCode, preferredCity, preferredCountry) => {
    try {
      const requestData = {
        budget_amount: parseFloat(budgetAmount),
        currency: currencyCode,
        travel_interests: ['budget_travel', 'cultural_exploration'],
        trip_duration_days: 7,
        trip_type: 'tourism'
      };

      // Add optional location filters
      if (preferredCity) {
        requestData.city = preferredCity;
      }
      if (preferredCountry) {
        requestData.country = preferredCountry;
      }

      const response = await aiAPI.findDestinations(requestData);
      
      if (response.data && response.data.suggestions) {
        return {
          success: true,
          isMock: false,
          destinations: formatAIDestinations(response.data.suggestions, budgetAmount, currencyCode)
        };
      } else {
        throw new Error('No destinations found');
      }
    } catch (error) {
      console.error('AI Budget Finder Error:', error);
      return {
        success: false,
        isMock: true,
        destinations: []
      };
    }
  };

  // Format AI response to match our UI structure
  const formatAIDestinations = (aiDestinations, budgetAmount, currencyCode) => {
    if (!aiDestinations || !Array.isArray(aiDestinations)) {
      return [];
    }

    return aiDestinations.map((destination, index) => ({
      id: index + 1,
      city: destination.destination?.split(',')[0] || destination.city || 'Destination',
      country: destination.country || 'Country',
      flag: getFlagEmoji(destination.country),
      image: getDestinationImage(destination.destination, destination.country),
      budgetRange: `${currencyCode} ${destination.estimated_cost_range?.min?.toLocaleString() || (budgetAmount * 0.7).toLocaleString()} - ${currencyCode} ${destination.estimated_cost_range?.max?.toLocaleString() || (budgetAmount * 1.2).toLocaleString()}`,
      days: destination.recommended_stay || '5-10 days',
      matchScore: Math.round((destination.match_score || 0.7) * 100),
      highlights: destination.best_for?.slice(0, 3) || ['Local Culture', 'Affordable Dining', 'Unique Experiences'],
      visaInfo: destination.visa_info || 'Check visa requirements for your passport',
      isAI: true,
      isMock: false,
      estimated_cost_range: destination.estimated_cost_range,
      best_time_to_visit: destination.best_time_to_visit,
      explanation: destination.explanation
    }));
  };

  // Helper function to get flag emoji
  const getFlagEmoji = (countryName) => {
    const flagMap = {
      'Nigeria': '🇳🇬',
      'South Africa': '🇿🇦',
      'Kenya': '🇰🇪',
      'Ghana': '🇬🇭',
      'Egypt': '🇪🇬',
      'Morocco': '🇲🇦',
      'Tanzania': '🇹🇿',
      'Uganda': '🇺🇬',
      'Rwanda': '🇷🇼',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Portugal': '🇵🇹',
      'Greece': '🇬🇷',
      'Turkey': '🇹🇷',
      'UAE': '🇦🇪',
      'Japan': '🇯🇵',
      'Thailand': '🇹🇭',
      'Indonesia': '🇮🇩',
      'Vietnam': '🇻🇳',
      'USA': '🇺🇸',
      'Canada': '🇨🇦',
      'Mexico': '🇲🇽',
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷',
      'Peru': '🇵🇪',
      'Australia': '🇦🇺',
      'New Zealand': '🇳🇿',
      'UK': '🇬🇧',
      'Germany': '🇩🇪'
    };
    return flagMap[countryName] || '🌍';
  };

  // Helper function to get destination image
  const getDestinationImage = (city, country) => {
    const imageMap = {
      'Lagos': 'https://i.redd.it/rbpx8j40bxzb1.jpg',
      'Cape Town': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
      'Nairobi': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5',
      'Accra': 'https://images.unsplash.com/photo-1578968169801-d63d5d5c1a07',
      'Cairo': 'https://images.unsplash.com/photo-1572252009288-2688faa05a00',
      'Marrakech': 'https://images.unsplash.com/photo-1597218859906-9eacf7e14f2d',
      'Zanzibar': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
      'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
      'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
      'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
      'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1',
      'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'
    };
    
    const key = Object.keys(imageMap).find(k => 
      city?.includes(k) || country?.includes(k)
    );
    
    return imageMap[key] || `https://source.unsplash.com/800x600/?${city || country},travel`;
  };

  const getCurrencySymbol = () => {
    const currencyObj = currencies.find(c => c.code === currency);
    return currencyObj ? currencyObj.symbol : '$';
  };

  const handleViewItinerary = async (trip) => {
    try {
      setLoading(true);
      
      // Fetch full trip details from backend
      const response = await tripsAPI.getTrip(trip.id);
      const tripData = response.data;
      
      setSelectedTrip({
        ...tripData,
        id: tripData.id,
        city: tripData.destination?.split(',')[0] || trip.destination,
        country: tripData.destination?.split(',')[1]?.trim() || '',
        flag: getFlagEmoji(tripData.destination),
        dateRange: `${new Date(tripData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(tripData.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        travelers: tripData.trip_type === 'solo' ? 'Solo' : 
                  tripData.trip_type === 'couple' ? 'A couple' : 
                  tripData.trip_type === 'family' ? 'Family' : 
                  tripData.trip_type === 'friends' ? 'Friends' : 'Group',
        style: tripData.budget_type === 'budget_friendly' ? 'Budget' :
               tripData.budget_type === 'balanced' ? 'Balanced' :
               tripData.budget_type === 'luxury' ? 'Luxury' : 'Flexible',
        image: tripData.destination_images?.[0] || getDestinationImage(tripData.destination),
        budget: `$${tripData.estimated_budget?.toLocaleString() || '2,500'}`,
        duration: tripData.duration_days || 5,
        status: tripData.status,
        itinerary: {
          overview: tripData.ai_insights || 'Your personalized itinerary is ready!',
          activities: tripData.itinerary?.map(day => ({
            day: day.day_number,
            title: day.theme,
            details: day.summary,
            time: day.activities?.map(a => a.time).join(', ') || 'Full day',
            activities: day.activities
          })) || [],
          accommodations: 'Hotel accommodations as per your preferences',
          dining: 'Local restaurants and food experiences',
          bestTimeToVisit: day.best_time_to_visit || 'Year-round',
          weather: 'Check local forecast before travel'
        }
      });
      
      setShowItineraryModal(true);
    } catch (error) {
      console.error('Failed to fetch itinerary:', error);
      setErrorMessage('Failed to load itinerary details. Please try again.');
      setShowAPIError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSubmit = async () => {
    if (!budget) return;

    const budgetAmount = parseFloat(budget);
    const query = `Budget: ${getCurrencySymbol()}${budget} ${currency}${city ? `, City: ${city}` : ''}${country ? `, Country: ${country}` : ''}`;
    setAiSearchQuery(query);
    
    setShowBudgetModal(false);
    setShowLoadingModal(true);
    setLoadingProgress(0);
    setAiSearchStatus('analyzing_budget');

    // Start progress animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      setAiSearchStatus('analyzing_budget');
      await new Promise(resolve => setTimeout(resolve, 800));

      setAiSearchStatus('searching_destinations');
      await new Promise(resolve => setTimeout(resolve, 800));

      const aiResult = await findDestinationsByBudget(budgetAmount, currency, city, country);
      
      setAiSearchStatus('calculating_costs');
      await new Promise(resolve => setTimeout(resolve, 800));

      clearInterval(progressInterval);
      setLoadingProgress(100);

      setSearchResults(aiResult.destinations);
      
      setTimeout(() => {
        setShowLoadingModal(false);
        setShowResultsModal(true);
      }, 500);

    } catch (error) {
      console.error('Error in budget search:', error);
      clearInterval(progressInterval);
      setErrorMessage('Failed to find destinations. Please try again.');
      setShowAPIError(true);
      setShowLoadingModal(false);
    }
  };

  const handlePlanNewTrip = () => {
    navigate('/plan-trip');
  };

  const handleAISuggestions = () => {
    setShowBudgetModal(true);
  };

  const handleStartPlanning = (destination) => {
    navigate('/plan-trip', {
      state: {
        prefillDestination: {
          city: destination.city,
          country: destination.country,
          budget: budget,
          currency: currency
        }
      }
    });
    setShowResultsModal(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      resetAllModals();
    }
  };

  const resetAllModals = () => {
    setShowBudgetModal(false);
    setShowLoadingModal(false);
    setShowResultsModal(false);
    setShowItineraryModal(false);
    setSelectedTrip(null);
    setBudget('');
    setCity('');
    setCountry('');
    setLoadingProgress(0);
    setSearchResults([]);
    setAiSearchStatus('initializing');
  };

  const closeItineraryModal = () => {
    setShowItineraryModal(false);
    setSelectedTrip(null);
  };

  
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar title="My Trips" user={user} />
      
      <main className="flex-1 px-4 pt-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <TripTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <TripList 
            trips={userTrips}
            activeTab={activeTab}
            loading={tripsLoading}
            onViewItinerary={handleViewItinerary}
          />
          
          {userTrips.length === 0 && !tripsLoading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FiMap className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'Active' ? "You don't have any active trips." :
                 activeTab === 'Upcoming' ? "You don't have any upcoming trips." :
                 "You haven't completed any trips yet."}
              </p>
              <button
                onClick={handlePlanNewTrip}
                className="px-6 py-3 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition"
              >
                Plan Your First Trip
              </button>
            </div>
          )}
        </div>
      </main>
      
      <div className="sticky bottom-16 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <button
            onClick={handleAISuggestions}
            className="w-full py-4 bg-[#064473] text-white rounded-2xl font-bold hover:opacity-90 transition shadow-lg flex items-center justify-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
              <FiCompass className="relative w-6 h-6" />
            </div>
            <span>Find Destinations by Budget</span>
          </button>
          
          <button
            onClick={handlePlanNewTrip}
            className="w-full py-4 bg-[#064473] text-white rounded-2xl font-bold hover:opacity-90 transition shadow-lg flex items-center justify-center gap-3 border-2 border-white"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
              <FiZap className="relative w-6 h-6" />
            </div>
            <span>Plan New Trip with AI</span>
          </button>
        </div>
      </div>
      
      <BottomNav />
      
      {/* Itinerary Modal */}
      {showItineraryModal && selectedTrip && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{selectedTrip.flag}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTrip.city}, {selectedTrip.country}</h3>
                  <p className="text-sm text-gray-500">{selectedTrip.style} • {selectedTrip.travelers}</p>
                </div>
              </div>
              <button
                onClick={closeItineraryModal}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6">
                <div className="rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedTrip.image}
                    alt={selectedTrip.city}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiCalendar className="w-4 h-4 text-[#064473] mr-2" />
                      <span className="text-sm font-medium text-gray-700">Dates</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedTrip.dateRange}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiDollarSign className="w-4 h-4 text-[#064473] mr-2" />
                      <span className="text-sm font-medium text-gray-700">Budget</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedTrip.budget}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiClock className="w-4 h-4 text-[#064473] mr-2" />
                      <span className="text-sm font-medium text-gray-700">Duration</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedTrip.duration} days</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiUsers className="w-4 h-4 text-[#064473] mr-2" />
                      <span className="text-sm font-medium text-gray-700">Travelers</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedTrip.travelers}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Trip Overview</h4>
                  <p className="text-gray-600">
                    {selectedTrip.itinerary.overview}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Daily Itinerary</h4>
                  <div className="space-y-4">
                    {selectedTrip.itinerary.activities && selectedTrip.itinerary.activities.length > 0 ? (
                      selectedTrip.itinerary.activities.map((activity, index) => (
                        <div key={index} className="border-l-4 border-[#064473] pl-4 py-2">
                          <div className="flex items-center mb-1">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#064473] text-white font-bold text-sm mr-3">
                              Day {activity.day}
                            </span>
                            <h5 className="text-lg font-semibold text-gray-900">{activity.title}</h5>
                          </div>
                          <p className="text-gray-600 pl-11">{activity.details}</p>
                          {activity.activities && (
                            <div className="mt-2 pl-11">
                              {activity.activities.slice(0, 3).map((act, idx) => (
                                <div key={idx} className="flex items-start mb-1">
                                  <FiActivity className="w-3 h-3 text-[#064473] mt-1 mr-2" />
                                  <span className="text-sm text-gray-600">{act.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No daily activities available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
              <button
                onClick={closeItineraryModal}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeItineraryModal();
                  navigate(`/itinerary-detail/${selectedTrip.id}`);
                }}
                className="px-5 py-2.5 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition flex items-center space-x-2"
              >
                <span>View Full Itinerary</span>
                <FiNavigation className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Budget Modal */}
      {showBudgetModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-[#064473]/10 flex items-center justify-center mr-3">
                  <FiCompass className="w-5 h-5 text-[#064473]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">AI Destination Finder</h2>
              </div>
              <button
                onClick={resetAllModals}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm text-gray-600 mb-6">
                Enter your travel budget and AI will suggest perfect destinations tailored to your needs.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Budget
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-500 font-medium">{getCurrencySymbol()}</span>
                    </div>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064473] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="relative w-28">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full py-3 pl-3 pr-8 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064473] focus:border-transparent appearance-none text-xs font-medium"
                    >
                      {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.code} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred City (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Lagos, Nairobi, Cape Town"
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064473] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Country (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2">
                    <FiGlobe className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Nigeria, Kenya, South Africa"
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064473] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-[#064473]/5 to-[#064473]/10 rounded-xl border border-[#064473]/20">
                <div className="flex items-center mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#064473]/20 flex items-center justify-center mr-2.5">
                    <FiZap className="w-4 h-4 text-[#064473]" />
                  </div>
                  <h4 className="font-bold text-[#064473]">How it works</h4>
                </div>
                <ul className="text-xs text-[#064473]/90 space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#064473] font-bold mr-2">•</span>
                    <span>AI analyzes destinations within your {getCurrencySymbol()}{budget || 'specified'} {currency} budget</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#064473] font-bold mr-2">•</span>
                    <span>Considers flight costs, accommodation, and local expenses</span>
                  </li>
                  {city && (
                    <li className="flex items-start">
                      <span className="text-[#064473] font-bold mr-2">•</span>
                      <span>Prioritizes destinations in {city}</span>
                    </li>
                  )}
                  {country && (
                    <li className="flex items-start">
                      <span className="text-[#064473] font-bold mr-2">•</span>
                      <span>Focuses on {country} as your preferred country</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={resetAllModals}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBudgetSubmit}
                  disabled={!budget}
                  className="flex-1 py-3 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Find Destinations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Modal */}
      {showLoadingModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#064473] to-[#064473]/80 flex items-center justify-center animate-pulse">
                <FiCompass className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI is Finding Perfect Destinations</h3>
              
              <p className="text-gray-600 mb-6 text-sm">
                {aiSearchQuery}
              </p>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Searching destinations...</span>
                  <span>{loadingProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#064473] to-[#064473]/80 transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  aiSearchStatus === 'analyzing_budget' || 
                  aiSearchStatus === 'searching_destinations' || 
                  aiSearchStatus === 'calculating_costs' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      aiSearchStatus === 'analyzing_budget' || 
                      aiSearchStatus === 'searching_destinations' || 
                      aiSearchStatus === 'calculating_costs'
                        ? 'bg-[#064473]' 
                        : 'bg-gray-300'
                    }`}>
                      {aiSearchStatus === 'analyzing_budget' || 
                       aiSearchStatus === 'searching_destinations' || 
                       aiSearchStatus === 'calculating_costs' ? (
                        <FiCheck className="w-3 h-3 text-white" />
                      ) : (
                        <span className="text-xs text-white">1</span>
                      )}
                    </div>
                    <span className={`${
                      aiSearchStatus === 'analyzing_budget' || 
                      aiSearchStatus === 'searching_destinations' || 
                      aiSearchStatus === 'calculating_costs'
                        ? 'text-[#064473] font-medium' 
                        : 'text-gray-600'
                    }`}>
                      Analyzing budget feasibility
                    </span>
                  </div>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  aiSearchStatus === 'searching_destinations' || 
                  aiSearchStatus === 'calculating_costs'
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      aiSearchStatus === 'searching_destinations' || 
                      aiSearchStatus === 'calculating_costs'
                        ? 'bg-[#064473]' 
                        : 'bg-gray-300'
                    }`}>
                      {aiSearchStatus === 'searching_destinations' || 
                       aiSearchStatus === 'calculating_costs' ? (
                        <FiCheck className="w-3 h-3 text-white" />
                      ) : (
                        <span className="text-xs text-white">2</span>
                      )}
                    </div>
                    <span className={`${
                      aiSearchStatus === 'searching_destinations' || 
                      aiSearchStatus === 'calculating_costs'
                        ? 'text-[#064473] font-medium' 
                        : 'text-gray-600'
                    }`}>
                      Searching matching destinations
                    </span>
                  </div>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  aiSearchStatus === 'calculating_costs'
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      aiSearchStatus === 'calculating_costs'
                        ? 'bg-[#064473]' 
                        : 'bg-gray-300'
                    }`}>
                      {aiSearchStatus === 'calculating_costs' ? (
                        <FiCheck className="w-3 h-3 text-white" />
                      ) : (
                        <span className="text-xs text-white">3</span>
                      )}
                    </div>
                    <span className={`${
                      aiSearchStatus === 'calculating_costs'
                        ? 'text-[#064473] font-medium' 
                        : 'text-gray-600'
                    }`}>
                      Calculating costs & visa requirements
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Powered by Wayva AI • Finding destinations that match your budget
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Results Modal */}
      {showResultsModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-[#064473] flex items-center justify-center mr-3">
                  <FiCompass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Top Destinations Found</h2>
                  <p className="text-xs text-gray-600">{aiSearchQuery}</p>
                </div>
              </div>
              <button
                onClick={resetAllModals}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No destinations found</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Try adjusting your budget or removing location filters.
                  </p>
                  <button
                    onClick={() => {
                      setCity('');
                      setCountry('');
                      handleBudgetSubmit();
                    }}
                    className="px-4 py-2 bg-[#064473] text-white rounded-lg text-sm"
                  >
                    Try with current budget
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((destination) => (
                    <div key={destination.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <div className="h-32 relative">
                        <img 
                          src={destination.image} 
                          alt={`${destination.city}, ${destination.country}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{destination.flag}</span>
                            <div>
                              <h3 className="text-white font-bold text-lg">{destination.city}</h3>
                              <p className="text-white/90 text-sm">{destination.country}</p>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-sm font-bold text-gray-800">{destination.matchScore}% Match</span>
                        </div>
                        {destination.isAI && (
                          <div className="absolute top-3 left-3 bg-[#064473]/90 backdrop-blur-sm rounded-full px-2 py-1">
                            <span className="text-xs font-bold text-white">AI</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <FiDollarSign className="w-4 h-4 text-[#064473]" />
                            <div>
                              <p className="text-xs text-gray-600">Budget Range</p>
                              <p className="font-medium text-sm">{destination.budgetRange}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiCalendar className="w-4 h-4 text-[#064473]" />
                            <div>
                              <p className="text-xs text-gray-600">Recommended Stay</p>
                              <p className="font-medium text-sm">{destination.days}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">Highlights</p>
                          <div className="flex flex-wrap gap-1">
                            {destination.highlights.map((highlight, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-[#064473]/10 text-[#064473] rounded-full text-xs"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {destination.explanation && (
                          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-[#064473]">{destination.explanation}</p>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <p className="text-xs text-gray-600 mb-1">Visa Information</p>
                          <p className="text-sm text-gray-800">{destination.visaInfo}</p>
                        </div>
                        
                        <button
                          onClick={() => handleStartPlanning(destination)}
                          className="w-full py-3 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                          <FiNavigation className="w-4 h-4" />
                          Start Planning This Trip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4 flex-shrink-0">
              <button
                onClick={resetAllModals}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Search Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* API Error Modal */}
      {showAPIError && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAPIError(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowAPIError(false);
                    fetchUserTrips();
                  }}
                  className="flex-1 py-3 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;