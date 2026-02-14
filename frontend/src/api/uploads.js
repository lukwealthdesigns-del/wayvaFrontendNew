import api from './index';

export const uploadsAPI = {
  /**
   * Upload single image
   * @param {File} file - Image file
   * @param {string} folder - Cloudinary folder
   * @param {Object} transformation - Image transformation options
   */
  uploadImage: (file, folder = 'wayva', transformation = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (transformation) {
      formData.append('transformation', JSON.stringify(transformation));
    }
    return api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Upload image from URL
   * @param {string} imageUrl 
   * @param {string} folder 
   * @param {Object} transformation 
   */
  uploadImageFromUrl: (imageUrl, folder = 'wayva', transformation = null) => {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('folder', folder);
    if (transformation) {
      formData.append('transformation', JSON.stringify(transformation));
    }
    return api.post('/uploads/image/url', formData);
  },

  /**
   * Delete image
   * @param {string} imageUrl 
   */
  deleteImage: (imageUrl) => {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    return api.delete('/uploads/image', { data: formData });
  },

  /**
   * Get image information
   * @param {string} publicId 
   */
  getImageInfo: (publicId) => 
    api.get('/uploads/image/info', { params: { public_id: publicId } }),

  /**
   * Generate image URL with transformations
   * @param {string} publicId 
   * @param {Object} transformation 
   */
  generateImageUrl: (publicId, transformation = null) => {
    const formData = new FormData();
    formData.append('public_id', publicId);
    if (transformation) {
      formData.append('transformation', JSON.stringify(transformation));
    }
    return api.post('/uploads/image/generate-url', formData);
  },

  /**
   * Upload multiple images for a trip
   * @param {string} tripId 
   * @param {File[]} files 
   */
  uploadTripImages: (tripId, files) => {
    const formData = new FormData();
    formData.append('trip_id', tripId);
    files.forEach((file) => formData.append('files', file));
    return api.post('/uploads/trip-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};