// pages/SettingsSectionPage.jsx - Backend Integration
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import PersonalInfoForm from '../components/Settings/PersonalInfoForm';
import AccountSecurity from '../components/Settings/AccountSecurity';
import BillingSubscription from '../components/Settings/BillingSubscription';
import PaymentMethods from '../components/Settings/PaymentMethods';
import LinkedAccounts from '../components/Settings/LinkedAccounts';
import AppAppearance from '../components/Settings/AppAppearance';
import DataAnalytics from '../components/Settings/DataAnalytics';
import HelpSupport from '../components/Settings/HelpSupport';
import { usersAPI } from '../api/users';
import { useAuth } from '../context/AuthContext';

const SettingsSectionPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    console.log('Settings section:', section);
    console.log('Current path:', window.location.pathname);
    
    // Fetch fresh user data when viewing personal-info
    if (section === 'personal-info') {
      fetchUserData();
    }
  }, [section]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getProfile();
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionTitles = {
    'personal-info': 'Personal Info',
    'account-security': 'Account & Security',
    'billing': 'Billing & Subscriptions',
    'payment-methods': 'Payment Methods',
    'linked-accounts': 'Linked Accounts',
    'app-appearance': 'App Appearance',
    'data-analytics': 'Data & Analytics',
    'help-support': 'Help & Support',
    'notifications': 'Notifications',
    'language-region': 'Language & Region',
    'invoices': 'Invoices & Receipts'
  };

  const renderSection = () => {
    console.log('Rendering section:', section);
    
    if (!section) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FiSearch className="text-2xl text-gray-500" size={24} />
          </div>
          <p className="text-gray-600">No section parameter received</p>
          <p className="text-gray-500 text-sm mt-2">
            URL: {window.location.pathname}
          </p>
          <button 
            onClick={() => navigate('/settings')}
            className="mt-4 px-6 py-3 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Back to Settings
          </button>
        </div>
      );
    }

    switch (section) {
      case 'personal-info':
        return <PersonalInfoForm userData={userData} loading={loading} onUpdate={fetchUserData} />;
      
      case 'account-security':
        return <AccountSecurity user={user} />;
      
      case 'billing':
        return <BillingSubscription user={user} />;
      
      case 'payment-methods':
        return <PaymentMethods user={user} />;
      
      case 'linked-accounts':
        return <LinkedAccounts user={user} />;
      
      case 'app-appearance':
        return <AppAppearance user={user} />;
      
      case 'data-analytics':
        return <DataAnalytics user={user} />;
      
      case 'help-support':
        return <HelpSupport user={user} />;
      
      case 'notifications':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
            <p className="text-gray-600">Notification settings will be available soon.</p>
          </div>
        );
      
      case 'language-region':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Language & Region</h3>
            <p className="text-gray-600">Language and region settings will be available soon.</p>
          </div>
        );
      
      case 'invoices':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invoices & Receipts</h3>
            <p className="text-gray-600">Your billing history will appear here.</p>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="text-2xl text-yellow-600" size={24} />
            </div>
            <p className="text-gray-900 font-medium mb-2">Section not found</p>
            <p className="text-gray-600 text-sm mb-4">"{section}" is not a valid settings section</p>
            <button 
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-[#064473] text-white rounded-xl font-medium hover:opacity-90 transition"
            >
              Back to Settings
            </button>
          </div>
        );
    }
  };

  const title = sectionTitles[section] || 'Settings';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <Navbar 
        title={title} 
        showBackButton={true}
        onBack={() => navigate('/settings')}
      />
      
      <main className="px-4 pt-6">
        <div className="max-w-2xl mx-auto">
          {renderSection()}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default SettingsSectionPage;