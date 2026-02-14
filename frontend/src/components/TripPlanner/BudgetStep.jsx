// components/TripPlanner/BudgetStep.jsx - Backend Integration
import React, { useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiAward, FiZap, FiInfo } from 'react-icons/fi';

const BudgetStep = ({ 
  selectedBudget, 
  budgetAmount,
  onSelect, 
  onContinue,
  currency = 'USD'
}) => {
  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';
  
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amount, setAmount] = useState(budgetAmount || '');

  const budgetOptions = [
    {
      id: 'budget_friendly',
      title: 'Budget-Friendly',
      description: 'Economical travel with smart savings. Hostels, street food, public transport.',
      icon: <FiDollarSign className="w-5 h-5" />,
      color: '#059669',
      suggestedAmount: 1000,
      range: '500 - 1,500'
    },
    {
      id: 'balanced',
      title: 'Balanced',
      description: 'Moderate spending for comfortable travel. Mid-range hotels, local restaurants.',
      icon: <FiTrendingUp className="w-5 h-5" />,
      color: '#D97706',
      suggestedAmount: 2500,
      range: '1,500 - 3,500'
    },
    {
      id: 'luxury',
      title: 'Luxury',
      description: 'Premium experiences and accommodations. 5-star hotels, fine dining.',
      icon: <FiAward className="w-5 h-5" />,
      color: '#7C3AED',
      suggestedAmount: 5000,
      range: '3,500 - 7,000+'
    },
    {
      id: 'flexible',
      title: 'Flexible',
      description: 'No restrictions, focus on best experiences. Custom budget.',
      icon: <FiZap className="w-5 h-5" />,
      color: '#DC2626',
      suggestedAmount: null,
      range: 'Custom'
    }
  ];

  const handleSelect = (budgetId) => {
    const option = budgetOptions.find(o => o.id === budgetId);
    setShowAmountInput(budgetId === 'flexible');
    
    onSelect({
      type: budgetId,
      amount: option.suggestedAmount || amount
    });
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    // Update the budget amount in parent
    if (selectedBudget === 'flexible') {
      onSelect({
        type: 'flexible',
        amount: parseFloat(value) || 0
      });
    }
  };

  const isStepValid = () => {
    if (!selectedBudget) return false;
    if (selectedBudget === 'flexible') {
      return amount && parseFloat(amount) > 0;
    }
    return true;
  };

  const getSelectedOption = () => {
    return budgetOptions.find(o => o.id === selectedBudget);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <div className="px-6 pt-4 pb-32">
        <h1 className="text-xl font-bold text-gray-900 mb-2">New Trip</h1>
        <h2 className="text-md text-gray-900 mb-8">
          Set your trip budget <br />
          <span className="text-gray-600 text-[12px]">
            Let us know your budget preference, and we'll craft an itinerary that suits your financial comfort.
          </span>
        </h2>

        <div className="space-y-3">
          {budgetOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-start ${
                selectedBudget === option.id
                  ? 'ring-2 shadow-sm bg-blue-50/30'
                  : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                '--tw-ring-color': selectedBudget === option.id ? PRIMARY_COLOR : undefined,
                borderColor: selectedBudget === option.id ? PRIMARY_COLOR : undefined
              }}
            >
              {/* Icon Container */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                style={{ 
                  backgroundColor: selectedBudget === option.id ? `${option.color}20` : `${option.color}10`,
                  color: option.color
                }}
              >
                {option.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-base">{option.title}</h3>
                  {selectedBudget === option.id && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center ml-2 flex-shrink-0" 
                         style={{ backgroundColor: PRIMARY_COLOR }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-xs mb-1.5 line-clamp-2">{option.description}</p>
                
                {/* Price Range */}
                <div className="flex items-center flex-wrap">
                  <span className="text-xs font-medium" style={{ color: option.color }}>
                    {currency} {option.range}
                  </span>
                  {option.suggestedAmount && (
                    <span className="text-xs text-gray-500 ml-2">
                      • Avg. {formatCurrency(option.suggestedAmount)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Flexible Budget Amount Input */}
        {showAmountInput && selectedBudget === 'flexible' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your budget amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                {currency === 'USD' ? '$' : currency}
              </span>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                min="1"
                step="1"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: PRIMARY_COLOR }}
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This budget will be used to plan your entire trip
            </p>
          </div>
        )}

        {/* Selected Budget Preview */}
        {selectedBudget && !showAmountInput && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: PRIMARY_COLOR }}>
                Selected Budget
              </p>
              <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                Estimated total
              </span>
            </div>
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                style={{ 
                  backgroundColor: `${getSelectedOption()?.color}20`,
                  color: getSelectedOption()?.color
                }}
              >
                {getSelectedOption()?.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">
                    {getSelectedOption()?.title}
                  </h3>
                  <span className="text-lg font-bold" style={{ color: PRIMARY_COLOR }}>
                    {formatCurrency(getSelectedOption()?.suggestedAmount || 0)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {getSelectedOption()?.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Budget Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <FiInfo className="w-4 h-4 text-[#064473] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#064473] mb-1">💰 Budget Planning Tips:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-[#064473] mr-2">•</span>
                  <span>Include flights, accommodation, food, and activities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#064473] mr-2">•</span>
                  <span>Add 10-15% buffer for unexpected expenses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#064473] mr-2">•</span>
                  <span>Peak season travel costs 20-50% more</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#064473] mr-2">•</span>
                  <span>Booking 2-3 months in advance saves up to 30%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Currency Note */}
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 flex items-center">
            <span className="font-medium text-gray-700 mr-1">💱 Currency:</span>
            All prices shown in {currency}. Final costs will be estimated in your selected currency.
          </p>
        </div>
      </div>

      {/* Continue Button - Always visible but disabled */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={onContinue}
          disabled={!isStepValid()}
          className="w-full py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
          style={{ 
            backgroundColor: isStepValid() ? PRIMARY_COLOR : PRIMARY_LIGHT,
            color: isStepValid() ? 'white' : PRIMARY_COLOR
          }}
        >
          {selectedBudget === 'flexible' && !amount ? 'Enter Budget Amount' : 'Continue →'}
        </button>
      </div>
    </>
  );
};

export default BudgetStep;