// components/Settings/BillingSubscription.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';
import SettingsSection from './SettingsSection';

const BillingSubscription = () => {
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const planFeatures = [
    "Ad-free experience.",
    "Enhanced AI-generated trip itineraries",
    "Priority customer support",
    "Exclusive access to travel articles and guides.",
    "Early access to new Wayva features and updates"
  ];

  // Coming Soon badge component
  const ComingSoonBadge = () => (
    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
      Coming Soon
    </span>
  );

  const handleCancel = () => {
    console.log('Cancelling subscription...');
    setIsSubscribed(false);
    setShowCancelModal(false);
  };

  const handleSubscribe = () => {
    console.log('Subscribing...');
    setIsSubscribed(true);
  };

  return (
    <>
      {/* Back Button Header */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-gray-100 bg-gray-50 rounded-full transition mr-3"
          aria-label="Go back to settings"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        {/* <h1 className="text-lg font-bold text-gray-900">Billing & Subscriptions</h1> */}
      </div>

      <SettingsSection title="Billing & Subscriptions">
        <div className="p-6">
          {/* Coming Soon Banner */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center">
            <span className="text-yellow-800 text-sm">
               Billing and subscription features are currently in development
            </span>
          </div>

          {/* Plan Card */}
          <div className="bg-gradient-to-r from-[#064473] to-[#0a5c9c] rounded-2xl p-6 text-white mb-6 opacity-60">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center">
                  <h3 className="text-xl font-bold mb-1">Premium Adventurer</h3>
                  <ComingSoonBadge />
                </div>
                <p className="text-blue-100">$5.99 / month</p>
              </div>
              {isSubscribed ? (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  Active
                </span>
              ) : null}
            </div>

            <ul className="space-y-2 mb-6">
              {planFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <FiCheck className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscription Status */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 opacity-60">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center">
              Your current plan
              <ComingSoonBadge />
            </h4>
            {isSubscribed ? (
              <>
                <p className="text-gray-600 mb-4">
                  Your subscription will expire on July 22, 2025.
                </p>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition cursor-not-allowed"
                  disabled
                >
                  Cancel Subscription
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  You are currently on the free plan. Upgrade to unlock premium features.
                </p>
                <button
                  onClick={handleSubscribe}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition cursor-not-allowed"
                  disabled
                >
                  Subscribe Now
                </button>
              </>
            )}
          </div>

          {/* Billing History */}
          <div className="opacity-60">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              Billing History
              <ComingSoonBadge />
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Premium Adventurer</p>
                  <p className="text-sm text-gray-600">June 22, 2025</p>
                </div>
                <span className="font-bold text-gray-900">$5.99</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Premium Adventurer</p>
                  <p className="text-sm text-gray-600">May 22, 2025</p>
                </div>
                <span className="font-bold text-gray-900">$5.99</span>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Subscription</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your Premium Adventurer subscription? 
              You'll lose access to premium features at the end of your billing period.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BillingSubscription;