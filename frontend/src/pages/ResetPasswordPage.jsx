import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../api/auth'; // Import auth API

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    new_password: false,
    confirm_password: false
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError('Invalid reset link. Please request a new password reset.');
      setTokenLoading(false);
      return;
    }

    // Backend doesn't have a dedicated token verification endpoint
    // Token is verified during the reset attempt
    // We'll assume it's valid and show the form
    setTokenValid(true);
    setTokenLoading(false);
    
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'new_password':
        if (!value.trim()) {
          error = 'New password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (value.length > 100) {
          error = 'Password cannot exceed 100 characters';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(value)) {
          error = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          error = 'Password must contain at least one special character';
        }
        break;
      case 'confirm_password':
        if (!value.trim()) {
          error = 'Please confirm your password';
        } else if (value !== formData.new_password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.new_password.trim()) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.new_password)) {
      newErrors.new_password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.new_password)) {
      newErrors.new_password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.new_password)) {
      newErrors.new_password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password)) {
      newErrors.new_password = 'Password must contain at least one special character';
    }
    
    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.confirm_password !== formData.new_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    setTouched({ new_password: true, confirm_password: true });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Backend expects token, new_password, confirm_password
      const response = await authAPI.resetPassword(
        token,
        formData.new_password,
        formData.confirm_password
      );
      
      setSuccess(true);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Reset password error:', err);
      
      // Handle specific backend error responses
      if (err.response?.status === 400) {
        if (err.response?.data?.detail === 'Invalid or expired token') {
          setTokenError('This password reset link has expired or is invalid.');
          setTokenValid(false);
        } else {
          setApiError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
        }
      } else if (err.response?.status === 422) {
        // Validation error
        if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
          const fieldErrors = {};
          err.response.data.detail.forEach(error => {
            if (error.loc && error.loc[1]) {
              fieldErrors[error.loc[1]] = error.msg;
            }
          });
          setErrors(prev => ({ ...prev, ...fieldErrors }));
          setApiError('Please check your password requirements');
        }
      } else {
        setApiError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getInputClasses = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition pr-10 ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#064473] focus:ring-blue-200'
    }`;
  };

  // Loading state
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#064473] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 pt-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 transition rounded-full hover:bg-gray-100 active:bg-gray-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Invalid Link</h1>
              </div>
            </div>
            
            <div className="w-10"></div>
          </div>
        </div>

        <div className="px-6 pt-10">
          <div className="max-w-md mx-auto">
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">{tokenError || 'Invalid or expired reset token'}</p>
                  <p className="text-red-700 text-sm mt-1">
                    The password reset link may have expired or already been used.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="block w-full py-3 bg-[#064473] text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg text-center"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/login"
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition text-center"
              >
                Back to Login
              </Link>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-2">Need help?</h3>
              <p className="text-sm text-gray-600">
                If you continue to have issues, please contact our support team at{' '}
                <a href="mailto:support@wayvatravel.com" className="text-[#064473] hover:underline">
                  support@wayvatravel.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 pt-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 transition rounded-full hover:bg-gray-100 active:bg-gray-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Password Reset</h1>
              </div>
            </div>
            
            <div className="w-10"></div>
          </div>
        </div>

        <div className="px-6 pt-10">
          <div className="max-w-md mx-auto">
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Password Reset Successful!</p>
                  <p className="text-green-700 text-sm mt-1">
                    Your password has been updated successfully. Redirecting to login...
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full py-3 bg-[#064473] text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg text-center"
              >
                Go to Login
              </Link>
              
              <Link
                to="/home"
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition text-center"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/forgot-password')}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 transition rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
              <p className="text-gray-600 mt-1 text-sm">Create a new password</p>
            </div>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* API Error */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          </div>
        )}
        
        {/* Password requirements */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Password Requirements:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${formData.new_password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              At least 8 characters long
            </li>
            <li className="flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[A-Z]/.test(formData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              At least one uppercase letter
            </li>
            <li className="flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[a-z]/.test(formData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              At least one lowercase letter
            </li>
            <li className="flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[0-9]/.test(formData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              At least one number
            </li>
            <li className="flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              At least one special character
            </li>
            <li className="flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${formData.new_password === formData.confirm_password && formData.confirm_password ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              Passwords must match
            </li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword.new_password ? 'text' : 'password'}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter new password"
                className={`${getInputClasses('new_password')} pl-10`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new_password')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex="-1"
              >
                {showPassword.new_password ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.new_password && touched.new_password && (
              <p className="mt-1 text-xs text-red-600">{errors.new_password}</p>
            )}
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword.confirm_password ? 'text' : 'password'}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm new password"
                className={`${getInputClasses('confirm_password')} pl-10`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm_password')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex="-1"
              >
                {showPassword.confirm_password ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirm_password && touched.confirm_password && (
              <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#064473] text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center pt-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;