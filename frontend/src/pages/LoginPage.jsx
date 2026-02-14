// pages/LoginPage.jsx - Fix navigation
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    facebook: false
  });

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
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
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
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    
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
      const response = await login(formData.email, formData.password);
      
      // Check if login was successful
      if (response && response.user) {
        // Force navigation to home
        navigate('/home', { replace: true });
      } else {
        setApiError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setApiError('Invalid email or password');
      } else if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          setApiError(err.response.data.detail);
        } else if (Array.isArray(err.response.data.detail)) {
          const fieldErrors = {};
          err.response.data.detail.forEach(error => {
            if (error.loc && error.loc[1]) {
              fieldErrors[error.loc[1]] = error.msg;
            }
          });
          setErrors(prev => ({ ...prev, ...fieldErrors }));
          setApiError('Please check your inputs');
        }
      } else {
        setApiError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading(prev => ({ ...prev, google: true }));
    setApiError('');
    setTimeout(() => {
      setApiError('Google login coming soon!');
      setSocialLoading(prev => ({ ...prev, google: false }));
    }, 1000);
  };

  const handleFacebookLogin = async () => {
    setSocialLoading(prev => ({ ...prev, facebook: true }));
    setApiError('');
    setTimeout(() => {
      setApiError('Facebook login coming soon!');
      setSocialLoading(prev => ({ ...prev, facebook: false }));
    }, 1000);
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
              <h1 className="text-2xl font-bold text-gray-900">Login</h1>
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
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-5">
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
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-[#064473] text-sm font-medium hover:underline"
            >
              Forgot Password?
            </Link>
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
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-xs">
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#064473] font-medium hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-[#064473] font-medium hover:underline">Privacy Policy</a>
            </p>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 text-xs">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                socialLoading.google ? 'opacity-50' : ''
              }`}
              disabled={loading || socialLoading.google || socialLoading.facebook}
              onClick={handleGoogleLogin}
            >
              {socialLoading.google ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Google</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                socialLoading.facebook ? 'opacity-50' : ''
              }`}
              disabled={loading || socialLoading.google || socialLoading.facebook}
              onClick={handleFacebookLogin}
            >
              {socialLoading.facebook ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Facebook</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#064473] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;