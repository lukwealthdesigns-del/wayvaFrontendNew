// components/Shared/Calendar.jsx
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Calendar = ({ 
  selectedDate, 
  onDateSelect,
  month: initialMonth = null, // Will be calculated based on today if not provided
  year: initialYear = null,
  primaryColor = '#064473',
  minDate = new Date() // Default to today as minimum date
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const [currentDate, setCurrentDate] = useState(() => {
    // If no initial month/year provided, start from today's month/year
    const startMonth = initialMonth !== null ? initialMonth : today.getMonth();
    const startYear = initialYear !== null ? initialYear : today.getFullYear();
    
    // Ensure we don't start from a past month
    const startDate = new Date(startYear, startMonth, 1);
    if (startDate < today && startDate.getMonth() < today.getMonth()) {
      return {
        month: today.getMonth(),
        year: today.getFullYear()
      };
    }
    
    return {
      month: startMonth,
      year: startYear
    };
  });

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const daysInMonth = getDaysInMonth(currentDate.month, currentDate.year);
  const firstDay = getFirstDayOfMonth(currentDate.month, currentDate.year);
  
  const days = [];

  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.year, currentDate.month, day);
    date.setHours(0, 0, 0, 0);
    
    const isToday = 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    
    const isSelected = selectedDate && 
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();

    // Check if date is in the past
    const isPastDate = date < minDate;
    
    // Check if date is before today
    const isBeforeToday = date < today;

    days.push({
      day,
      date,
      isToday,
      isSelected,
      isPastDate,
      isBeforeToday,
      isDisabled: isPastDate || isBeforeToday
    });
  }

  // Generate lighter and darker variants of primary color
  const primaryLight = `${primaryColor}20`; // 20% opacity
  const primaryLighter = `${primaryColor}10`; // 10% opacity

  // Check if previous month button should be disabled
  const prevMonthDate = new Date(currentDate.year, currentDate.month - 1, 1);
  const isPrevMonthDisabled = prevMonthDate < today && prevMonthDate.getMonth() < today.getMonth();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          disabled={isPrevMonthDisabled}
          className={`p-2 rounded-full transition-colors ${
            isPrevMonthDisabled 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: isPrevMonthDisabled ? '#9CA3AF' : primaryColor }}
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="font-bold text-gray-900">
          {months[currentDate.month]} {currentDate.year}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: primaryColor }}
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayData, index) => {
          if (!dayData) {
            return <div key={`empty-${index}`} className="h-10"></div>;
          }

          const isDisabled = dayData.isDisabled;

          return (
            <button
              key={index}
              onClick={() => !isDisabled && onDateSelect(dayData.date)}
              disabled={isDisabled}
              className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                isDisabled
                  ? 'text-gray-400 opacity-50 cursor-not-allowed'
                  : dayData.isSelected
                  ? 'text-white shadow-sm'
                  : dayData.isToday
                  ? 'font-bold hover:bg-gray-50'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: dayData.isSelected ? primaryColor : 
                                dayData.isToday && !isDisabled ? primaryLighter : 'transparent',
                color: dayData.isSelected ? 'white' : 
                       dayData.isToday && !isDisabled ? primaryColor : 
                       isDisabled ? '#9CA3AF' : 'inherit'
              }}
              title={isDisabled ? "Cannot select past dates" : ""}
            >
              {dayData.day}
              {dayData.isToday && !isDisabled && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-current"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-4">
          {/* Today Indicator */}
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2 border" 
              style={{ 
                backgroundColor: primaryLighter,
                borderColor: primaryColor
              }}
            ></div>
            <span className="text-xs text-gray-600">Today</span>
          </div>
          
          {/* Selected Date Indicator */}
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: primaryColor }}
            ></div>
            <span className="text-xs text-gray-600">Selected</span>
          </div>
          
          {/* Disabled Date Indicator */}
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-gray-200"></div>
            <span className="text-xs text-gray-600">Past</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;