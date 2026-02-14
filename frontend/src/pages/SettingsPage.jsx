// pages/SettingsPage.jsx - Backend Integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiCreditCard, 
  FiLink, 
  FiMoon, 
  FiBarChart, 
  FiHelpCircle, 
  FiLogOut,
  FiShield,
  FiDollarSign,
  FiLock,
  FiFileText,
  FiList,
  FiShoppingBag,
  FiBell,
  FiGlobe,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import LogoutModal from '../components/Settings/LogoutModal';
import { usersAPI } from '../api/users';
import { destinationsAPI } from '../api/destinations';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const PRIMARY_COLOR = '#064473';

  // Fetch user statistics
  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      // Get user profile with trip counts
      const response = await usersAPI.getProfile();
      setUserStats({
        tripCount: response.data.trip_count || 0,
        activeTrips: response.data.active_trips || 0,
        memberSince: response.data.created_at
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = [
    {
      title: 'Profile',
      items: [
        { 
          icon: FiUser, 
          label: 'Personal Info', 
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          path: '/settings/personal-info',
          description: 'Update your personal details'
        },
        { 
          icon: FiShield, 
          label: 'Account & Security', 
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          path: '/settings/account-security',
          description: 'Password, email, and security settings'
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: FiBell, 
          label: 'Notifications', 
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          path: '/settings/notifications',
          description: 'Manage your notification preferences'
        },
        { 
          icon: FiGlobe, 
          label: 'Language & Region', 
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100',
          path: '/settings/language-region',
          description: 'Set your preferred language and currency'
        },
        { 
          icon: FiMoon, 
          label: 'App Appearance', 
          color: 'text-pink-600',
          bgColor: 'bg-pink-100',
          path: '/settings/app-appearance',
          description: 'Theme and display settings'
        },
      ],
    },
    {
      title: 'Billing',
      items: [
        { 
          icon: FiShoppingBag, 
          label: 'Billing & Subscriptions', 
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          path: '/settings/billing',
          description: 'Manage your subscription and billing'
        },
        { 
          icon: FiCreditCard, 
          label: 'Payment Methods', 
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-100',
          path: '/settings/payment-methods',
          description: 'Add or remove payment methods'
        },
        { 
          icon: FiFileText, 
          label: 'Invoices & Receipts', 
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          path: '/settings/invoices',
          description: 'View your billing history'
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { 
          icon: FiHelpCircle, 
          label: 'Help & Support', 
          color: 'text-teal-600',
          bgColor: 'bg-teal-100',
          path: '/settings/help-support',
          description: 'Get help with your account'
        },
        { 
          icon: FiFileText, 
          label: 'Terms of Service', 
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          path: '/terms',
          description: 'Read our terms and conditions'
        },
        { 
          icon: FiList, 
          label: 'Privacy Policy', 
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          path: '/privacy',
          description: 'Learn how we protect your data'
        },
      ],
    },
  ];
  
  const handleNavigation = (path) => {
    if (path && path.startsWith('/')) {
      navigate(path);
    } else {
      console.error('Invalid navigation path:', path);
    }
  };
    
  const handleUpgrade = () => {
    navigate('/settings/billing');
  };
  
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <Navbar title="Settings" showBackButton={true} />
      
      <main className="px-4 pt-6">
        <div className="max-w-2xl mx-auto">
          {/* User Profile Header */}
          <div className="mb-8 p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                  {user?.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt={user?.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => navigate('/settings/personal-info')}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition"
                  style={{ color: PRIMARY_COLOR }}
                >
                  <FiUser className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Member since {formatMemberSince(user?.created_at)}
                </p>
              </div>
            </div>
            
            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : userStats?.tripCount || 0}
                </p>
                <p className="text-xs text-gray-600">Total Trips</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : userStats?.activeTrips || 0}
                </p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {user?.is_verified ? '✓' : '!'}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.is_verified ? 'Verified' : 'Unverified'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Subscription Banner - Only show if not premium */}
          {(!user?.is_premium) && (
            <div 
              className="mb-8 p-6 rounded-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, #064473 0%, #0a5c9c 100%)',
                boxShadow: '0 4px 20px rgba(6, 68, 115, 0.2)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Upgrade to Premium</h3>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Pro
                </span>
              </div>
              <p className="text-blue-100 mb-4 opacity-90">
                Unlock AI-powered itineraries and exclusive destinations
              </p>
              <button 
                onClick={handleUpgrade}
                className="px-6 py-3 bg-white font-bold rounded-xl hover:bg-blue-50 transition transform hover:scale-105 active:scale-95"
                style={{ color: PRIMARY_COLOR }}
              >
                View Plans
              </button>
            </div>
          )}
          
          {/* Settings List */}
          {settingsSections.map((section) => (
            <div key={section.title} className="mb-8">
              <h2 className="text-lg font-bold mb-4 text-gray-800 px-1">
                {section.title}
              </h2>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {section.items.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <React.Fragment key={item.label}>
                      <button 
                        onClick={() => handleNavigation(item.path)}
                        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition active:bg-gray-100"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div className="text-left">
                            <span className="font-medium text-gray-800 block">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="text-xs text-gray-500">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <FiChevronRight className="w-5 h-5" />
                        </div>
                      </button>
                      {index < section.items.length - 1 && (
                        <div className="border-b border-gray-100 mx-4"></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Logout Button */}
          <button 
            onClick={handleLogoutClick}
            className="w-full p-4 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center space-x-3 text-red-600 font-medium hover:bg-red-50 transition hover:border-red-200"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
          
          {/* App Version */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">Wayva v1.0.0</p>
            <p className="text-gray-400 text-xs mt-1">
              © {new Date().getFullYear()} Wayva Travel
            </p>
          </div>
        </div>
      </main>
      
      <BottomNav />
      
      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default SettingsPage;