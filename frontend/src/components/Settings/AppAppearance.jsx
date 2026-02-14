// components/Settings/AppAppearance.jsx - Updated with primary color
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import ToggleSwitch from '../Shared/ToggleSwitch';
import SettingsSection from './SettingsSection';

const AppAppearance = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    theme: 'light', // 'light', 'dark', 'auto'
    language: 'en-US',
    fontSize: 'medium'
  });

  const primaryColor = '#064473';
  const primaryLight = 'rgba(6, 68, 115, 0.1)';
  const primaryHover = 'rgba(6, 68, 115, 0.2)';

  // Coming Soon badge component
  const ComingSoonBadge = () => (
    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
      Coming Soon
    </span>
  );

  const themes = [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'auto', name: 'Auto (System)' }
  ];

  const languages = [
    { id: 'en-US', name: 'English (US)' },
    { id: 'en-GB', name: 'English (UK)' },
    { id: 'fr', name: 'Français' },
    { id: 'es', name: 'Español' },
    { id: 'de', name: 'Deutsch' }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' },
    { id: 'xlarge', name: 'Extra Large' }
  ];

  const handleSave = () => {
    console.log('Saving appearance settings:', settings);
    // Add your save logic here
  };

  return (
    <>
      {/* Back Button Header */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-gray-100 rounded-full transition mr-3"
          aria-label="Go back to settings"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">App Appearance</h1>
      </div>

      <SettingsSection title="App Appearance">
        <div className="p-6 space-y-8">
          {/* Coming Soon Banner */}
          {/* <div className="mb-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800 text-sm">
              ⚡ Appearance settings are currently in development
            </p>
          </div> */}

          {/* Theme Selection - Coming Soon */}
          <div className="opacity-60">
            <div className="flex items-center mb-4">
              <h3 className="font-bold text-gray-900">Theme</h3>
              <ComingSoonBadge />
            </div>
            <div className="space-y-3">
              {themes.map((theme) => (
                <div 
                  key={theme.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-xl"
                >
                  <span className="text-gray-900 font-medium">{theme.name}</span>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Selection - Coming Soon */}
          <div className="opacity-60">
            <div className="flex items-center mb-4">
              <h3 className="font-bold text-gray-900">App Language</h3>
              <ComingSoonBadge />
            </div>
            <div className="space-y-3">
              {languages.map((lang) => (
                <div 
                  key={lang.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-xl"
                >
                  <span className="text-gray-900 font-medium">{lang.name}</span>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Font Size - Coming Soon */}
          <div className="opacity-60">
            <div className="flex items-center mb-4">
              <h3 className="font-bold text-gray-900">Font Size</h3>
              <ComingSoonBadge />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fontSizes.map((size) => (
                <div
                  key={size.id}
                  className="p-4 rounded-xl border border-gray-200"
                >
                  <div className="text-center">
                    <div 
                      className={`font-bold ${
                        size.id === 'small' ? 'text-sm' :
                        size.id === 'medium' ? 'text-base' :
                        size.id === 'large' ? 'text-lg' : 'text-xl'
                      } text-gray-400`}
                    >
                      Aa
                    </div>
                    <div className="text-sm mt-1 font-medium text-gray-400">
                      {size.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Settings - Coming Soon */}
          <div className="pt-6 border-t border-gray-200">
            <div className="space-y-4 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-900">Reduce Motion</p>
                    <ComingSoonBadge />
                  </div>
                  <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                </div>
                <ToggleSwitch 
                  checked={false} 
                  onChange={() => {}}
                  disabled
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-900">High Contrast Mode</p>
                    <ComingSoonBadge />
                  </div>
                  <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
                </div>
                <ToggleSwitch 
                  checked={false} 
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] opacity-50 cursor-not-allowed"
            style={{
              backgroundColor: primaryColor,
              color: 'white'
            }}
            disabled
          >
            Save Appearance Settings
          </button>
        </div>
      </SettingsSection>
    </>
  );
};

export default AppAppearance;