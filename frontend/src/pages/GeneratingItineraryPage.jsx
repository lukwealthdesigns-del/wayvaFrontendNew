// pages/GeneratingItineraryPage.jsx - Backend Integration
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GeneratingScreen from '../components/Itinerary/GeneratingScreen';
import { aiAPI } from '../api/ai';
import { tripsAPI } from '../api/trips';

const GeneratingItineraryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, aiResponse, tripId } = location.state || {};
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no form data and no aiResponse/tripId, redirect back to trip planner
    if (!formData && !aiResponse && !tripId) {
      navigate('/plan-trip');
    }
  }, [formData, aiResponse, tripId, navigate]);

  const handleComplete = async () => {
    try {
      // Case 1: We already have aiResponse from TripPlannerPage
      if (aiResponse && aiResponse.trip_id) {
        navigate(`/itinerary-detail/${aiResponse.trip_id}`, { 
          state: { 
            formData, 
            aiResponse,
            tripId: aiResponse.trip_id 
          } 
        });
        return;
      }

      // Case 2: We have tripId from saved trip
      if (tripId) {
        navigate(`/itinerary-detail/${tripId}`, { 
          state: { tripId } 
        });
        return;
      }

      // Case 3: We have formData but need to generate itinerary
      if (formData) {
        // Format request data
        const requestData = {
          destination: `${formData.destination?.city}, ${formData.destination?.country}`,
          trip_type: formData.travelers?.tripType || 'solo',
          start_date: formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          end_date: formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : getEndDate(formData.startDate, 5),
          travel_interests: mapPreferencesToInterests(formData.preferences || []),
          budget_type: formData.budget?.type || 'balanced',
          specific_requirements: formData.specificRequirements || '',
          group_size: formData.travelers?.groupSize || 1,
          accommodation_preference: formData.accommodationPreference || '',
          transportation_preference: formData.transportationPreference || ''
        };

        const response = await aiAPI.planTrip(requestData);
        
        // Navigate to itinerary detail with the generated trip
        navigate(`/itinerary-detail/${response.data.trip_id}`, { 
          state: { 
            formData, 
            aiResponse: response.data,
            tripId: response.data.trip_id 
          } 
        });
      }
    } catch (err) {
      console.error('Failed to generate itinerary:', err);
      setError(err.response?.data?.detail || 'Failed to generate itinerary');
      
      // Navigate to error state
      navigate('/itinerary-success', { 
        state: { 
          error: err.response?.data?.detail || 'Failed to generate itinerary',
          formData 
        } 
      });
    }
  };

  // Helper function to get end date
  const getEndDate = (startDate, days = 5) => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    return end.toISOString().split('T')[0];
  };

  // Map preferences to backend travel interests
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

  // Handle manual redirect to itinerary success (fallback)
  const handleManualComplete = () => {
    navigate('/itinerary-success', { 
      state: { 
        formData,
        aiResponse,
        tripId 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <GeneratingScreen 
        formData={formData} 
        onComplete={handleComplete}
        onManualComplete={handleManualComplete}
        error={error}
        hasExistingItinerary={!!(aiResponse || tripId)}
      />
    </div>
  );
};

export default GeneratingItineraryPage;