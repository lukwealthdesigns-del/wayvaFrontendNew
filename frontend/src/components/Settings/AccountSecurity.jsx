// components/Settings/AccountSecurity.jsx - Updated with primary color
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import ToggleSwitch from '../Shared/ToggleSwitch';
import SettingsSection from './SettingsSection';

const AccountSecurity = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    faceId: true,
    smsAuthenticator: false,
    googleAuthenticator: false
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Primary color configuration
  const primaryColor = '#064473';
  const primaryHover = '#0a5c9c';
  const primaryLight = 'rgba(6, 68, 115, 0.1)';

  return (
    <>
      <SettingsSection title="Account & Security">
        

        <div className="p-6 space-y-6">
          {/* Coming Soon Banner */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center">
            <FiClock className="w-5 h-5 text-yellow-800 mr-2" />
            <p className="text-yellow-800 text-sm">
              Coming Soon
            </p>
          </div>

          {/* Biometric ID Section */}
          <div className="relative opacity-60">
            <div className="flex items-center mb-4">
              <h3 className="font-bold text-gray-900">Biometric ID</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Face ID</p>
                </div>
                <ToggleSwitch
                  checked={settings.faceId}
                  onChange={() => handleToggle('faceId')}
                  primaryColor={primaryColor}
                  disabled
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Authenticator</p>
                </div>
                <ToggleSwitch
                  checked={settings.smsAuthenticator}
                  onChange={() => handleToggle('smsAuthenticator')}
                  primaryColor={primaryColor}
                  disabled
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Google Authenticator</p>
                </div>
                <ToggleSwitch
                  checked={settings.googleAuthenticator}
                  onChange={() => handleToggle('googleAuthenticator')}
                  primaryColor={primaryColor}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Device Management */}
          <div className="pt-6 border-t border-gray-200 relative opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900">Device Management</h4>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your account on the various devices you own.
                </p>
              </div>
              <button 
                className="px-4 py-2 font-medium rounded-lg transition cursor-not-allowed"
                style={{
                  color: primaryColor,
                  backgroundColor: primaryLight
                }}
                disabled
              >
                Manage
              </button>
            </div>
          </div>

          {/* Deactivate Account */}
          <div className="pt-6 border-t border-gray-200 relative opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900">Deactivate Account</h4>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Temporarily deactivate your account. Easily reactivate when you're ready.
                </p>
              </div>
              <button 
                className="px-4 py-2 font-medium rounded-lg transition cursor-not-allowed"
                style={{
                  color: '#d97706', // Orange-600
                  backgroundColor: 'rgba(217, 119, 6, 0.1)'
                }}
                disabled
              >
                Deactivate
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="pt-6 border-t border-gray-200 relative opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900 text-red-600">Delete Account</h4>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently remove your account and data from Wayva. Proceed with caution.
                </p>
              </div>
              <button 
                className="px-4 py-2 font-medium rounded-lg transition cursor-not-allowed"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white'
                }}
                disabled
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </SettingsSection>
    </>
  );
};

export default AccountSecurity;