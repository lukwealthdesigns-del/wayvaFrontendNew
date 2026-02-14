// pages/OAuthCallbackPage.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const provider = searchParams.get('provider') || localStorage.getItem('social_provider');

      if (token && provider) {
        const result = await handleOAuthCallback(token, provider);
        if (result.success) {
          navigate('/home');
        } else {
          navigate('/login', { state: { error: result.error } });
        }
      } else {
        navigate('/login', { state: { error: 'Social login failed. Please try again.' } });
      }
    };

    handleCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing social login...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;