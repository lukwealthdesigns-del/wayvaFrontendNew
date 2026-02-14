// components/Settings/PersonalInfoForm.jsx - Updated with backend API integration
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiUpload, FiX, FiSave, FiEdit2, FiMail, FiPhone, FiGlobe, FiUser, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../components/Shared/NotificationContext';
import { usersAPI } from '../../api/users';
import { uploadsAPI } from '../../api/uploads';

const PersonalInfoForm = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef(null);
  
  const primaryColor = '#064473';
  const primaryLight = 'rgba(6, 68, 115, 0.1)';
  const primaryHover = '#0a5c9c';
  const primaryGradient = 'linear-gradient(135deg, #064473 0%, #0a6db1 100%)';
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    country: '',
    phone_number: '',
    gender: '',
    date_of_birth: ''
  });

  // Profile picture states
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Get initials for profile picture fallback
  const getInitials = () => {
    const firstName = formData.first_name || '';
    const lastName = formData.last_name || '';
    if (!firstName && !lastName) return 'U';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  // Fetch user data from backend
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsFetching(true);
    try {
      const response = await usersAPI.getProfile();
      const userData = response.data;
      
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        country: userData.country || '',
        phone_number: userData.phone_number || '',
        gender: userData.gender || '',
        date_of_birth: userData.date_of_birth || ''
      });
      
      if (userData.profile_picture) {
        setProfilePreview(userData.profile_picture);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
        logout();
      } else {
        showError('Failed to load profile data');
      }
    } finally {
      setIsFetching(false);
    }
  };

  // Handle profile picture selection
  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showError('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }

    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Auto-upload to backend
    await handleImageUpload(file);
  };

  // Handle image upload to backend
  const handleImageUpload = async (file = profileImage) => {
    if (!file) return;
    
    setIsUploadingImage(true);
    
    try {
      const response = await usersAPI.uploadAvatar(file);
      showSuccess('Profile picture updated successfully!');
      
      // Update preview with Cloudinary URL
      setProfilePreview(response.data.profile_picture);
      
      // Update user context
      await fetchUserData();
      updateUser(response.data);
      
      setShowImageModal(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
        logout();
      } else {
        showError(error.response?.data?.detail || 'Failed to upload image');
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove profile picture
  const handleRemoveImage = async () => {
    try {
      const response = await usersAPI.deleteAvatar();
      setProfileImage(null);
      setProfilePreview(null);
      showSuccess('Profile picture removed');
      
      // Update user context
      await fetchUserData();
      updateUser(response.data);
      
      setShowImageModal(false);
    } catch (error) {
      console.error('Error removing image:', error);
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
        logout();
      } else {
        showError(error.response?.data?.detail || 'Failed to remove image');
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'phone_number':
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid phone number (E.164 format)';
        }
        break;
      case 'date_of_birth':
        if (value) {
          const dob = new Date(value);
          const today = new Date();
          if (dob > today) {
            error = 'Date of birth cannot be in the future';
          }
        }
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.phone_number && !/^\+?[1-9]\d{1,14}$/.test(formData.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }
    
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      if (dob > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare update data (only non-empty fields)
      const updateData = {};
      if (formData.country?.trim()) updateData.country = formData.country.trim();
      if (formData.phone_number?.trim()) updateData.phone_number = formData.phone_number.trim();
      if (formData.gender) updateData.gender = formData.gender;
      if (formData.date_of_birth) updateData.date_of_birth = formData.date_of_birth;
      
      // Only make API call if there are fields to update
      if (Object.keys(updateData).length > 0) {
        const response = await usersAPI.updateProfile(updateData);
        showSuccess('Profile updated successfully!');
        
        // Update form data with response
        const updatedUser = response.data;
        setFormData(prev => ({
          ...prev,
          country: updatedUser.country || '',
          phone_number: updatedUser.phone_number || '',
          gender: updatedUser.gender || '',
          date_of_birth: updatedUser.date_of_birth || ''
        }));
        
        // Update user context
        updateUser(updatedUser);
      } else {
        showSuccess('No changes to save');
      }
      
      setIsEditing(false);
      setErrors({});
      setTouched({});
      
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
        logout();
      } else if (error.response?.status === 422) {
        // Handle validation errors
        const validationErrors = error.response.data.detail;
        if (Array.isArray(validationErrors)) {
          const fieldErrors = {};
          validationErrors.forEach(err => {
            if (err.loc && err.loc[1]) {
              fieldErrors[err.loc[1]] = err.msg;
            }
          });
          setErrors(fieldErrors);
          showError('Please check your inputs');
        } else {
          showError(error.response?.data?.detail || 'Failed to update profile');
        }
      } else {
        showError(error.response?.data?.detail || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClasses = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const baseClasses = 'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition';
    
    if (hasError) {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-200`;
    }
    
    return `${baseClasses} border-gray-300 focus:border-[#064473] focus:ring-[#06447320]`;
  };

  const formatGenderDisplay = (gender) => {
    if (!gender) return 'Not set';
    return gender.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isFetching) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#064473] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div 
        className="px-6 py-4 border-b border-gray-100 flex items-center"
        style={{ borderLeft: '4px solid #064473' }}
      >
        <button
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition mr-3"
          aria-label="Go back to settings"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 
          className="text-lg font-bold"
          style={{ color: primaryColor }}
        >
          Personal Info
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            {/* Profile Image Container */}
            <div 
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative"
              style={{ boxShadow: '0 4px 20px rgba(6, 68, 115, 0.2)' }}
            >
              {profilePreview ? (
                <img 
                  src={profilePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: primaryGradient }}
                >
                  <span className="text-white text-3xl font-bold">
                    {getInitials()}
                  </span>
                </div>
              )}
              
              {/* Edit Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FiCamera className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* Edit Button (visible on mobile) */}
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-200 md:hidden"
              style={{ backgroundColor: primaryColor }}
            >
              <FiCamera className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* Profile Picture Actions */}
          <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-5 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
              style={{
                backgroundColor: primaryColor,
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = primaryHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = primaryColor;
              }}
            >
              <FiUpload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
            
            {profilePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-5 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                <FiX className="w-4 h-4" />
                <span>Remove</span>
              </button>
            )}
          </div>
          
          {isUploadingImage && (
            <div className="mt-3 text-sm font-medium" style={{ color: primaryColor }}>
              <span className="animate-pulse">Uploading image...</span>
            </div>
          )}
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/jpeg,image/jpg,image/png,image/gif"
            className="hidden"
          />
        </div>

        <div className="space-y-6">
          {/* Full Name - Not Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FiUser className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
              Full Name
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="px-4 py-3 rounded-xl flex items-center"
                style={{ backgroundColor: primaryLight }}
              >
                <span className="text-gray-900 font-medium">{formData.first_name}</span>
              </div>
              <div 
                className="px-4 py-3 rounded-xl flex items-center"
                style={{ backgroundColor: primaryLight }}
              >
                <span className="text-gray-900 font-medium">{formData.last_name}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Name cannot be changed</p>
          </div>

          {/* Email - Not Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FiMail className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
              Email
            </label>
            <div 
              className="px-4 py-3 rounded-xl flex items-center"
              style={{ backgroundColor: primaryLight }}
            >
              <FiMail className="w-4 h-4 mr-3" style={{ color: primaryColor }} />
              <span className="text-gray-900 font-medium">{formData.email}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Country - Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FiGlobe className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
              Country
            </label>
            {isEditing ? (
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-[#064473] focus:ring-[#06447320] transition"
                disabled={loading}
                placeholder="Enter your country"
              />
            ) : (
              <div 
                className="px-4 py-3 rounded-xl flex items-center"
                style={{ backgroundColor: primaryLight }}
              >
                <FiGlobe className="w-4 h-4 mr-3" style={{ color: primaryColor }} />
                <span className="text-gray-900 font-medium">{formData.country || 'Not set'}</span>
              </div>
            )}
          </div>

          {/* Phone Number - Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FiPhone className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
              Phone Number
            </label>
            {isEditing ? (
              <>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses('phone_number')}
                  disabled={loading}
                  placeholder="+1234567890"
                />
                {errors.phone_number && touched.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
              </>
            ) : (
              <div 
                className="px-4 py-3 rounded-xl flex items-center"
                style={{ backgroundColor: primaryLight }}
              >
                <FiPhone className="w-4 h-4 mr-3" style={{ color: primaryColor }} />
                <span className="text-gray-900 font-medium">{formData.phone_number || 'Not set'}</span>
              </div>
            )}
          </div>

          {/* Gender - Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            {isEditing ? (
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={handleChange}
                      className="w-4 h-4"
                      style={{ accentColor: primaryColor }}
                      disabled={loading}
                    />
                    <span className="ml-2 text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div 
                className="px-4 py-3 rounded-xl inline-block"
                style={{ backgroundColor: primaryLight }}
              >
                <span className="text-gray-900 font-medium">
                  {formatGenderDisplay(formData.gender)}
                </span>
              </div>
            )}
          </div>

          {/* Date of Birth - Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
              Date of Birth
            </label>
            {isEditing ? (
              <>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses('date_of_birth')}
                  disabled={loading}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.date_of_birth && touched.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                )}
              </>
            ) : (
              <div 
                className="px-4 py-3 rounded-xl flex items-center"
                style={{ backgroundColor: primaryLight }}
              >
                <FiCalendar className="w-4 h-4 mr-3" style={{ color: primaryColor }} />
                <span className="text-gray-900 font-medium">
                  {formData.date_of_birth ? 
                    new Date(formData.date_of_birth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    : 'Not set'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                    setTouched({});
                    fetchUserData();
                  }}
                  className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563'
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center"
                  style={{
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center"
                style={{
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
              >
                <FiEdit2 className="w-5 h-5 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Image Selection Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-lg mr-3 flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FiCamera className="w-5 h-5 text-white" />
                </div>
                <h3 
                  className="text-lg font-bold"
                  style={{ color: primaryColor }}
                >
                  Update Profile Picture
                </h3>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div 
                  className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4"
                  style={{ boxShadow: '0 4px 20px rgba(6, 68, 115, 0.2)' }}
                >
                  {profilePreview ? (
                    <img 
                      src={profilePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: primaryGradient }}
                    >
                      <span className="text-white text-xl font-bold">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm" style={{ color: primaryColor }}>
                  {profilePreview ? 'Current selection' : 'No image selected'}
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="w-full py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                >
                  <FiUpload className="w-5 h-5" />
                  <span>Choose from Gallery</span>
                </button>
                
                {profileImage && (
                  <button
                    type="button"
                    onClick={() => handleImageUpload()}
                    disabled={isUploadingImage}
                    className="w-full py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: '#16a34a',
                      color: 'white'
                    }}
                  >
                    {isUploadingImage ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FiUpload className="w-5 h-5" />
                        <span>Upload Picture</span>
                      </>
                    )}
                  </button>
                )}
                
                {profilePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="w-full py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563'
                    }}
                  >
                    Remove Current Picture
                  </button>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-center" style={{ color: primaryColor }}>
                  Supported formats: JPG, PNG, GIF • Max size: 5MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoForm;