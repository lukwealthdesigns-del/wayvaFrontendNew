import api from './index';

export const destinationsAPI = {
  /**
   * Get popular destinations
   * @param {boolean} trendingOnly 
   * @param {number} limit 
   */
  getPopularDestinations: (trendingOnly = false, limit = 10) => 
    api.get('/destinations/popular', { 
      params: { trending_only: trendingOnly, limit } 
    }),

  /**
   * Search destinations with filters
   * @param {Object} params - Search parameters
   */
  searchDestinations: (params) => api.post('/destinations/search', params),

  /**
   * Get destination details
   * @param {string} destinationId 
   * @param {boolean} includeWeather 
   * @param {boolean} includeActivities 
   */
  getDestination: (destinationId, includeWeather = false, includeActivities = false) => 
    api.get(`/destinations/${destinationId}`, {
      params: { include_weather: includeWeather, include_activities: includeActivities }
    }),

  /**
   * Get nearby destinations
   * @param {string} destinationId 
   * @param {number} radiusKm 
   * @param {number} limit 
   */
  getNearbyDestinations: (destinationId, radiusKm = 200, limit = 5) => 
    api.get(`/destinations/${destinationId}/nearby`, {
      params: { radius_km: radiusKm, limit }
    }),

  /**
   * Search locations (autocomplete)
   * @param {string} query 
   * @param {number} limit 
   */
  searchLocations: (query, limit = 10) => 
    api.get('/destinations/search/locations', { 
      params: { query, limit } 
    }),

  /**
   * Get weather forecast
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} days 
   */
  getWeather: (latitude, longitude, days = 7) => 
    api.post('/destinations/weather', { latitude, longitude, days }),

  /**
   * Get current weather
   * @param {number} latitude 
   * @param {number} longitude 
   */
  getCurrentWeather: (latitude, longitude) => 
    api.get('/destinations/weather/current', { 
      params: { latitude, longitude } 
    }),

  /**
   * Update popularity stats (admin only)
   */
  updatePopularityStats: () => api.post('/destinations/update-popularity'),
};