// components/Itinerary/DayList.jsx
import React, { useState } from 'react';

const DayList = ({ days, selectedDay, onSelectDay }) => {
  const formatDay = (date, index) => {
    const dayDate = new Date(date);
    dayDate.setDate(dayDate.getDate() + index);
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      dayName: dayNames[dayDate.getDay()],
      dayNumber: dayDate.getDate(),
      month: monthNames[dayDate.getMonth()],
      fullDate: dayDate
    };
  };

  return (
    <div className="px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex overflow-x-auto space-x-4 pb-2">
        {days.map((day, index) => {
          const formatted = formatDay(day.startDate, index);
          const isSelected = selectedDay === index;
          
          return (
            <button
              key={index}
              onClick={() => onSelectDay(index)}
              className={`flex-shrink-0 w-20 flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xs font-medium">{formatted.dayName}</span>
              <span className="text-xl font-bold mt-1">{formatted.dayNumber}</span>
              <span className="text-xs opacity-80">{formatted.month}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DayList;