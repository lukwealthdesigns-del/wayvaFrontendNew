// utils/validation.js - Backend-Compatible Validation

/**
 * Email validation - matches backend regex
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * Password validation - matches backend requirements
 * Backend requires: min 8 chars, uppercase, lowercase, number, special char
 * @param {string} password
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }

  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password.length > 100) {
    errors.push('Password cannot exceed 100 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Simple password check for login (no complexity requirements)
 * @param {string} password 
 * @returns {boolean}
 */
export const isPasswordPresent = (password) => {
  return password && password.trim().length > 0;
};

/**
 * Phone number validation - E.164 format support
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  // E.164 format: +[1-9][0-9]{1,14}
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone.replace(/\s/g, ''));
};

/**
 * Required field validation
 * @param {string} value
 * @returns {boolean}
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Date validation - must be in YYYY-MM-DD format
 * @param {string} date 
 * @returns {boolean}
 */
export const validateDate = (date) => {
  if (!date) return false;
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(date)) return false;
  
  const d = new Date(date);
  const isValidDate = d instanceof Date && !isNaN(d);
  return isValidDate;
};

/**
 * Future date validation
 * @param {string} date - YYYY-MM-DD
 * @returns {boolean}
 */
export const isFutureDate = (date) => {
  if (!validateDate(date)) return false;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

/**
 * Date range validation
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateDateRange = (startDate, endDate) => {
  if (!validateDate(startDate) || !validateDate(endDate)) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (duration > 90) {
    return { isValid: false, error: 'Trip duration cannot exceed 90 days' };
  }
  
  return { isValid: true, error: null, duration };
};

/**
 * Destination validation
 * @param {string} destination 
 * @returns {boolean}
 */
export const validateDestination = (destination) => {
  if (!destination) return false;
  const trimmed = destination.trim();
  return trimmed.length >= 2 && trimmed.length <= 200;
};

/**
 * Budget amount validation
 * @param {number} amount 
 * @returns {boolean}
 */
export const validateBudgetAmount = (amount) => {
  if (amount === null || amount === undefined) return false;
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num <= 1000000;
};

/**
 * Currency code validation - ISO 4217
 * @param {string} currency 
 * @returns {boolean}
 */
export const validateCurrency = (currency) => {
  if (!currency) return false;
  const re = /^[A-Z]{3}$/;
  return re.test(currency);
};

/**
 * Travel interests validation
 * @param {string[]} interests 
 * @returns {boolean}
 */
export const validateTravelInterests = (interests) => {
  if (!Array.isArray(interests)) return false;
  return interests.length > 0 && interests.length <= 10;
};

/**
 * Trip type validation
 * @param {string} tripType 
 * @returns {boolean}
 */
export const validateTripType = (tripType) => {
  const validTypes = ['only_me', 'couple', 'family', 'friends', 'work'];
  return validTypes.includes(tripType);
};

/**
 * Budget type validation
 * @param {string} budgetType 
 * @returns {boolean}
 */
export const validateBudgetType = (budgetType) => {
  const validTypes = ['budget_friendly', 'balanced', 'luxury', 'flexible'];
  return validTypes.includes(budgetType);
};

/**
 * Gender validation
 * @param {string} gender 
 * @returns {boolean}
 */
export const validateGender = (gender) => {
  if (!gender) return true; // Optional
  const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
  return validGenders.includes(gender);
};

/**
 * Card number validation (Luhn algorithm)
 * @param {string} number 
 * @returns {boolean}
 */
export const validateCardNumber = (number) => {
  if (!number) return false;
  const cleaned = number.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Expiry date validation (MM/YY format)
 * @param {string} expiry 
 * @returns {boolean}
 */
export const validateExpiryDate = (expiry) => {
  if (!expiry) return false;
  const re = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!re.test(expiry)) return false;
  
  const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};

/**
 * CVV validation
 * @param {string} cvv 
 * @returns {boolean}
 */
export const validateCVV = (cvv) => {
  if (!cvv) return false;
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Coordinates validation
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
export const validateCoordinates = (latitude, longitude) => {
  const isValidLat = latitude >= -90 && latitude <= 90;
  const isValidLng = longitude >= -180 && longitude <= 180;
  return isValidLat && isValidLng;
};

/**
 * Sanitize input - remove dangerous characters
 * @param {string} input 
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input.trim().replace(/[<>{}[\]\\]/g, '');
};