// pages/ItineraryDetailPage.jsx - Complete with Success Message and Save to Trips
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ItineraryHeader from '../components/Itinerary/ItineraryHeader';
import DayList from '../components/Itinerary/DayList';
import DayDetail from '../components/Itinerary/DayDetail';
import ActivityCard from '../components/Itinerary/ActivityCard';
import { FiPrinter, FiShare2, FiLoader, FiAlertCircle, FiZap, FiMapPin, FiDownload, FiCheckCircle, FiSave } from 'react-icons/fi';
import { tripsAPI } from '../api/trips';
import { aiAPI } from '../api/ai';
import { useAuth } from '../context/AuthContext';

const ItineraryDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  const { formData, aiResponse, tripId: stateTripId, isMock: initialIsMock } = location.state || {};
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [viewMode, setViewMode] = useState('list');
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [mapLocation, setMapLocation] = useState({ name: '', query: '' });
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isMock, setIsMock] = useState(initialIsMock || false);
  
  const PRIMARY_COLOR = '#064473';

  // Show success message when itinerary loads
  useEffect(() => {
    if (itinerary && !loading) {
      if (itinerary.isMock || isMock) {
        setSuccessMessage('📝 Showing sample itinerary (backend unavailable)');
        setShowSuccess(true);
      } else {
        setSuccessMessage('✅ Your itinerary is ready!');
        setShowSuccess(true);
      }
      
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [itinerary, loading, isMock]);

  useEffect(() => {
    // If we have tripId from params, fetch from API
    if (tripId) {
      if (tripId.startsWith('mock-')) {
        setIsMock(true);
        // Generate mock itinerary
        const mockItinerary = generateMockItinerary();
        setItinerary(mockItinerary);
        setLoading(false);
      } else {
        fetchTripItinerary(tripId);
      }
    } 
    // If we have aiResponse from trip planner, use that
    else if (aiResponse) {
      formatAIResponse(aiResponse, formData);
    }
    // If we have formData but no aiResponse, generate new itinerary
    else if (formData) {
      generateItinerary(formData);
    } else {
      setError('No itinerary data found');
      setLoading(false);
    }
  }, [tripId, aiResponse, formData]);

  // Generate mock itinerary when backend fails
  const generateMockItinerary = () => {
    const mockTripId = `mock-${Date.now()}`;
    const duration = 7;
    
    const mockDays = [];
    for (let i = 0; i < duration; i++) {
      mockDays.push({
        day: i + 1,
        date: new Date(new Date().setDate(new Date().getDate() + i)),
        title: i === 0 ? 'Arrival Day' : i === duration - 1 ? 'Departure Day' : `Day ${i + 1} Exploration`,
        activities: [
          {
            time: '09:00 - 12:00',
            name: 'Morning Activity',
            description: 'Explore local attractions',
            price: 50,
            category: 'sightseeing',
            location: 'City Center',
            notes: 'Book tickets in advance'
          },
          {
            time: '12:30 - 13:30',
            name: 'Lunch',
            description: 'Try local cuisine',
            price: 25,
            category: 'food',
            location: 'Local restaurant',
            notes: 'Ask for daily specials'
          },
          {
            time: '14:00 - 17:00',
            name: 'Afternoon Exploration',
            description: 'Visit cultural sites',
            price: 40,
            category: 'culture',
            location: 'Museum',
            notes: 'Guided tours available'
          }
        ]
      });
    }

    return {
      id: mockTripId,
      destination: {
        city: formData?.destination?.city || 'Your Destination',
        country: formData?.destination?.country || '',
        full: formData?.destination?.full || 'Your Destination'
      },
      travelers: formData?.travelers?.type || 'traveler',
      budget: {
        type: formData?.budget?.type || 'balanced',
        amount: formData?.budget?.amount || 1000
      },
      startDate: formData?.startDate || new Date(),
      endDate: formData?.endDate || new Date(new Date().setDate(new Date().getDate() + 6)),
      duration: duration,
      days: mockDays,
      overview: 'This is a sample itinerary. Please configure your OpenAI API key for AI-generated content.',
      accommodations: 'Hotels and accommodations as per your selection',
      transportation: 'Local transport including public transit and rideshares',
      dining: 'Local restaurants and food experiences',
      travel_tips: '• Check visa requirements before traveling\n• Pack appropriate clothing for the climate\n• Get comprehensive travel insurance',
      totalCost: 1000,
      currency: 'USD',
      trip_id: mockTripId,
      isMock: true,
      generated_by: 'mock'
    };
  };

  const fetchTripItinerary = async (id) => {
    try {
      setLoading(true);
      const response = await tripsAPI.getTrip(id);
      const tripData = response.data;
      
      // Format trip data into itinerary format
      const formattedItinerary = formatTripToItinerary(tripData);
      setItinerary(formattedItinerary);
    } catch (err) {
      console.error('Failed to fetch trip:', err);
      // Fallback to mock on error
      const mockItinerary = generateMockItinerary();
      setItinerary(mockItinerary);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  const generateItinerary = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare request data
      const requestData = {
        destination: `${data.destination?.city}, ${data.destination?.country}`,
        trip_type: data.travelers?.tripType || 'solo',
        start_date: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        end_date: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : getEndDate(data.startDate, 5),
        travel_interests: mapPreferencesToInterests(data.preferences || []),
        budget_type: data.budget?.type || 'balanced',
        specific_requirements: data.specificRequirements || '',
        group_size: data.travelers?.groupSize || 1,
        accommodation_preference: data.accommodationPreference || '',
        transportation_preference: data.transportationPreference || ''
      };

      const response = await aiAPI.planTrip(requestData);
      
      // Format the response
      formatAIResponse(response.data, data);
      
    } catch (err) {
      console.error('Failed to generate itinerary:', err);
      // Fallback to mock on error
      const mockItinerary = generateMockItinerary();
      setItinerary(mockItinerary);
      setIsMock(true);
      setLoading(false);
    }
  };

  const formatAIResponse = (aiData, formData) => {
    try {
      // Extract data from AI response
      const destination = formData?.destination || { city: aiData.destination?.split(',')[0], country: aiData.destination?.split(',')[1] };
      const duration = aiData.duration_days || calculateDuration(formData?.startDate, formData?.endDate) || 5;
      
      // Format days from itinerary
      const days = aiData.itinerary?.map((day, index) => ({
        day: day.day || index + 1,
        date: day.date ? new Date(day.date) : new Date(new Date().setDate(new Date().getDate() + index)),
        title: day.theme || `Day ${index + 1}: ${index === 0 ? 'Arrival' : index === duration - 1 ? 'Departure' : 'Exploration'}`,
        activities: day.activities?.map(activity => ({
          time: activity.time || `${activity.start_time || '09:00'} - ${activity.end_time || '17:00'}`,
          name: activity.activity || activity.title,
          description: activity.description || '',
          price: activity.cost || 0,
          rating: 4.5,
          reviews: 'AI-curated',
          type: activity.category || 'Activity',
          duration: '2 hours',
          category: activity.category || 'activity',
          location: activity.location || aiData.destination,
          booking_required: activity.booking_required || false,
          notes: activity.notes || ''
        })) || []
      }));

      // Calculate total cost
      const totalCost = aiData.total_estimated_cost?.average || 
                       aiData.total_estimated_cost?.min || 
                       formData?.budget?.amount || 1000;

      const formatted = {
        id: aiData.trip_id || Date.now(),
        destination: {
          city: destination.city || aiData.destination,
          country: destination.country || '',
          full: aiData.destination || `${destination.city}, ${destination.country}`
        },
        travelers: formData?.travelers?.type || 'traveler',
        budget: {
          type: formData?.budget?.type || aiData.budget_type || 'balanced',
          amount: totalCost
        },
        startDate: formData?.startDate || new Date(aiData.itinerary?.[0]?.date),
        endDate: formData?.endDate || new Date(aiData.itinerary?.[duration - 1]?.date),
        duration: duration,
        days: days,
        overview: aiData.ai_insights || `Your ${duration}-day trip to ${aiData.destination} is ready!`,
        accommodations: formData?.accommodationPreference || 'Hotels and accommodations as per your preferences',
        transportation: formData?.transportationPreference || 'Local transport including public transit and rideshares',
        dining: 'Local restaurants and food experiences',
        budget_breakdown: {
          accommodation: totalCost * 0.35,
          transportation: totalCost * 0.15,
          food: totalCost * 0.3,
          activities: totalCost * 0.2,
          currency: aiData.total_estimated_cost?.currency || 'USD'
        },
        travel_tips: aiData.important_notes?.join('\n') || getTravelTips(formData?.preferences),
        recommendations: aiData.recommendations || [],
        important_notes: aiData.important_notes || [],
        totalCost: totalCost,
        currency: aiData.total_estimated_cost?.currency || 'USD',
        trip_id: aiData.trip_id,
        created_at: aiData.generated_at || new Date().toISOString(),
        generated_by: 'ai',
        isMock: false
      };

      setItinerary(formatted);
    } catch (err) {
      console.error('Error formatting AI response:', err);
      const mockItinerary = generateMockItinerary();
      setItinerary(mockItinerary);
      setIsMock(true);
    }
  };

  const formatTripToItinerary = (tripData) => {
    // Parse destination
    const destinationParts = tripData.destination?.split(',') || ['Unknown', ''];
    
    // Parse itinerary
    const itineraryData = typeof tripData.itinerary === 'string' 
      ? JSON.parse(tripData.itinerary) 
      : tripData.itinerary || [];

    const days = itineraryData.map((day, index) => ({
      day: day.day_number || index + 1,
      date: day.date ? new Date(day.date) : new Date(tripData.start_date),
      title: day.theme || `Day ${index + 1}`,
      activities: day.activities?.map(activity => ({
        time: `${activity.start_time || '09:00'} - ${activity.end_time || '17:00'}`,
        name: activity.title || 'Activity',
        description: activity.description || '',
        price: activity.estimated_cost || 0,
        rating: 4.5,
        reviews: 'Trip saved',
        type: activity.category || 'Activity',
        duration: '2 hours',
        category: activity.category || 'activity',
        location: activity.location || tripData.destination,
        booking_required: activity.booking_required || false,
        notes: activity.notes || ''
      })) || []
    }));

    return {
      id: tripData.id,
      destination: {
        city: destinationParts[0]?.trim() || 'Unknown',
        country: destinationParts[1]?.trim() || '',
        full: tripData.destination
      },
      travelers: tripData.trip_type,
      budget: {
        type: tripData.budget_type,
        amount: tripData.estimated_budget || 1000
      },
      startDate: new Date(tripData.start_date),
      endDate: new Date(tripData.end_date),
      duration: tripData.duration_days,
      days: days,
      overview: tripData.ai_insights || `Your ${tripData.duration_days}-day trip to ${tripData.destination}`,
      accommodations: 'Hotel accommodations as per your selection',
      transportation: 'Local transport arrangements',
      dining: 'Restaurant recommendations',
      budget_breakdown: {
        accommodation: (tripData.estimated_budget || 1000) * 0.35,
        transportation: (tripData.estimated_budget || 1000) * 0.15,
        food: (tripData.estimated_budget || 1000) * 0.3,
        activities: (tripData.estimated_budget || 1000) * 0.2,
        currency: 'USD'
      },
      travel_tips: 'Check local travel advisories before departure',
      recommendations: [],
      important_notes: [],
      totalCost: tripData.estimated_budget || 1000,
      currency: 'USD',
      trip_id: tripData.id,
      created_at: tripData.created_at,
      generated_by: 'saved',
      isMock: false
    };
  };

  // Save itinerary to trips
  c// In handleSaveToTrips function, replace the navigation part:

  const handleSaveToTrips = async () => {
    if (!itinerary || itinerary.isMock) {
      alert('Cannot save sample itinerary');
      return;
    }
    
    setSaving(true);
    try {
      const saveData = {
        title: `Trip to ${itinerary.destination.city}`,
        destination: itinerary.destination.full,
        start_date: itinerary.startDate.toISOString().split('T')[0],
        end_date: itinerary.endDate.toISOString().split('T')[0],
        trip_type: itinerary.travelers || 'solo',
        budget_type: itinerary.budget.type || 'balanced',
        travel_interests: formData?.preferences || [],
        estimated_budget: itinerary.totalCost,
        itinerary: itinerary.days,
        ai_insights: itinerary.overview,
        is_public: false
      };
      
      const response = await tripsAPI.createTrip(saveData);
      setSuccessMessage('✅ Itinerary saved to your trips!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // ✅ Navigate to trips page with refresh state
      setTimeout(() => navigate('/trips', { 
        state: { refresh: true, newTripId: response.data.id } 
      }), 1500);
      
    } catch (err) {
      console.error('Failed to save itinerary:', err);
      alert('Failed to save itinerary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Download itinerary as PDF
  const handleDownloadPDF = async () => {
    if (!itinerary?.trip_id || itinerary.isMock) {
      alert('PDF download not available for sample itinerary');
      return;
    }

    setDownloadingPDF(true);
    try {
      const response = await tripsAPI.downloadItinerary(itinerary.trip_id);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `itinerary-${itinerary.destination.city}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to download itinerary. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Helper functions
  const calculateDuration = (start, end) => {
    if (!start || !end) return 5;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getEndDate = (startDate, days = 5) => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    return end.toISOString().split('T')[0];
  };

  const mapPreferencesToInterests = (preferences) => {
    const interestMap = {
      'adventure': 'adventure_travel',
      'city': 'city_breaks',
      'culture': 'cultural_exploration',
      'wine': 'wine_tours',
      'beach': 'beach_vacation',
      'road': 'road_trips',
      'food': 'food_tourism',
      'history': 'historical_sites',
      'shopping': 'shopping',
      'nightlife': 'nightlife',
      'family': 'family_friendly',
      'luxury': 'luxury',
      'budget': 'budget_travel',
      'hiking': 'mountain_hiking'
    };
    
    return preferences.map(pref => interestMap[pref] || pref).filter(Boolean);
  };

  const getTravelTips = (preferences) => {
    const tips = [
      '• Check visa requirements before traveling',
      '• Pack appropriate clothing for the climate',
      '• Get comprehensive travel insurance',
      '• Keep digital copies of important documents'
    ];
    
    if (preferences?.includes('adventure')) tips.push('• Check equipment requirements for adventure activities');
    if (preferences?.includes('beach')) tips.push('• Bring reef-safe sunscreen and beach essentials');
    if (preferences?.includes('culture')) tips.push('• Research local customs and dress codes');
    if (preferences?.includes('food')) tips.push('• Try local street food for authentic experiences');
    
    return tips.join('\n');
  };

  // Open Google Maps in popup
  const openMapPopup = (locationName, searchQuery) => {
    setMapLocation({
      name: locationName || 'Location',
      query: searchQuery || ''
    });
    setShowMapPopup(true);
  };

  const closeMapPopup = () => {
    setShowMapPopup(false);
    setMapLocation({ name: '', query: '' });
  };

  const getGoogleMapsUrl = () => {
    if (!mapLocation.query && itinerary?.destination?.full) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(itinerary.destination.full)}&zoom=12`;
    }
    
    if (mapLocation.query) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(mapLocation.query)}&zoom=15`;
    }
    
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent('World')}&zoom=2`;
  };

  // Calculate day total
  const calculateDayTotal = (activities) => {
    if (!activities || !Array.isArray(activities)) return 0;
    return activities.reduce((total, activity) => {
      const price = Number(activity.price) || 0;
      return total + price;
    }, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiLoader className="w-8 h-8 animate-spin" style={{ color: PRIMARY_COLOR }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Loading Your Itinerary</h3>
          <p className="text-gray-600 mb-4">Retrieving your travel plans...</p>
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Itinerary</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/trips')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Back to Trips
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8" style={{ color: PRIMARY_COLOR }}>📋</div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Itinerary Found</h3>
          <p className="text-gray-600 mb-6">Please generate an itinerary first</p>
          <button 
            onClick={() => navigate('/plan-trip')}
            className="px-6 py-3 rounded-lg font-medium text-base"
            style={{ 
              backgroundColor: PRIMARY_COLOR,
              color: 'white',
              boxShadow: `0 4px 14px 0 ${PRIMARY_COLOR}40`
            }}
          >
            Plan New Trip
          </button>
        </div>
      </div>
    );
  }

  const dayActivities = itinerary.days?.[selectedDay]?.activities || [];
  const dayTotal = calculateDayTotal(dayActivities);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Success Message Banner */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`px-6 py-3 rounded-full shadow-lg flex items-center gap-2 ${
            itinerary.isMock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {itinerary.isMock ? (
              <FiAlertCircle className="w-5 h-5" />
            ) : (
              <FiCheckCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <ItineraryHeader itinerary={itinerary} />

      {/* Map Popup */}
      {showMapPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">
                <FiMapPin className="inline mr-2 text-red-500" />
                {mapLocation.name}
              </h3>
              <button
                onClick={closeMapPopup}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>
            <div className="h-[70vh]">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={getGoogleMapsUrl()}
                allowFullScreen
                title="Google Maps"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeMapPopup}
                className="px-6 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open Destination Map Button */}
      <div className="px-6 pt-4">
        <button
          onClick={() => openMapPopup(
            itinerary.destination?.city || 'Destination',
            itinerary.destination?.full || ''
          )}
          className="w-full py-3 rounded-lg font-medium text-sm mb-3 flex items-center justify-center"
          style={{ 
            backgroundColor: PRIMARY_COLOR,
            color: 'white',
            boxShadow: `0 4px 14px 0 ${PRIMARY_COLOR}40`
          }}
        >
          <FiMapPin className="w-5 h-5 mr-2" />
          View {itinerary.destination?.city || 'Destination'} on Map
        </button>
      </div>

      {/* Mock/Generated Indicator */}
      {itinerary.isMock ? (
        <div className="px-6 pt-2">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Sample Itinerary</p>
              <p className="text-xs text-yellow-700">
                Showing sample data. Configure your OpenAI API key for AI-generated itineraries.
              </p>
            </div>
          </div>
        </div>
      ) : itinerary.generated_by === 'ai' && (
        <div className="px-6 pt-2">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg flex items-center">
            <FiZap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">AI-Generated Itinerary</p>
              <p className="text-xs text-blue-700">
                Personalized by AI based on your preferences
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Saved Trip Indicator */}
      {itinerary.generated_by === 'saved' && (
        <div className="px-6 pt-2">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center">
            <FiZap className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-purple-800">Saved Trip</p>
              <p className="text-xs text-purple-700">
                Viewing your saved itinerary
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="px-6 pt-6">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 List View
          </button>
          <button 
            onClick={() => setViewMode('detail')}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              viewMode === 'detail' 
                ? 'bg-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 Detail View
          </button>
        </div>
      </div>

      {/* Day Selection */}
      {itinerary.days && itinerary.days.length > 0 && (
        <div className="px-6 mb-6">
          <DayList 
            days={itinerary.days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </div>
      )}

      {/* Day Summary */}
      <div className="px-6 mb-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Day {selectedDay + 1}: {itinerary.days?.[selectedDay]?.title || 'Activities'}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {itinerary.days?.[selectedDay]?.date?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-blue-200"
                 style={{ color: PRIMARY_COLOR }}>
              {itinerary.currency} {dayTotal.toFixed(2)} total
            </div>
          </div>
          <div className="flex items-center mt-2 text-xs text-gray-600">
            <span className="mr-4">
              {itinerary.isMock ? '📝 Sample' : 
               itinerary.generated_by === 'ai' ? '✨ AI-generated' : 
               itinerary.generated_by === 'saved' ? '💾 Saved trip' : '📝 Sample'}
            </span>
            <span>{dayActivities.length} activities</span>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="px-6 pb-32">
        {viewMode === 'list' ? (
          // List View
          <div className="space-y-4">
            {dayActivities.map((activity, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                <ActivityCard 
                  activity={activity}
                  isAI={!itinerary.isMock && itinerary.generated_by === 'ai'}
                />
                {/* View on Map Button for each activity */}
                <button
                  onClick={() => openMapPopup(
                    activity.name || 'Activity',
                    `${activity.name || ''} ${activity.location || itinerary.destination?.full || ''}`
                  )}
                  className="mt-3 w-full py-2 rounded-lg font-medium text-xs flex items-center justify-center border border-blue-300 text-blue-600 hover:bg-blue-50 transition"
                >
                  <FiMapPin className="w-4 h-4 mr-2 text-red-500" />
                  View on Map
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Detail View
          <DayDetail 
            day={itinerary.days?.[selectedDay] || {}}
            activities={dayActivities}
            onViewMap={openMapPopup}
            currency={itinerary.currency}
          />
        )}

        {/* Travel Tips */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
          <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center">
            <div className={`w-5 h-5 rounded-full ${
              itinerary.isMock ? 'bg-yellow-500' :
              itinerary.generated_by === 'ai' ? 'bg-gradient-to-r from-blue-500 to-teal-500' : 
              itinerary.generated_by === 'saved' ? 'bg-purple-500' : 'bg-yellow-500'
            } text-white flex items-center justify-center text-xs mr-2`}>
              {itinerary.isMock ? '💡' :
               itinerary.generated_by === 'ai' ? 'AI' : 
               itinerary.generated_by === 'saved' ? '💾' : '💡'}
            </div>
            Travel Tips
          </h4>
          <div className="text-xs text-gray-700 whitespace-pre-line">
            {itinerary.travel_tips || 'No travel tips available'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => window.print()}
            className="py-3 rounded-lg font-medium text-sm transition-all duration-200 border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center"
          >
            <FiPrinter className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Print</span>
          </button>
          
          {!itinerary.isMock && itinerary.trip_id && (
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center"
              style={{ 
                backgroundColor: PRIMARY_COLOR,
                color: 'white',
                boxShadow: `0 4px 14px 0 ${PRIMARY_COLOR}40`,
                opacity: downloadingPDF ? 0.7 : 1
              }}
            >
              {downloadingPDF ? (
                <>
                  <FiLoader className="w-4 h-4 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Downloading...</span>
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">PDF</span>
                </>
              )}
            </button>
          )}

          {!itinerary.isMock && (
            <button
              onClick={handleSaveToTrips}
              disabled={saving}
              className="py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center bg-green-600 text-white hover:bg-green-700"
            >
              {saving ? (
                <>
                  <FiLoader className="w-4 h-4 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Itinerary: ${itinerary.destination?.city}`,
                  text: `Check out my ${itinerary.isMock ? 'sample' : itinerary.generated_by === 'ai' ? 'AI-generated' : 'saved'} itinerary for ${itinerary.destination?.city}!`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            <FiShare2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetailPage;