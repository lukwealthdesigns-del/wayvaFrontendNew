// pages/ItinerarySuccessPage.jsx - Backend Integration
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SuccessScreen from '../components/Itinerary/SuccessScreen';
import TripFormNavigation from '../components/TripPlanner/TripFormNavigation';

const ItinerarySuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, aiResponse, tripId, error } = location.state || {};

  // Auto-redirect to itinerary detail if we have tripId
  useEffect(() => {
    if (tripId) {
      // Short delay to show success message before redirect
      const timer = setTimeout(() => {
        navigate(`/itinerary-detail/${tripId}`, { 
          state: { 
            formData, 
            aiResponse,
            tripId 
          } 
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [tripId, formData, aiResponse, navigate]);

  const handleViewItinerary = () => {
    if (tripId) {
      // Navigate to saved trip
      navigate(`/itinerary-detail/${tripId}`, { 
        state: { 
          formData, 
          aiResponse,
          tripId 
        } 
      });
    } else if (aiResponse?.trip_id) {
      // Navigate to newly generated trip
      navigate(`/itinerary-detail/${aiResponse.trip_id}`, { 
        state: { 
          formData, 
          aiResponse,
          tripId: aiResponse.trip_id 
        } 
      });
    } else {
      // Fallback to trips page
      navigate('/trips');
    }
  };

  const handleViewTrips = () => {
    navigate('/trips');
  };

  const handlePlanAnother = () => {
    navigate('/plan-trip');
  };

  // Extract trip details for display
  const getTripDetails = () => {
    if (tripId) {
      return {
        id: tripId,
        destination: formData?.destination || aiResponse?.destination || 'your destination',
        duration: formData?.duration || aiResponse?.duration_days || 5,
        budget: formData?.budget?.type || aiResponse?.budget_type || 'balanced'
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SuccessScreen 
        formData={formData}
        tripDetails={getTripDetails()}
        error={error}
        onViewItinerary={handleViewItinerary}
        onViewTrips={handleViewTrips}
        onPlanAnother={handlePlanAnother}
        autoRedirect={!!tripId}
      />
      <TripFormNavigation />
    </div>
  );
};

export default ItinerarySuccessPage;