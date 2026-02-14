// components/Settings/HelpSupport.jsx - Updated with primary color
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import SettingsSection from './SettingsSection';
import { 
  FiHelpCircle, 
  FiMail, 
  FiShield, 
  FiFileText,
  FiBriefcase,
  FiUsers,
  FiMessageSquare,
  FiInfo,
  FiStar,
  FiGlobe,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiPhone,
  FiClock,
  FiMessageCircle
} from 'react-icons/fi';

const HelpSupport = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const primaryColor = '#064473';
  const primaryLight = 'rgba(6, 68, 115, 0.1)';
  const primaryHover = '#0a5c9c';
  const primaryGradient = 'linear-gradient(135deg, #064473 0%, #0a6db1 100%)';

  const categories = [
    { id: 'faq', label: 'FAQ', icon: FiHelpCircle },
    { id: 'contact', label: 'Contact Support', icon: FiMail },
    { id: 'privacy', label: 'Privacy Policy', icon: FiShield },
    { id: 'terms', label: 'Terms of Service', icon: FiFileText },
    { id: 'partner', label: 'Partner', icon: FiBriefcase },
    { id: 'jobs', label: 'Job Vacancy', icon: FiUsers },
    { id: 'accessibility', label: 'Accessibility', icon: FiMessageSquare },
    { id: 'feedback', label: 'Feedback', icon: FiMessageSquare },
    { id: 'about', label: 'About us', icon: FiInfo },
    { id: 'rate', label: 'Rate us', icon: FiStar },
    { id: 'website', label: 'Visit Our Website', icon: FiGlobe }
  ];

  const faqs = {
    faq: [
      { q: "How do I create a trip plan?", a: "Go to the Trips tab and click 'Plan a new Trip'. Follow the step-by-step process." },
      { q: "How does the AI generate itineraries?", a: "Our AI analyzes your preferences, budget, and destination to create personalized plans." },
      { q: "Can I edit my itinerary after it's generated?", a: "Yes, you can modify any part of your itinerary from the trip details page." }
    ],
    contact: [
      { q: "Email Support", a: "support@wayva.com", icon: FiMail },
      { q: "Phone Support", a: "+1 (800) WAYVA-123", icon: FiPhone },
      { q: "Live Chat", a: "Available Mon-Fri, 9AM-6PM EST", icon: FiMessageCircle },
      { q: "Response Time", a: "Typically within 2-4 hours", icon: FiClock }
    ],
    privacy: [
      { q: "Data Collection", a: "We collect only necessary data to provide our services and improve your experience." },
      { q: "Data Security", a: "Your data is encrypted and protected with industry-standard security measures." },
      { q: "Your Rights", a: "You can request to view, modify, or delete your personal data at any time." }
    ],
    terms: [
      { q: "Service Usage", a: "Our services are provided for personal, non-commercial use only." },
      { q: "User Responsibilities", a: "You are responsible for maintaining the confidentiality of your account." },
      { q: "Content Ownership", a: "You retain ownership of all content you create using our platform." }
    ]
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
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
        <h1 className="text-lg font-bold text-gray-900">Help & Support</h1>
      </div>

      <SettingsSection title="Help & Support">
        <div className="p-6">
          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isActive
                      ? 'border-[#064473]'
                      : 'border-gray-200 hover:border-[#064473]'
                  }`}
                  style={{
                    backgroundColor: isActive ? primaryLight : 'white'
                  }}
                >
                  <Icon 
                    className="w-6 h-6 mb-2" 
                    style={{ color: isActive ? primaryColor : '#6b7280' }}
                  />
                  <span 
                    className="text-sm font-medium text-center"
                    style={{ color: isActive ? primaryColor : '#374151' }}
                  >
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Category Content */}
          {activeCategory && faqs[activeCategory] && (
            <div 
              className="rounded-xl p-5 mb-6 transition-all duration-300"
              style={{ 
                backgroundColor: primaryLight,
                border: `1px solid rgba(6, 68, 115, 0.2)`
              }}
            >
              <div className="flex items-center mb-4">
                {(() => {
                  const Icon = categories.find(c => c.id === activeCategory)?.icon;
                  return Icon ? <Icon className="w-5 h-5 mr-3" style={{ color: primaryColor }} /> : null;
                })()}
                <h4 
                  className="font-bold"
                  style={{ color: primaryColor }}
                >
                  {categories.find(c => c.id === activeCategory)?.label}
                </h4>
              </div>
              <div className="space-y-4">
                {faqs[activeCategory].map((item, index) => (
                  <div 
                    key={index} 
                    className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                    style={{ borderColor: 'rgba(6, 68, 115, 0.1)' }}
                  >
                    <div className="flex items-start mb-2">
                      {item.icon && (
                        <item.icon 
                          className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" 
                          style={{ color: primaryColor }}
                        />
                      )}
                      <p className="font-medium text-gray-900">{item.q}</p>
                    </div>
                    <p className="text-gray-600 ml-6">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media */}
          <div className="pt-6 border-t border-gray-200">
            <h4 
              className="font-bold mb-4 text-center"
              style={{ color: primaryColor }}
            >
              Follow us on Social Media
            </h4>
            <div className="flex justify-center space-x-4">
              <a 
                href="#" 
                className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                style={{ 
                  backgroundColor: '#1877F2',
                  color: 'white'
                }}
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                style={{ 
                  backgroundColor: '#1DA1F2',
                  color: 'white'
                }}
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                style={{ 
                  backgroundColor: '#E4405F',
                  color: 'white'
                }}
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                style={{ 
                  backgroundColor: '#0A66C2',
                  color: 'white'
                }}
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-center text-sm text-gray-600 mt-3">
              Stay updated with the latest travel tips and features
            </p>
          </div>

          {/* Support Information */}
          <div 
            className="mt-8 rounded-2xl p-6 text-white text-center"
            style={{ 
              background: primaryGradient,
              boxShadow: '0 4px 20px rgba(6, 68, 115, 0.3)'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <FiMessageCircle className="w-6 h-6 mr-2 text-white opacity-90" />
              <h4 className="font-bold text-lg">Need Immediate Help?</h4>
            </div>
            <p className="mb-4 opacity-90">Our support team is here to assist you 24/7</p>
            <div className="space-y-3">
              <a 
                href="mailto:support@wayva.com" 
                className="block font-medium hover:underline transition-all duration-200 hover:scale-105 inline-block"
                style={{ color: 'white' }}
              >
                lukwealthdev@gmail.com
              </a>
              <a 
                href="tel:+18009298123" 
                className="block font-medium hover:underline transition-all duration-200 hover:scale-105 inline-block"
                style={{ color: 'white' }}
              >
                +234 (0) 7085125588
              </a>
            </div>
            <div 
              className="mt-4 p-3 rounded-xl inline-block"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <p className="text-sm opacity-90">Average response time: 2 hours</p>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-6">
            <h4 
              className="font-bold mb-4 text-center"
              style={{ color: primaryColor }}
            >
              Additional Resources
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="#"
                className="p-3 border rounded-xl text-center transition-all duration-200 hover:scale-[1.02]"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor,
                  backgroundColor: primaryLight
                }}
              >
                <span className="font-medium">Help Center</span>
              </a>
              <a 
                href="#"
                className="p-3 border rounded-xl text-center transition-all duration-200 hover:scale-[1.02]"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor,
                  backgroundColor: primaryLight
                }}
              >
                <span className="font-medium">Community Forum</span>
              </a>
            </div>
          </div>

          {/* App Version */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">Wayva App v1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">© 2025 Wayva Travel. All rights reserved.</p>
          </div>
        </div>
      </SettingsSection>
    </>
  );
};

export default HelpSupport;