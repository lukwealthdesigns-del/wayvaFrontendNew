// components/Itinerary/DayDetail.jsx
import React from 'react';
import ActivityCard from './ActivityCard';

const DayDetail = ({ day, activities }) => {
  const formatDate = (date, index) => {
    const dayDate = new Date(date);
    dayDate.setDate(dayDate.getDate() + index);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return {
      dayName: dayNames[dayDate.getDay()],
      dayNumber: dayDate.getDate(),
      month: monthNames[dayDate.getMonth()],
      year: dayDate.getFullYear()
    };
  };

  const formatted = formatDate(day.startDate, day.dayIndex);

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {formatted.dayName}, {formatted.month} {formatted.dayNumber}
        </h2>
        <p className="text-gray-600">Day {day.dayIndex + 1} of your trip</p>
      </div>

      {/* Daily Summary */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <h3 className="font-bold text-gray-900 mb-2">Today's Highlights</h3>
        <p className="text-gray-700">{day.summary}</p>
      </div>

      {/* Activities Timeline */}
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="relative">
            {/* Timeline Connector */}
            {index < activities.length - 1 && (
              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
            )}
            
            <div className="flex">
              {/* Time Circle */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              </div>
              
              {/* Activity Content */}
              <div className="flex-1 pb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{activity.time}</h4>
                      <h3 className="text-lg font-bold text-gray-900">{activity.name}</h3>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      ${activity.price}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{activity.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{activity.rating}</span>
                      <span>({activity.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{activity.distance} from hotel</span>
                    </div>
                    <button className="text-blue-600 font-medium">View Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Total */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Daily Estimated Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              ${activities.reduce((sum, activity) => sum + activity.price, 0).toFixed(2)}
            </p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
            Book Day Activities
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayDetail;