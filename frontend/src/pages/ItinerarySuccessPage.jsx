// pages/ItinerarySuccessPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SuccessScreen from '../components/Itinerary/SuccessScreen';

const ItinerarySuccessPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const tripId    = state?.tripId;
  const formData  = state?.formData;
  const aiResponse = state?.aiResponse;
  const isMock    = state?.isMock || false;

  const handleViewItinerary = () => {
    navigate(`/itinerary-detail/${tripId}`, {
      state: { formData, aiResponse, isMock },
      replace: true
    });
  };

  // If somehow we land here without state, go back to planner
  if (!tripId || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Something went wrong. Please try again.</p>
          <button
            onClick={() => navigate('/plan-trip')}
            className="px-6 py-3 bg-[#064473] text-white rounded-xl font-medium"
          >
            Back to Trip Planner
          </button>
        </div>
      </div>
    );
  }

  return (
    <SuccessScreen
      formData={formData}
      onViewItinerary={handleViewItinerary}
    />
  );
};

export default ItinerarySuccessPage;