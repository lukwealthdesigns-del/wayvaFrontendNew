import api from './index';

export const usersAPI = {
  /**
   * Get current user profile
   */
  getProfile: () => api.get('/users/me'),

  /**
   * Update user profile
   * @param {Object} data - { first_name, last_name, country, phone_number, gender, date_of_birth, travel_interests, preferred_budget }
   */
  updateProfile: (data) => api.put('/users/me', data),

  /**
   * Update password
   * @param {Object} data - { current_password, new_password, confirm_password }
   */
  updatePassword: (data) => api.post('/users/me/password', data),

  /**
   * Upload profile picture
   * @param {File} file - Image file
   */
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'profile_pictures');
    return api.post('/users/me/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Delete profile picture
   */
  deleteAvatar: () => api.delete('/users/me/avatar'),

  /**
   * Deactivate account
   */
  deactivateAccount: () => api.post('/users/me/deactivate'),

  /**
   * Update user settings
   * @param {Object} data - Settings object
   */
  updateSettings: (data) => api.put('/users/me/settings', data),

  /**
   * Search users (admin only)
   * @param {string} query 
   * @param {number} page 
   * @param {number} pageSize 
   */
  searchUsers: (query, page = 1, pageSize = 20) => 
    api.get('/users/', { params: { query, page, page_size: pageSize } }),

  /**
   * Get user statistics (admin only)
   */
  getUserStats: () => api.get('/users/stats'),
};