// components/Settings/PaymentMethods.jsx - Updated with primary color
import React, { useState } from 'react';
import { FaPaypal, FaGoogle, FaApple, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { FiPlus, FiTrash2, FiLock, FiShield } from 'react-icons/fi';
import SettingsSection from './SettingsSection';
import { useNotification } from '../Shared/NotificationContext';

// Validation functions
const validateCardNumber = (number) => {
  const cleaned = number.replace(/\s+/g, '');
  return /^\d{13,19}$/.test(cleaned);
};

const validateExpiryDate = (expiry) => {
  if (!expiry || !expiry.includes('/')) return false;
  
  const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
  if (!month || !year || month < 1 || month > 12) return false;
  
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};

const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

const PaymentMethods = () => {
  const { showSuccess, showError } = useNotification();
  
  const [paymentMethods, setPaymentMethods] = useState([
    { 
      id: 1, 
      type: 'paypal', 
      name: 'PayPal', 
      connected: true, 
      icon: FaPaypal, 
      color: '#0070BA',
      brandColor: '#0070BA'
    },
    { 
      id: 2, 
      type: 'google', 
      name: 'Google Pay', 
      connected: true, 
      icon: FaGoogle, 
      color: '#4285F4',
      brandColor: '#4285F4'
    },
    { 
      id: 3, 
      type: 'apple', 
      name: 'Apple Pay', 
      connected: true, 
      icon: FaApple, 
      color: '#000000',
      brandColor: '#000000'
    },
    { 
      id: 4, 
      type: 'card', 
      name: 'Visa', 
      last4: '5060', 
      connected: true, 
      icon: FaCcVisa, 
      color: '#1A1F71',
      brandColor: '#1A1F71'
    },
    { 
      id: 5, 
      type: 'card', 
      name: 'Mastercard', 
      last4: '4984', 
      connected: true, 
      icon: FaCcMastercard, 
      color: '#EB001B',
      brandColor: '#EB001B'
    }
  ]);

  const primaryColor = '#064473';
  const primaryLight = 'rgba(6, 68, 115, 0.1)';
  const primaryHover = '#0a5c9c';

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const handleDisconnect = (id) => {
    setPaymentMethods(methods => 
      methods.map(method => 
        method.id === id ? { ...method, connected: false } : method
      )
    );
    showSuccess('Payment method disconnected');
  };

  const handleConnect = (id) => {
    setPaymentMethods(methods => 
      methods.map(method => 
        method.id === id ? { ...method, connected: true } : method
      )
    );
    showSuccess('Payment method connected');
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'number') {
      const formatted = value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setNewCard(prev => ({ ...prev, [name]: formatted.slice(0, 19) }));
    } 
    // Format expiry date
    else if (name === 'expiry') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
      setNewCard(prev => ({ ...prev, [name]: formatted }));
    }
    // Format CVV (numbers only)
    else if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setNewCard(prev => ({ ...prev, [name]: formatted }));
    }
    else {
      setNewCard(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, newCard[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'number':
        if (!validateRequired(value)) {
          error = 'Card number is required';
        } else if (!validateCardNumber(value)) {
          error = 'Please enter a valid card number (13-19 digits)';
        }
        break;
      case 'expiry':
        if (!validateRequired(value)) {
          error = 'Expiry date is required';
        } else if (!validateExpiryDate(value)) {
          error = 'Please enter a valid expiry date (MM/YY)';
        }
        break;
      case 'cvv':
        if (!validateRequired(value)) {
          error = 'CVV is required';
        } else if (!validateCVV(value)) {
          error = 'Please enter a valid CVV (3-4 digits)';
        }
        break;
      case 'name':
        if (!validateRequired(value)) {
          error = 'Cardholder name is required';
        }
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateRequired(newCard.number)) newErrors.number = 'Card number is required';
    else if (!validateCardNumber(newCard.number)) newErrors.number = 'Please enter a valid card number';
    
    if (!validateRequired(newCard.expiry)) newErrors.expiry = 'Expiry date is required';
    else if (!validateExpiryDate(newCard.expiry)) newErrors.expiry = 'Please enter a valid expiry date';
    
    if (!validateRequired(newCard.cvv)) newErrors.cvv = 'CVV is required';
    else if (!validateCVV(newCard.cvv)) newErrors.cvv = 'Please enter a valid CVV';
    
    if (!validateRequired(newCard.name)) newErrors.name = 'Cardholder name is required';
    
    setErrors(newErrors);
    setTouched({
      number: true,
      expiry: true,
      cvv: true,
      name: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCard = () => {
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const last4 = newCard.number.replace(/\s+/g, '').slice(-4);
      const cardStartsWith = newCard.number.replace(/\s/g, '')[0];
      let cardType = 'Visa';
      let Icon = FaCcVisa;
      let brandColor = '#1A1F71';
      
      if (cardStartsWith === '5') {
        cardType = 'Mastercard';
        Icon = FaCcMastercard;
        brandColor = '#EB001B';
      } else if (cardStartsWith === '3') {
        cardType = 'American Express';
        Icon = FaCcVisa; // Note: Would need Amex icon
        brandColor = '#2E77BC';
      }
      
      const newPaymentMethod = {
        id: paymentMethods.length + 1,
        type: 'card',
        name: cardType,
        last4,
        connected: true,
        icon: Icon,
        brandColor
      };
      
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setShowAddModal(false);
      setNewCard({ number: '', expiry: '', cvv: '', name: '' });
      setErrors({});
      setTouched({});
      setLoading(false);
      
      showSuccess('Payment method added successfully!');
    }, 1000);
  };

  const getInputClasses = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : `border-gray-300 focus:border-[#064473] focus:ring-[#06447320]`
    }`;
  };

  return (
    <>
      <SettingsSection title="Payment Methods">
        <div className="p-6">
          {/* Security Header */}
          <div 
            className="p-4 rounded-xl mb-6 flex items-center"
            style={{ 
              backgroundColor: primaryLight,
              border: '1px solid rgba(6, 68, 115, 0.2)'
            }}
          >
            <FiLock className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
            <div>
              <h3 
                className="font-bold"
                style={{ color: primaryColor }}
              >
                Secure Payment Methods
              </h3>
              <p className="text-sm text-gray-600">
                All payments are encrypted and PCI DSS compliant
              </p>
            </div>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div 
                  key={method.id}
                  className={`flex items-center justify-between p-5 border rounded-xl transition-all duration-200 hover:scale-[1.01] ${
                    method.connected ? 'border-green-200' : 'border-gray-200'
                  }`}
                  style={{
                    backgroundColor: method.connected ? 'rgba(34, 197, 94, 0.05)' : 'white'
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: method.brandColor,
                        border: `2px solid ${method.brandColor}`
                      }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{method.name}</h4>
                      {method.last4 ? (
                        <p className="text-sm text-gray-600">•••• •••• •••• {method.last4}</p>
                      ) : (
                        <p className="text-sm text-gray-600">Digital wallet</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {method.connected ? (
                      <>
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium flex items-center"
                          style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            color: '#16a34a'
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Active
                        </span>
                        <button
                          onClick={() => handleDisconnect(method.id)}
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          style={{
                            color: '#dc2626',
                            backgroundColor: 'rgba(220, 38, 38, 0.1)'
                          }}
                          title="Disconnect"
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                          }}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(method.id)}
                        className="px-5 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Payment Button */}
          <button
            onClick={() => {
              setShowAddModal(true);
              setErrors({});
              setTouched({});
            }}
            className="w-full mt-8 py-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.01] group"
            style={{
              borderColor: primaryColor,
              backgroundColor: primaryLight
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(6, 68, 115, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = primaryLight;
            }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-200 group-hover:scale-110"
              style={{ backgroundColor: primaryColor }}
            >
              <FiPlus className="w-6 h-6 text-white" />
            </div>
            <span 
              className="font-bold text-lg"
              style={{ color: primaryColor }}
            >
              Add New Payment Method
            </span>
            <p className="text-sm text-gray-600 mt-1">Credit/Debit card or digital wallet</p>
          </button>

          {/* Security Information */}
          <div className="mt-8">
            <div 
              className="p-4 rounded-xl"
              style={{ 
                backgroundColor: primaryLight,
                border: '1px solid rgba(6, 68, 115, 0.2)'
              }}
            >
              <div className="flex items-center mb-3">
                <FiShield className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                <h4 
                  className="font-bold"
                  style={{ color: primaryColor }}
                >
                  Payment Security
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2" style={{ backgroundColor: primaryColor }}></div>
                  <span>All transactions are encrypted with 256-bit SSL</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2" style={{ backgroundColor: primaryColor }}></div>
                  <span>We never store your full card details</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2" style={{ backgroundColor: primaryColor }}></div>
                  <span>PCI DSS Level 1 compliant</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-lg mr-3 flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FiPlus className="w-5 h-5 text-white" />
                </div>
                <h3 
                  className="text-lg font-bold"
                  style={{ color: primaryColor }}
                >
                  Add Payment Method
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCard({ number: '', expiry: '', cvv: '', name: '' });
                  setErrors({});
                  setTouched({});
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={newCard.number}
                  onChange={handleCardChange}
                  onBlur={handleCardBlur}
                  placeholder="1234 5678 9012 3456"
                  className={getInputClasses('number')}
                  disabled={loading}
                />
                {errors.number && touched.number && (
                  <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                )}
              </div>
              
              {/* Expiry Date & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={newCard.expiry}
                    onChange={handleCardChange}
                    onBlur={handleCardBlur}
                    placeholder="MM/YY"
                    className={getInputClasses('expiry')}
                    disabled={loading}
                  />
                  {errors.expiry && touched.expiry && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={newCard.cvv}
                    onChange={handleCardChange}
                    onBlur={handleCardBlur}
                    placeholder="123"
                    className={getInputClasses('cvv')}
                    disabled={loading}
                  />
                  {errors.cvv && touched.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                  )}
                </div>
              </div>
              
              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCard.name}
                  onChange={handleCardChange}
                  onBlur={handleCardBlur}
                  placeholder="Luke Joe"
                  className={getInputClasses('name')}
                  disabled={loading}
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Card Type Display */}
              {newCard.number.replace(/\s/g, '').length >= 13 && (
                <div 
                  className="p-3 rounded-lg flex items-center"
                  style={{ backgroundColor: primaryLight }}
                >
                  <div 
                    className="w-8 h-8 rounded mr-3 flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {newCard.number.startsWith('4') ? (
                      <FaCcVisa className="w-4 h-4 text-white" />
                    ) : newCard.number.startsWith('5') ? (
                      <FaCcMastercard className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-4 h-4 bg-white rounded"></div>
                    )}
                  </div>
                  <p className="text-sm font-medium" style={{ color: primaryColor }}>
                    Detected: {newCard.number.startsWith('4') ? 'Visa' : 
                              newCard.number.startsWith('5') ? 'Mastercard' : 
                              newCard.number.startsWith('3') ? 'American Express' : 
                              'Credit Card'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCard({ number: '', expiry: '', cvv: '', name: '' });
                  setErrors({});
                  setTouched({});
                }}
                className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563'
                }}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center"
                style={{
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = primaryHover;
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = primaryColor;
                }}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                    Adding...
                  </>
                ) : (
                  'Add Card'
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <FiLock className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
                <p className="text-xs" style={{ color: primaryColor }}>
                  Your payment information is secured with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentMethods;