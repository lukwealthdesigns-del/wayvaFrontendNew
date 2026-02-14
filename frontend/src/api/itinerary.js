// api/itinerary.js
const API_BASE_URL = 'http://localhost:8000/api';

export const itineraryAPI = {
  // Generate custom itinerary
  generateCustomItinerary: async (itineraryData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-custom-itinerary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itineraryData)
      });
      return response.json();
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  },

  // Create trip with itinerary
  createTripWithItinerary: async (tripData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/ai/create-trip-with-itinerary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tripData)
      });
      return response.json();
    } catch (error) {
      console.error('Error creating trip with itinerary:', error);
      throw error;
    }
  },

  // Get itinerary detail
  getItineraryDetail: async (itineraryId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/ai/itinerary/${itineraryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching itinerary detail:', error);
      throw error;
    }
  }
};