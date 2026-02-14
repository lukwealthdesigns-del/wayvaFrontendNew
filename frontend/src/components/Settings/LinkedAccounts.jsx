// components/Settings/LinkedAccounts.jsx
import React, { useState } from 'react';
import { FaGoogle, FaApple, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import SettingsSection from './SettingsSection';

const LinkedAccounts = () => {
  const [accounts, setAccounts] = useState([
    { id: 1, platform: 'Google', connected: true, icon: FaGoogle, color: 'text-red-500' },
    { id: 2, platform: 'Apple', connected: true, icon: FaApple, color: 'text-gray-900' },
    { id: 3, platform: 'Facebook', connected: false, icon: FaFacebook, color: 'text-blue-600' },
    { id: 4, platform: 'Twitter', connected: false, icon: FaTwitter, color: 'text-blue-400' },
    { id: 5, platform: 'Instagram', connected: false, icon: FaInstagram, color: 'text-pink-600' }
  ]);

  const handleToggle = (id) => {
    setAccounts(accounts.map(account => 
      account.id === id 
        ? { ...account, connected: !account.connected } 
        : account
    ));
  };

  return (
    <SettingsSection title="Linked Accounts">
      <div className="p-6">
        <div className="space-y-4">
          {accounts.map((account) => {
            const Icon = account.icon;
            return (
              <div 
                key={account.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <Icon className={`w-8 h-8 ${account.color}`} />
                  <span className="font-medium text-gray-900">{account.platform}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {account.connected ? (
                    <>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Connected
                      </span>
                      <button
                        onClick={() => handleToggle(account.id)}
                        className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleToggle(account.id)}
                      className="px-4 py-2 bg-[#064473] text-white rounded-lg font-medium hover:bg-blue-900 transition"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SettingsSection>
  );
};

export default LinkedAccounts;