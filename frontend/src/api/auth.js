import api from './index';

export const authAPI = {
  /**
   * Register new user
   * @param {Object} data - { email, password, confirm_password, first_name, last_name }
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Login user
   * @param {Object} data - { email, password }
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Refresh access token
   * @param {string} refresh_token 
   */
  refreshToken: (refresh_token) => api.post('/auth/refresh', { refresh_token }),

  /**
   * Logout user
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Verify email with token
   * @param {string} token 
   */
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),

  /**
   * Request password reset
   * @param {string} email 
   */
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),

  /**
   * Get current user from token (for debugging)
   */
  getCurrentUser: () => api.get('/auth/me'),
};