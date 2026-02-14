// api/trips.js - Complete with Save to Trips functionality
import api from './index';

export const tripsAPI = {
  /**
   * Get user trips with pagination and filtering
   * @param {string} status - Filter by status (planning/active/completed/cancelled)
   * @param {number} page 
   * @param {number} pageSize 
   */
  getUserTrips: (status, page = 1, pageSize = 20) => 
    api.get('/trips', { params: { status, page, page_size: pageSize } }),

  /**
   * Get single trip by ID
   * @param {string} tripId 
   */
  getTrip: (tripId) => api.get(`/trips/${tripId}`),

  /**
   * Create new trip
   * @param {Object} data - Trip creation data
   */
  createTrip: (data) => api.post('/trips/', data),  // ✅ Added trailing slash

  /**
   * Update trip
   * @param {string} tripId 
   * @param {Object} data 
   */
  updateTrip: (tripId, data) => api.put(`/trips/${tripId}`, data),

  /**
   * Delete trip (soft delete)
   * @param {string} tripId 
   */
  deleteTrip: (tripId) => api.delete(`/trips/${tripId}`),

  /**
   * Regenerate AI itinerary
   * @param {string} tripId 
   */
  regenerateItinerary: (tripId) => api.post(`/trips/${tripId}/regenerate-itinerary`),

  /**
   * Export itinerary to PDF
   * @param {string} tripId 
   * @param {Object} options - { format, include_images, include_weather, include_maps }
   */
  exportItinerary: (tripId, options = { format: 'pdf' }) => 
    api.post(`/trips/${tripId}/export`, options),

  /**
   * Download itinerary PDF
   * @param {string} tripId 
   */
  downloadItinerary: (tripId) => 
    api.post(`/trips/${tripId}/export`, { format: 'pdf' }, {  // ✅ Use export endpoint
      responseType: 'blob',
      headers: { Accept: 'application/pdf' }
    }),

  /**
   * Get public trips for discover page
   * @param {string} destination 
   * @param {number} page 
   * @param {number} pageSize 
   */
  discoverTrips: (destination, page = 1, pageSize = 20) => 
    api.get('/trips/public/discover', { 
      params: { destination, page, page_size: pageSize } 
    }),

  /**
   * Save itinerary to trips
   * @param {Object} itineraryData - The itinerary data to save
   */
  saveToTrips: (itineraryData) => {
    // Format the data for the backend
    const tripData = {
      title: itineraryData.title || `Trip to ${itineraryData.destination?.city || 'Your Destination'}`,
      destination: itineraryData.destination?.full || itineraryData.destination || 'Your Destination',
      start_date: itineraryData.startDate instanceof Date 
        ? itineraryData.startDate.toISOString().split('T')[0] 
        : itineraryData.start_date || new Date().toISOString().split('T')[0],
      end_date: itineraryData.endDate instanceof Date 
        ? itineraryData.endDate.toISOString().split('T')[0] 
        : itineraryData.end_date || new Date().toISOString().split('T')[0],
      trip_type: itineraryData.trip_type || itineraryData.travelers || 'solo',
      budget_type: itineraryData.budget_type || itineraryData.budget?.type || 'balanced',
      travel_interests: itineraryData.travel_interests || itineraryData.preferences || [],
      estimated_budget: itineraryData.estimated_budget || itineraryData.totalCost || 1000,
      itinerary: itineraryData.itinerary || itineraryData.days || [],
      ai_insights: itineraryData.ai_insights || itineraryData.overview || '',
      destination_images: itineraryData.destination_images || [],
      is_public: false
    };
    
    return api.post('/trips/', tripData);  // ✅ Added trailing slash
  },

  // ... rest of methods
};

export default tripsAPI;