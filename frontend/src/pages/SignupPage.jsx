import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // Changed from signup to register (matches backend)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

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
      case 'first_name':
      case 'last_name':
        if (!value.trim()) {
          error = 'This field is required';
        } else if (value.trim().length < 1) {
          error = 'Minimum 1 character required';
        } else if (value.trim().length > 100) {
          error = 'Maximum 100 characters';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
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
        } else if (value !== formData.password) {
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
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Password must contain at least one lowercase letter';
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Password must contain at least one number';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = 'Password must contain at least one special character';
    if (!formData.confirm_password.trim()) newErrors.confirm_password = 'Please confirm your password';
    else if (formData.confirm_password !== formData.password) newErrors.confirm_password = 'Passwords do not match';
    
    setErrors(newErrors);
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      confirm_password: true
    });
    
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
      const signupData = {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      
      // Backend returns AuthResponse with user and tokens
      const response = await register(signupData);
      
      // Backend auto-logs in users after registration
      if (response?.user) {
        setEmailVerificationSent(true);
        setShowSuccessPopup(true);
        
        // Clear form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirm_password: ''
        });
      }
      
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific backend error responses
      if (err.response?.status === 400) {
        if (err.response?.data?.detail === 'User already exists') {
          setApiError('An account with this email already exists. Please login.');
        } else if (typeof err.response.data.detail === 'string') {
          setApiError(err.response.data.detail);
        } else if (Array.isArray(err.response.data.detail)) {
          // Map validation errors to form fields
          const fieldErrors = {};
          err.response.data.detail.forEach(error => {
            if (error.loc && error.loc[1]) {
              const field = error.loc[1];
              if (field === 'password' || field === 'email' || field === 'first_name' || field === 'last_name' || field === 'confirm_password') {
                fieldErrors[field] = error.msg;
              }
            }
          });
          
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...fieldErrors }));
            setApiError('Please correct the errors below');
          } else {
            setApiError('Registration failed. Please check your information.');
          }
        }
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClasses = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#064473] focus:ring-blue-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Account Created Successfully!
              </h3>
              <p className="text-gray-600 mb-2">
                Welcome to Wayva! You are now logged in.
              </p>
              {emailVerificationSent && (
                <p className="text-sm text-blue-600 mb-4">
                  Please check your email to verify your account.
                </p>
              )}
              <button
                onClick={() => navigate('/home')}
                className="w-full py-3 bg-[#064473] text-white rounded-xl font-bold hover:opacity-90 transition"
              >
                Go to Home
              </button>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="mt-3 text-gray-600 hover:text-gray-800"
              >
                Stay on this page
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-6 pt-6">
        <div className="flex items-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 transition rounded-full hover:bg-gray-100 active:bg-gray-200 border border-gray-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Sign up</h1>
              <p className="text-gray-600 mt-1 text-sm">Kindly input your details</p>
            </div>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-6">
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{apiError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="First Name"
                className={getInputClasses('first_name')}
                disabled={loading}
              />
              {errors.first_name && touched.first_name && (
                <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Last Name"
                className={getInputClasses('last_name')}
                disabled={loading}
              />
              {errors.last_name && touched.last_name && (
                <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className={getInputClasses('email')}
              disabled={loading}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`${getInputClasses('password')} pr-10`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && touched.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            ) : (
              <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>Minimum 8 characters</li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>At least one uppercase letter</li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>At least one lowercase letter</li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>At least one number</li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}>At least one special character</li>
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm password"
                className={`${getInputClasses('confirm_password')} pr-10`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirm_password && touched.confirm_password && (
              <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>
            )}
          </div>

          <div className="h-px bg-gray-300 my-4"></div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#064473] text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center space-y-3 pt-3">
            <p className="text-gray-600 text-xs">
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#064473] font-medium hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-[#064473] font-medium hover:underline">Privacy Policy</a>
            </p>
            
            <p className="text-gray-600 text-sm">
              Have an account?{' '}
              <Link to="/login" className="text-[#064473] font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;