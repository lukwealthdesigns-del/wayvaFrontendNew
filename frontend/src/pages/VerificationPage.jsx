import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/Layout/AuthLayout';
import AuthHeader from '../components/Auth/AuthHeader';
import VerificationCode from '../components/Auth/VerificationCode';

const VerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Get email from location state (from signup) or localStorage
  useEffect(() => {
    // Check location state first
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Try to get from localStorage (set during registration)
      const storedEmail = localStorage.getItem('verification_email');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [location.state]);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerificationComplete = async (code) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // Backend expects token in request body
      const result = await verifyEmail(code);
      
      if (result.success) {
        setSuccess('Email verified successfully! Redirecting...');
        
        // Clear stored email
        localStorage.removeItem('verification_email');
        
        // Navigate to home after successful verification
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error('Verification error:', err);
      
      // Handle specific backend error responses
      if (err.response?.status === 401) {
        setError('Invalid or expired verification code. Please request a new one.');
      } else if (err.response?.status === 400) {
        if (err.response?.data?.detail === 'Invalid verification token') {
          setError('Invalid verification code. Please check and try again.');
        } else {
          setError(err.response?.data?.detail || 'Verification failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !email) return;
    
    setError('');
    setSuccess('');
    setIsResending(true);
    
    try {
      // Backend expects email in request body
      const result = await resendVerification(email);
      
      if (result.success) {
        setSuccess('Verification code resent successfully!');
        setTimeLeft(59);
        setCanResend(false);
      }
    } catch (err) {
      console.error('Resend error:', err);
      
      if (err.response?.status === 404) {
        setError('No account found with this email address.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else {
        setError(err.response?.data?.detail || 'Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AuthLayout showBackButton={true} onBack={() => navigate(-1)}>
      <AuthHeader 
        title="Verify Email" 
        subtitle="Please verify your email address"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      <div className="mb-8">
        <p className="text-gray-600">
          We've sent a verification code to{' '}
          <span className="font-semibold text-gray-900">{email || 'your email'}</span>
        </p>
        <p className="text-gray-600 mt-1">
          Enter the 4-digit code to verify your account.
        </p>
      </div>

      {/* Verification Code Input */}
      <VerificationCode 
        length={4} 
        onComplete={handleVerificationComplete}
        disabled={isLoading || isResending}
      />

      {/* Resend Code Section */}
      <div className="mt-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">Didn't receive the code?</p>
          <button
            onClick={handleResendCode}
            disabled={!canResend || isLoading || isResending || !email}
            className={`font-medium ${
              canResend && !isLoading && !isResending && email
                ? 'text-[#064473] hover:text-[#043254]' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
        {!canResend && (
          <p className="text-center text-gray-500 text-sm">
            Resend code in {formatTime(timeLeft)}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-6"></div>

      {/* Manual Verify Button (fallback) */}
      <button
        onClick={() => handleVerificationComplete('')}
        disabled={isLoading || isResending}
        className="w-full py-4 bg-[#064473] text-white rounded-xl font-bold text-lg hover:bg-[#043254] transition shadow-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
            Verifying...
          </span>
        ) : (
          'Verify Email'
        )}
      </button>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Check your spam folder if you don't see the email.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-gray-600 text-xs">
          By continuing, you agree to our{' '}
          <a href="#" className="text-[#064473] font-medium hover:underline">Terms of Service</a> and{' '}
          <a href="#" className="text-[#064473] font-medium hover:underline">Privacy Policy</a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerificationPage;