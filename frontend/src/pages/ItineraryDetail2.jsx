// pages/ItineraryDetailPage.jsx - AI Integration
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ItineraryHeader from '../components/Itinerary/ItineraryHeader';
import DayList from '../components/Itinerary/DayList';
import DayDetail from '../components/Itinerary/DayDetail';
import ActivityCard from '../components/Itinerary/ActivityCard';
import { FiPrinter, FiShare2, FiLoader, FiAlertCircle } from 'react-icons/fi';

const ItineraryDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData } = location.state || {};
  const [selectedDay, setSelectedDay] = useState(0);
  const [viewMode, setViewMode] = useState('list');
  const [aiItinerary, setAiItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const PRIMARY_COLOR = '#064473';

  useEffect(() => {
    if (formData) {
      generateAIItinerary(formData);
    }
  }, [formData]);

  const generateAIItinerary = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login to generate itinerary');
        setLoading(false);
        return;
      }

      // Prepare data for AI API
      const itineraryData = {
        destination: `${data.destination?.city}, ${data.destination?.country}`,
        budget: getBudgetAmount(data.budget),
        currency: "USD",
        duration_days: calculateDuration(data.startDate, data.endDate),
        travelers: getTravelerLabel(data.travelers),
        travelers_count: getTravelerCount(data.travelers),
        preferences: data.preferences || [],
        travel_style: getTravelStyle(data.budget),
        interests: getInterestsFromPreferences(data.preferences),
        start_date: data.startDate ? formatDateForAPI(data.startDate) : new Date().toISOString().split('T')[0],
        end_date: data.endDate ? formatDateForAPI(data.endDate) : getEndDate(data.startDate, 5),
        trip_name: `Trip to ${data.destination?.city}`
      };

      console.log('Sending to AI:', itineraryData);

      const response = await fetch('http://localhost:8000/api/ai/generate-custom-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itineraryData)
      });

      const result = await response.json();
      
      if (result.success && result.itinerary) {
        // Format AI response for display
        const formattedItinerary = formatAIItinerary(result.itinerary, data);
        setAiItinerary(formattedItinerary);
      } else {
        setError(result.error || 'Failed to generate itinerary');
      }
    } catch (err) {
      console.error('AI Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const calculateDuration = (start, end) => {
    if (!start || !end) return 5;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getBudgetAmount = (budgetType) => {
    const budgetMap = {
      'cheap': 1500,
      'balanced': 3500,
      'luxury': 7000,
      'flexible': 5000
    };
    return budgetMap[budgetType] || 3000;
  };

  const getTravelerLabel = (travelerType) => {
    const travelerMap = {
      'solo': 'Solo traveler',
      'couple': 'A couple',
      'family': 'Family',
      'friends': 'Friends',
      'work': 'Work colleagues'
    };
    return travelerMap[travelerType] || 'Traveler';
  };

  const getTravelerCount = (travelerType) => {
    const countMap = {
      'solo': 1,
      'couple': 2,
      'family': 4,
      'friends': 3,
      'work': 2
    };
    return countMap[travelerType] || 1;
  };

  const getTravelStyle = (budget) => {
    const styleMap = {
      'cheap': 'Budget',
      'balanced': 'Mid-range',
      'luxury': 'Luxury',
      'flexible': 'Flexible'
    };
    return styleMap[budget] || 'Mid-range';
  };

  const getInterestsFromPreferences = (preferences) => {
    if (!preferences || !Array.isArray(preferences)) return ['local experiences'];
    
    const interestMap = {
      'adventure': 'outdoor activities',
      'city': 'urban exploration',
      'culture': 'cultural immersion',
      'wine': 'wine tasting',
      'beach': 'beach relaxation',
      'road': 'road trips',
      'relax': 'wellness',
      'nature': 'nature walks',
      'food': 'culinary experiences',
      'backpacking': 'budget travel',
      'cruise': 'cruise travel',
      'history': 'historical sites',
      'wildlife': 'wildlife watching',
      'art': 'art galleries'
    };
    
    return preferences.map(pref => interestMap[pref] || pref);
  };

  const formatDateForAPI = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const getEndDate = (startDate, days = 5) => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    return end.toISOString().split('T')[0];
  };

  const formatAIItinerary = (aiResponse, formData) => {
    // Parse daily activities from AI response
    let dailyActivities = [];
    
    if (aiResponse.daily_activities && Array.isArray(aiResponse.daily_activities)) {
      dailyActivities = aiResponse.daily_activities.map((day, index) => ({
        day: day.day || index + 1,
        date: formData.startDate ? 
          new Date(new Date(formData.startDate).setDate(new Date(formData.startDate).getDate() + index)) : 
          new Date(),
        title: day.title || `Day ${index + 1}: Activities`,
        activities: formatDayActivities(day, formData)
      }));
    } else {
      // Fallback: generate basic days
      const duration = calculateDuration(formData.startDate, formData.endDate);
      for (let i = 0; i < duration; i++) {
        dailyActivities.push({
          day: i + 1,
          date: formData.startDate ? 
            new Date(new Date(formData.startDate).setDate(new Date(formData.startDate).getDate() + i)) : 
            new Date(),
          title: `Day ${i + 1}: ${i === 0 ? 'Arrival' : i === duration - 1 ? 'Departure' : 'Exploring'}`,
          activities: generateFallbackActivities(i + 1, formData)
        });
      }
    }

    return {
      id: Date.now(),
      destination: formData.destination,
      travelers: formData.travelers,
      budget: formData.budget,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: calculateDuration(formData.startDate, formData.endDate),
      days: dailyActivities,
      overview: aiResponse.overview || 'AI-generated itinerary based on your preferences',
      accommodations: aiResponse.accommodations || 'Recommended accommodations',
      transportation: aiResponse.transportation || 'Local transport suggestions',
      dining: aiResponse.dining_options || 'Restaurant recommendations',
      budget_breakdown: aiResponse.budget_breakdown || {},
      travel_tips: aiResponse.travel_tips || 'Travel tips from AI',
      totalCost: getBudgetAmount(formData.budget),
      createdAt: new Date()
    };
  };

  const formatDayActivities = (aiDay, formData) => {
    const activities = [];
    
    // Morning
    if (aiDay.meal_suggestions?.breakfast) {
      activities.push({
        time: '08:00 - 09:00 AM',
        name: 'Breakfast',
        description: aiDay.meal_suggestions.breakfast,
        price: formData.budget === 'cheap' ? 15 : formData.budget === 'balanced' ? 25 : 50,
        rating: 4.5,
        reviews: 'Local recommendation',
        type: 'Food',
        duration: '1 hour',
        category: 'food'
      });
    }

    // Activities from AI
    if (aiDay.activities && Array.isArray(aiDay.activities)) {
      aiDay.activities.slice(0, 3).forEach((activity, index) => {
        activities.push({
          time: `${9 + index * 2}:00 - ${10 + index * 2}:00 ${index < 2 ? 'AM' : 'PM'}`,
          name: activity || 'Local Activity',
          description: `AI-recommended: ${activity}`,
          price: index === 0 ? 0 : formData.budget === 'cheap' ? 20 : 40,
          rating: 4.6,
          reviews: 'AI-curated',
          type: 'Activity',
          duration: '2 hours',
          category: 'activity'
        });
      });
    }

    // Lunch
    if (aiDay.meal_suggestions?.lunch) {
      activities.push({
        time: '01:00 - 02:30 PM',
        name: 'Lunch',
        description: aiDay.meal_suggestions.lunch,
        price: formData.budget === 'cheap' ? 20 : formData.budget === 'balanced' ? 35 : 60,
        rating: 4.4,
        reviews: 'Local favorite',
        type: 'Food',
        duration: '1.5 hours',
        category: 'food'
      });
    }

    // Dinner
    if (aiDay.meal_suggestions?.dinner) {
      activities.push({
        time: '07:00 - 09:00 PM',
        name: 'Dinner',
        description: aiDay.meal_suggestions.dinner,
        price: formData.budget === 'cheap' ? 30 : formData.budget === 'balanced' ? 60 : 120,
        rating: 4.7,
        reviews: 'Top-rated',
        type: 'Food',
        duration: '2 hours',
        category: 'food'
      });
    }

    return activities.length > 0 ? activities : generateFallbackActivities(aiDay.day || 1, formData);
  };

  const generateFallbackActivities = (day, formData) => {
    return [
      {
        time: '08:00 - 09:00 AM',
        name: 'Local Cafe Breakfast',
        description: 'Start with authentic local breakfast',
        price: formData.budget === 'cheap' ? 15 : 25,
        rating: 4.5,
        reviews: '1,200+ reviews',
        distance: '0.3 miles',
        type: 'Breakfast',
        duration: '1 hour',
        category: 'food'
      },
      {
        time: '10:00 AM - 12:00 PM',
        name: day === 1 ? 'City Orientation' : 'Local Exploration',
        description: day === 1 ? 'Get familiar with the city' : 'Explore local attractions',
        price: formData.budget === 'cheap' ? 0 : 20,
        rating: 4.6,
        reviews: 'AI recommended',
        distance: '1.2 miles',
        type: 'Activity',
        duration: '2 hours',
        category: 'activity'
      },
      {
        time: '01:00 - 02:30 PM',
        name: 'Local Food Experience',
        description: 'Taste authentic cuisine',
        price: formData.budget === 'cheap' ? 20 : 40,
        rating: 4.7,
        reviews: 'Local favorite',
        distance: '0.8 miles',
        type: 'Food',
        duration: '1.5 hours',
        category: 'food'
      },
      {
        time: '03:30 - 05:30 PM',
        name: 'Cultural Experience',
        description: 'Visit local cultural sites',
        price: formData.budget === 'cheap' ? 10 : 30,
        rating: 4.8,
        reviews: 'Highly rated',
        distance: '1.0 miles',
        type: 'Culture',
        duration: '2 hours',
        category: 'culture'
      },
      {
        time: '07:00 - 09:00 PM',
        name: 'Evening Dining',
        description: 'Fine dining experience',
        price: formData.budget === 'cheap' ? 30 : 60,
        rating: 4.9,
        reviews: 'Exquisite',
        distance: '1.5 miles',
        type: 'Dinner',
        duration: '2 hours',
        category: 'food'
      }
    ];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiLoader className="w-8 h-8 animate-spin" style={{ color: PRIMARY_COLOR }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">AI is Creating Your Itinerary</h3>
          <p className="text-gray-600 mb-4">Analyzing your preferences and generating personalized recommendations...</p>
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Generate Itinerary</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/trips')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Back to Trips
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!aiItinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8" style={{ color: PRIMARY_COLOR }}>📋</div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Itinerary Data</h3>
          <p className="text-gray-600 mb-6">Please generate an itinerary first</p>
          <button 
            onClick={() => navigate('/plan-trip')}
            className="px-6 py-3 rounded-lg font-medium text-base"
            style={{ 
              backgroundColor: PRIMARY_COLOR,
              color: 'white',
              boxShadow: `0 4px 14px 0 ${PRIMARY_COLOR}40`
            }}
          >
            Plan New Trip
          </button>
        </div>
      </div>
    );
  }

  // Calculate day total
  const calculateDayTotal = (activities) => {
    if (!activities || !Array.isArray(activities)) return 0;
    return activities.reduce((total, activity) => {
      const price = Number(activity.price) || 0;
      return total + price;
    }, 0);
  };

  const dayActivities = aiItinerary.days?.[selectedDay]?.activities || [];
  const dayTotal = calculateDayTotal(dayActivities);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <ItineraryHeader itinerary={aiItinerary} />

      {/* View Mode Toggle */}
      <div className="px-6 pt-6">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 List View
          </button>
          <button 
            onClick={() => setViewMode('detail')}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              viewMode === 'detail' 
                ? 'bg-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 Detail View
          </button>
        </div>
      </div>

      {/* Day Selection */}
      {aiItinerary.days && aiItinerary.days.length > 0 && (
        <div className="px-6 mb-6">
          <DayList 
            days={aiItinerary.days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </div>
      )}

      {/* Day Summary */}
      <div className="px-6 mb-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Day {selectedDay + 1}: {aiItinerary.days?.[selectedDay]?.title || 'Activities'}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {aiItinerary.days?.[selectedDay]?.date?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-blue-200"
                 style={{ color: PRIMARY_COLOR }}>
              ${dayTotal.toFixed(2)} total
            </div>
          </div>
          <div className="flex items-center mt-2 text-xs text-gray-600">
            <span className="mr-4">✨ AI-generated</span>
            <span>{dayActivities.length} activities</span>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="px-6 pb-32">
        {viewMode === 'list' ? (
          // List View
          <div className="space-y-4">
            {dayActivities.map((activity, index) => (
              <ActivityCard 
                key={index}
                activity={activity}
                isAI={true}
              />
            ))}
          </div>
        ) : (
          // Detail View
          <DayDetail 
            day={aiItinerary.days?.[selectedDay] || {}}
            activities={dayActivities}
          />
        )}

        {/* AI Travel Tips */}
        {aiItinerary.travel_tips && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
            <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white flex items-center justify-center text-xs mr-2">
                AI
              </div>
              Travel Tips
            </h4>
            <div className="text-xs text-gray-700 whitespace-pre-line">
              {aiItinerary.travel_tips}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.print()}
            className="py-3 rounded-lg font-medium text-sm transition-all duration-200 border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center"
          >
            <FiPrinter className="w-5 h-5 mr-2" />
            Print
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `AI Itinerary: ${aiItinerary.destination?.city}`,
                  text: `Check out my AI-generated itinerary for ${aiItinerary.destination?.city}!`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center"
            style={{ 
              backgroundColor: PRIMARY_COLOR,
              color: 'white',
              boxShadow: `0 4px 14px 0 ${PRIMARY_COLOR}40`
            }}
          >
            <FiShare2 className="w-5 h-5 mr-2" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetailPage;