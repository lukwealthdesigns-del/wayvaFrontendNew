// services/api.js - Central API Service Export
import api from '../api/index';
import { authAPI } from '../api/auth';
import { usersAPI } from '../api/users';
import { tripsAPI } from '../api/trips';
import { destinationsAPI } from '../api/destinations';
import { aiAPI } from '../api/ai';
import { uploadsAPI } from '../api/uploads';

// Export individual APIs
export {
  api,
  authAPI,
  usersAPI,
  tripsAPI,
  destinationsAPI,
  aiAPI,
  uploadsAPI,
};

// Export combined API object for convenience
const API = {
  auth: authAPI,
  users: usersAPI,
  trips: tripsAPI,
  destinations: destinationsAPI,
  ai: aiAPI,
  uploads: uploadsAPI,
};

export default API;