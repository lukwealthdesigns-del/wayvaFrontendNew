// components/TripPlanner/DatesStep.jsx - Backend Integration
import React, { useState, useEffect } from 'react';
import Calendar from '../Shared/Calendar';
import { FiCalendar, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const DatesStep = ({ startDate, endDate, onStartDateSelect, onEndDateSelect, onContinue }) => {
  const PRIMARY_COLOR = '#064473';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate trip duration
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  const formatDate = (date) => {
    if (!date) return 'Not selected';
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateForBackend = (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  const formatMonthYear = (date) => {
    if (!date) return 'Select Date';
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle start date selection with past date prevention
  const handleStartDateSelect = (date) => {
    let selectedDate = date;
    if (typeof date === 'string') {
      selectedDate = new Date(date);
    }
    selectedDate.setHours(0, 0, 0, 0);
    
    // Ensure date is not in the past
    if (selectedDate < today) {
      onStartDateSelect(today);
      
      // If end date exists and is before today, clear it
      if (endDate && new Date(endDate) < today) {
        onEndDateSelect(null);
      }
    } else {
      onStartDateSelect(selectedDate);
      
      // If end date exists and is before the new start date, clear end date
      if (endDate && selectedDate > new Date(endDate)) {
        onEndDateSelect(null);
      }
    }
  };

  // Handle end date selection with validation
  const handleEndDateSelect = (date) => {
    let selectedDate = date;
    if (typeof date === 'string') {
      selectedDate = new Date(date);
    }
    selectedDate.setHours(0, 0, 0, 0);
    
    // Ensure end date is not before start date or today
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      if (selectedDate < start) {
        return;
      }
      
      if (selectedDate < today) {
        return;
      }
      
      // Check maximum duration (90 days)
      const maxEndDate = new Date(start);
      maxEndDate.setDate(start.getDate() + 89); // 90 days including start
      
      if (selectedDate > maxEndDate) {
        alert('Trip duration cannot exceed 90 days');
        return;
      }
    } else if (selectedDate < today) {
      return;
    }
    
    onEndDateSelect(selectedDate);
  };

  const duration = calculateDuration();
  const isDatesValid = startDate && endDate && duration > 0 && duration <= 90;

  // Check if there are any date validation errors
  const getDateValidationMessage = () => {
    if (!startDate && !endDate) return null;
    
    if (startDate) {
      const start = new Date(startDate);
      if (start < today) {
        return "Start date cannot be in the past. Auto-adjusted to today.";
      }
    }
    
    if (endDate && startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return "End date must be after start date.";
      }
      if (duration > 90) {
        return "Trip duration cannot exceed 90 days. Please adjust your dates.";
      }
    }
    
    return null;
  };

  const validationMessage = getDateValidationMessage();

  // Get default month/year for calendars
  const getDefaultMonthYear = (type = 'start') => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (type === 'end') {
      if (startDate) {
        const start = new Date(startDate);
        return {
          month: start.getMonth(),
          year: start.getFullYear()
        };
      }
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      return { month: nextMonth, year: nextYear };
    }
    
    return { month: currentMonth, year: currentYear };
  };

  const startCalendarDefaults = getDefaultMonthYear('start');
  const endCalendarDefaults = getDefaultMonthYear('end');

  return (
    <>
      <div className="px-6 pt-4 pb-32">
        <h1 className="text-xl font-bold text-gray-900 mb-2">New Trip</h1>
        <p className="text-gray-600 mb-8 text-md">
          When will your adventure begin and end?<br />
          <span className="text-[12px]">Choose dates from today onward. Maximum trip duration is 90 days.</span>
        </p>

        {/* Validation Message */}
        {validationMessage && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <FiAlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700">{validationMessage}</p>
          </div>
        )}

        {/* Today Indicator */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs font-medium mb-1" style={{ color: PRIMARY_COLOR }}>
            📅 Today is {formatDate(today)}
          </p>
          <p className="text-xs text-gray-600">
            All dates are selected from today forward. Past dates are disabled.
          </p>
        </div>

        {/* Start Date Section */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Start Date: {formatMonthYear(startDate)}
          </h3>
          <Calendar
            selectedDate={startDate ? new Date(startDate) : null}
            onDateSelect={handleStartDateSelect}
            month={startCalendarDefaults.month}
            year={startCalendarDefaults.year}
            primaryColor={PRIMARY_COLOR}
            minDate={today}
          />
        </div>

        {/* End Date Section */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            End Date: {formatMonthYear(endDate)}
            {startDate && (
              <span className="text-xs text-gray-500 ml-2 font-normal">
                (must be after {formatDate(startDate)}, max {new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 89)).toLocaleDateString()})
              </span>
            )}
          </h3>
          <Calendar
            selectedDate={endDate ? new Date(endDate) : null}
            onDateSelect={handleEndDateSelect}
            month={endCalendarDefaults.month}
            year={endCalendarDefaults.year}
            primaryColor={PRIMARY_COLOR}
            minDate={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)) : today}
            maxDate={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 89)) : null}
          />
        </div>

        {/* Selected Dates Preview */}
        {(startDate || endDate) && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: PRIMARY_COLOR }}>
                Selected Travel Dates
              </p>
              {isDatesValid && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                  <FiCheckCircle className="w-3 h-3 mr-1" />
                  Valid
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Start Date */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2.5 flex-shrink-0">
                  <FiCalendar className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {startDate ? formatDate(startDate) : 'Not selected'}
                    {startDate && new Date(startDate).toDateString() === today.toDateString() && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                        Today
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2.5 flex-shrink-0">
                  <FiCalendar className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">End Date</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {endDate ? formatDate(endDate) : 'Not selected'}
                  </p>
                </div>
              </div>

              {/* Duration */}
              {isDatesValid && (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2.5 flex-shrink-0">
                    <FiClock className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Trip Duration</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {duration} day{duration !== 1 ? 's' : ''}
                      <span className="ml-2 text-xs text-gray-500">
                        ({formatDateForBackend(startDate)} to {formatDateForBackend(endDate)})
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Date Selection Tips */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">📅 Date Selection Rules:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Start date must be today or later</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>End date must be after start date</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Minimum trip duration: 1 day</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">⚠️</span>
              <span>Maximum trip duration: 90 days (backend limit)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Past dates are disabled and cannot be selected</span>
            </li>
          </ul>
        </div>

        {/* Quick Date Suggestions */}
        <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-3">🚀 Quick Date Suggestions:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 6);
                handleStartDateSelect(today);
                handleEndDateSelect(nextWeek);
              }}
              className="p-2 text-xs bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Weekend Trip (3 days)
            </button>
            <button
              onClick={() => {
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 6);
                handleStartDateSelect(today);
                handleEndDateSelect(nextWeek);
              }}
              className="p-2 text-xs bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              7 Days Trip
            </button>
            <button
              onClick={() => {
                const twoWeeks = new Date(today);
                twoWeeks.setDate(today.getDate() + 13);
                handleStartDateSelect(today);
                handleEndDateSelect(twoWeeks);
              }}
              className="p-2 text-xs bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              2 Weeks Trip
            </button>
            <button
              onClick={() => {
                const oneMonth = new Date(today);
                oneMonth.setMonth(today.getMonth() + 1);
                oneMonth.setDate(today.getDate() - 1);
                handleStartDateSelect(today);
                handleEndDateSelect(oneMonth);
              }}
              className="p-2 text-xs bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              1 Month Trip
            </button>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={onContinue}
          disabled={!isDatesValid}
          className="w-full py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-lg active:scale-[0.98]"
          style={{ 
            backgroundColor: isDatesValid ? PRIMARY_COLOR : '#E6F0F7',
            color: isDatesValid ? 'white' : PRIMARY_COLOR
          }}
        >
          {isDatesValid ? (
            <>
              Continue with {duration} day{duration !== 1 ? 's' : ''} trip →
            </>
          ) : (
            'Select dates to continue'
          )}
        </button>
        {!isDatesValid && (
          <p className="text-xs text-gray-500 text-center mt-2">
            {!startDate && !endDate && 'Select start and end dates'}
            {startDate && !endDate && 'Select end date'}
            {!startDate && endDate && 'Select start date'}
            {startDate && endDate && duration <= 0 && 'End date must be after start date'}
            {startDate && endDate && duration > 90 && 'Trip duration cannot exceed 90 days'}
          </p>
        )}
      </div>
    </>
  );
};

export default DatesStep;