import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth';
import { usersAPI } from '../api/users';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const { data } = await usersAPI.getProfile();
        setUser(data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to load user:', err);
        // Only clear if token is invalid/expired
        if (err.response?.status === 401) {
          localStorage.clear();
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const { data } = await authAPI.register(userData);
      
      // Store tokens
      localStorage.setItem('access_token', data.tokens.access_token);
      localStorage.setItem('refresh_token', data.tokens.refresh_token);
      
      // Set user and auth state
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: data.user, tokens: data.tokens };
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        if (err.response?.data?.detail === 'User already exists') {
          setError('An account with this email already exists');
        } else if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError('Registration failed. Please check your information.');
        }
      } else {
        setError('Network error. Please try again.');
      }
      
      return { success: false, error: err.response?.data?.detail || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await authAPI.login({ email, password });
      
      // Store tokens
      localStorage.setItem('access_token', data.tokens.access_token);
      localStorage.setItem('refresh_token', data.tokens.refresh_token);
      
      // Set user and auth state
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: data.user, tokens: data.tokens };
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 422) {
        setError('Please enter a valid email and password');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please try again.');
      }
      
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear everything regardless of API response
      localStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const { data } = await usersAPI.updateProfile(profileData);
      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      console.error('Profile update error:', err);
      
      if (err.response?.status === 422) {
        // Handle validation errors
        const errors = {};
        err.response.data.detail?.forEach(error => {
          if (error.loc && error.loc[1]) {
            errors[error.loc[1]] = error.msg;
          }
        });
        setError('Please check your inputs');
        return { success: false, errors, error: 'Validation failed' };
      }
      
      setError(err.response?.data?.detail || 'Failed to update profile');
      return { success: false, error: err.response?.data?.detail || 'Failed to update profile' };
    }
  };

  const updateAvatar = async (file) => {
    try {
      setError(null);
      const { data } = await usersAPI.uploadAvatar(file);
      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload avatar');
      return { success: false, error: err.response?.data?.detail || 'Failed to upload avatar' };
    }
  };

  const verifyEmail = async (token) => {
    try {
      setError(null);
      const { data } = await authAPI.verifyEmail(token);
      // Refresh user data to get updated verification status
      const userResponse = await usersAPI.getProfile();
      setUser(userResponse.data);
      return { success: true, data };
    } catch (err) {
      console.error('Email verification error:', err);
      setError(err.response?.data?.detail || 'Failed to verify email');
      return { success: false, error: err.response?.data?.detail || 'Failed to verify email' };
    }
  };

  const resendVerification = async (email) => {
    try {
      setError(null);
      const { data } = await authAPI.requestPasswordReset(email); // Reuse password reset for verification resend
      return { success: true, data };
    } catch (err) {
      console.error('Resend verification error:', err);
      setError(err.response?.data?.detail || 'Failed to resend verification email');
      return { success: false, error: err.response?.data?.detail || 'Failed to resend verification email' };
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      setError(null);
      const { data } = await authAPI.resetPassword(token, newPassword, confirmPassword);
      return { success: true, data };
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.response?.status === 400) {
        setError(err.response?.data?.detail || 'Invalid or expired reset token');
      } else if (err.response?.status === 422) {
        setError('Password does not meet requirements');
      } else {
        setError('Failed to reset password');
      }
      
      return { success: false, error: err.response?.data?.detail || 'Failed to reset password' };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    updateAvatar,
    verifyEmail,
    resendVerification,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};