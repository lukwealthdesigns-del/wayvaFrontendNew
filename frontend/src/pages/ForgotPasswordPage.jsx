import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../api/auth'; // Import the auth API

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    setTouched({ email: true });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleResendEmail = async () => {
    if (!validateForm()) return;
    
    setResendLoading(true);
    setResendSuccess(false);
    setApiError('');
    
    try {
      // Use the authAPI method for password reset
      const response = await authAPI.requestPasswordReset(formData.email);
      
      // Backend returns 200 even if email doesn't exist (security best practice)
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
      
    } catch (err) {
      console.error('Resend error:', err);
      
      // Handle error - but don't reveal if email exists
      if (err.response?.status === 429) {
        setApiError('Too many requests. Please wait a moment before trying again.');
      } else {
        // Generic message for security
        setApiError('Unable to process request. Please try again later.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the authAPI method for password reset
      const response = await authAPI.requestPasswordReset(formData.email);
      
      // Backend always returns success (200) even if email doesn't exist
      // This is a security feature to prevent email enumeration
      setSuccess(true);
      
    } catch (err) {
      console.error('Forgot password error:', err);
      
      // Handle rate limiting
      if (err.response?.status === 429) {
        setApiError('Too many requests. Please wait a moment before trying again.');
      } else {
        // Generic error message - don't reveal if email exists
        setApiError('Unable to process request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClasses = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#064473] focus:ring-blue-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 transition rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
              <p className="text-gray-600 mt-1 text-sm">We'll send you a reset link</p>
            </div>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Reset link sent!</p>
                <p className="text-green-700 text-sm mt-1">
                  If an account exists with this email, you will receive password reset instructions.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="text-sm text-green-700 hover:text-green-800 font-medium hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <>
                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-1"></span>
                        Sending...
                      </>
                    ) : (
                      'Resend email'
                    )}
                  </button>
                  {resendSuccess && (
                    <span className="text-xs text-green-600 animate-fadeIn">
                      ✓ Sent again
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* API Error */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          </div>
        )}
        
        {/* Instructions - Only show if not success */}
        {!success && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        )}
        
        {/* Form */}
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  className={`${getInputClasses('email')} pl-10`}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
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
                  Sending reset link...
                </span>
              ) : (
                'Send Reset Link'
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
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-2">Didn't receive the email?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  Check your spam or junk folder
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  Make sure you entered the correct email address
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  The link expires after 1 hour
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  Try resending the email using the button above
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;