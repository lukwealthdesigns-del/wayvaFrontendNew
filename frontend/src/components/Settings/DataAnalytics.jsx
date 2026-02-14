// components/Settings/DataAnalytics.jsx - Updated with icons
import React, { useState } from 'react';
import { 
  FiBarChart2, 
  FiAlertTriangle, 
  FiTarget, 
  FiDownload, 
  FiTrash2, 
  FiSearch, 
  FiInfo,
  FiClock,
  FiDatabase,
  FiSettings
} from 'react-icons/fi';
import ToggleSwitch from '../Shared/ToggleSwitch';
import SettingsSection from './SettingsSection';

const DataAnalytics = () => {
  const [settings, setSettings] = useState({
    dataUsage: true,
    personalizedAds: true,
    analytics: true,
    crashReports: false
  });

  const primaryColor = '#064473';
  const primaryLight = 'rgba(6, 68, 115, 0.1)';
  const primaryHover = '#0a5c9c';
  const secondaryLight = 'rgba(6, 68, 115, 0.05)';

  const handleDownloadData = () => {
    console.log('Downloading user data...');
    // Simulate data download
    alert('Your data is being prepared. You will receive it via email within 24 hours.');
  };

  const handleClearCache = () => {
    console.log('Clearing cache...');
    alert('Cache cleared successfully.');
  };

  const handleDeleteSearchHistory = () => {
    console.log('Deleting search history...');
    alert('Search history deleted successfully.');
  };

  return (
    <SettingsSection title="Data & Analytics">
      <div className="p-6 space-y-8">
        {/* Data Usage */}
        <div>
          <div className="flex items-center mb-4">
            <FiBarChart2 
              className="w-5 h-5 mr-3" 
              style={{ color: primaryColor }}
            />
            <h3 
              className="font-bold"
              style={{ color: primaryColor }}
            >
              Data Usage
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            Control how your data is used for analytics. Customize your preferences.
          </p>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-gray-50">
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">Usage Analytics</p>
                <p className="text-sm text-gray-600">
                  Help us improve Wayva by sharing usage data
                </p>
              </div>
              <ToggleSwitch
                checked={settings.dataUsage}
                onChange={() => setSettings({...settings, dataUsage: !settings.dataUsage})}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-gray-50">
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">Crash Reports</p>
                <p className="text-sm text-gray-600">
                  Automatically send crash reports to help fix issues
                </p>
              </div>
              <ToggleSwitch
                checked={settings.crashReports}
                onChange={() => setSettings({...settings, crashReports: !settings.crashReports})}
              />
            </div>
          </div>
        </div>

        {/* Ad Preferences */}
        <div 
          className="pt-6 border-t border-gray-200"
          style={{ borderTopColor: primaryLight }}
        >
          <div className="flex items-center mb-6">
            <FiTarget 
              className="w-5 h-5 mr-3" 
              style={{ color: primaryColor }}
            />
            <div className="flex-1">
              <h3 
                className="font-bold mb-2"
                style={{ color: primaryColor }}
              >
                Ad Preferences
              </h3>
              <p className="text-gray-600">
                Manage ad personalization settings. Tailor your ad experience.
              </p>
            </div>
            <ToggleSwitch
              checked={settings.personalizedAds}
              onChange={() => setSettings({...settings, personalizedAds: !settings.personalizedAds})}
            />
          </div>
          <div className="p-4 rounded-xl flex items-start" style={{ backgroundColor: secondaryLight }}>
            <FiInfo 
              className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" 
              style={{ color: primaryColor }}
            />
            <p className="text-sm" style={{ color: primaryColor }}>
              <span className="font-medium">Note:</span> When enabled, you'll see ads that are more relevant to your interests based on your activity.
            </p>
          </div>
        </div>

        {/* Download My Data */}
        <div 
          className="pt-6 border-t border-gray-200"
          style={{ borderTopColor: primaryLight }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FiDownload 
                  className="w-5 h-5 mr-3" 
                  style={{ color: primaryColor }}
                />
                <h3 
                  className="font-bold"
                  style={{ color: primaryColor }}
                >
                  Download My Data
                </h3>
              </div>
              <p className="text-gray-600">
                Request a copy of your data. Your information, your control.
              </p>
            </div>
            <button
              onClick={handleDownloadData}
              className="px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap flex items-center justify-center"
              style={{
                backgroundColor: primaryColor,
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = primaryHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = primaryColor;
              }}
            >
              <FiDownload className="w-5 h-5 mr-2" />
              Download Data
            </button>
          </div>
          <div className="p-4 rounded-xl flex items-start" style={{ backgroundColor: secondaryLight }}>
            <FiClock 
              className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" 
              style={{ color: primaryColor }}
            />
            <p className="text-sm" style={{ color: primaryColor }}>
              <span className="font-medium">Processing Time:</span> Your data will be prepared and sent to your email within 24 hours.
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div 
          className="pt-6 border-t border-gray-200"
          style={{ borderTopColor: primaryLight }}
        >
          <div className="flex items-center mb-6">
            <FiSettings 
              className="w-5 h-5 mr-3" 
              style={{ color: primaryColor }}
            />
            <h3 
              className="font-bold"
              style={{ color: primaryColor }}
            >
              Data Management
            </h3>
          </div>
          <div className="space-y-4">
            <button 
              onClick={handleClearCache}
              className="w-full text-left p-5 border rounded-xl transition-all duration-200 hover:scale-[1.01] group"
              style={{
                borderColor: 'rgba(6, 68, 115, 0.2)',
                backgroundColor: settings.dataUsage ? secondaryLight : 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = primaryColor;
                e.currentTarget.style.backgroundColor = primaryLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(6, 68, 115, 0.2)';
                e.currentTarget.style.backgroundColor = settings.dataUsage ? secondaryLight : 'white';
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-lg mr-4 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{ backgroundColor: primaryLight }}
                  >
                    <FiTrash2 
                      className="w-5 h-5" 
                      style={{ color: primaryColor }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Clear Cache</p>
                    <p className="text-sm text-gray-600">Free up storage space by removing temporary files</p>
                  </div>
                </div>
                <span 
                  className="font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                  style={{
                    color: primaryColor,
                    backgroundColor: primaryLight
                  }}
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Clear Now
                </span>
              </div>
            </button>
            
            <button 
              onClick={handleDeleteSearchHistory}
              className="w-full text-left p-5 border rounded-xl transition-all duration-200 hover:scale-[1.01] group"
              style={{
                borderColor: 'rgba(6, 68, 115, 0.2)',
                backgroundColor: settings.dataUsage ? secondaryLight : 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = primaryColor;
                e.currentTarget.style.backgroundColor = primaryLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(6, 68, 115, 0.2)';
                e.currentTarget.style.backgroundColor = settings.dataUsage ? secondaryLight : 'white';
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-lg mr-4 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{ backgroundColor: primaryLight }}
                  >
                    <FiSearch 
                      className="w-5 h-5" 
                      style={{ color: '#dc2626' }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Delete Search History</p>
                    <p className="text-sm text-gray-600">Remove all saved searches and browsing history</p>
                  </div>
                </div>
                <span 
                  className="font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                  style={{
                    color: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)'
                  }}
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Data Usage Summary */}
        <div className="pt-6">
          <div 
            className="p-5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 68, 115, 0.05) 0%, rgba(6, 68, 115, 0.1) 100%)',
              border: '1px solid rgba(6, 68, 115, 0.1)'
            }}
          >
            <div className="flex items-center mb-4">
              <FiDatabase 
                className="w-5 h-5 mr-3" 
                style={{ color: primaryColor }}
              />
              <h4 
                className="font-bold"
                style={{ color: primaryColor }}
              >
                Your Data Usage Summary
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Data shared for analytics</span>
                <span className="font-medium" style={{ color: primaryColor }}>
                  {settings.dataUsage ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Personalized ads</span>
                <span className="font-medium" style={{ color: primaryColor }}>
                  {settings.personalizedAds ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Crash reports</span>
                <span className="font-medium" style={{ color: primaryColor }}>
                  {settings.crashReports ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};

export default DataAnalytics;