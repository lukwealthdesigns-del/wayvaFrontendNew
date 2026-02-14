// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/Shared/NotificationContext';

import AllActivitiesPage from './pages/AllActivitiesPage';
import ScrollToTop from './components/Shared/ScrollToTop';

import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Main App Pages
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import DiscoverPage from './pages/DiscoverPage';
import SettingsPage from './pages/SettingsPage';

// New Pages
import AIChatPage from './pages/AIChatPage';
import AllDestinationsPage from './pages/AllDestinationsPage';

// Auth Pages
import SignupPage from './pages/SignupPage';
import VerificationPage from './pages/VerificationPage';
import LoginPage from './pages/LoginPage';

// Onboarding Flow Pages
import SplashPage from './pages/SplashPage';
import OnboardingFlowPage from './pages/OnboardingFlowPage';

// Trip Planning & Itinerary Pages
import TripPlannerPage from './pages/TripPlannerPage';
import GeneratingItineraryPage from './pages/GeneratingItineraryPage';
import ItinerarySuccessPage from './pages/ItinerarySuccessPage';
import ItineraryDetailPage from './pages/ItineraryDetailPage';

// Settings Pages
import SettingsSectionPage from './pages/SettingsSectionPage';

// Protected Route
import ProtectedRoute from './pages/ProtectedRoute';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <ScrollToTop />
            <Routes>
              {/* Splash Screen */}
              <Route path="/" element={<SplashPage />} />
              
              {/* Onboarding Flow */}
              <Route path="/onboarding/:slideId" element={<OnboardingFlowPage />} />
              <Route path="/onboarding" element={<Navigate to="/onboarding/1" replace />} />
              
              {/* Auth Pages (Public) */}
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Main App Pages (Protected) */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              
              <Route path="/trips" element={
                <ProtectedRoute>
                  <TripsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/discover" element={
                <ProtectedRoute>
                  <DiscoverPage />
                </ProtectedRoute>
              } />
              
              {/* All Destinations Page */}
              <Route path="/destinations" element={
                <ProtectedRoute>
                  <AllDestinationsPage />
                </ProtectedRoute>
              } />
              
              {/* AI Chat Page */}
              <Route path="/ai-chat" element={
                <ProtectedRoute>
                  <AIChatPage />
                </ProtectedRoute>
              } />
              
              {/* Trip Planning Flow (Protected) */}
              <Route path="/plan-trip" element={
                <ProtectedRoute>
                  <TripPlannerPage />
                </ProtectedRoute>
              } />
              
              <Route path="/generating-itinerary" element={
                <ProtectedRoute>
                  <GeneratingItineraryPage />
                </ProtectedRoute>
              } />
              
              <Route path="/itinerary-success" element={
                <ProtectedRoute>
                  <ItinerarySuccessPage />
                </ProtectedRoute>
              } />

              
              <Route path="/itinerary-detail/:tripId" element={<ItineraryDetailPage />} />
              
              <Route path="/itinerary-detail" element={
                <ProtectedRoute>
                  <ItineraryDetailPage />
                </ProtectedRoute>
              } />
              
              {/* Settings Pages (Protected) */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/settings/:section" element={
                <ProtectedRoute>
                  <SettingsSectionPage />
                </ProtectedRoute>
              } />
              
              {/* Activities Page */}
              <Route path="/activities" element={
                <ProtectedRoute>
                  <AllActivitiesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />


              {/* Redirects */}
              <Route path="/old-onboarding" element={<Navigate to="/onboarding" replace />} />
              
              {/* Catch-all route - Redirect to splash for unauthenticated, home for authenticated */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;