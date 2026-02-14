// pages/TripPlannerPage.jsx - Complete with Mock Fallback and Generation Screen
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StepProgress from '../components/TripPlanner/StepProgress';
import DestinationStep from '../components/TripPlanner/DestinationStep';
import TravelersStep from '../components/TripPlanner/TravelersStep';
import DatesStep from '../components/TripPlanner/DatesStep';
import PreferencesStep from '../components/TripPlanner/PreferencesStep';
import BudgetStep from '../components/TripPlanner/BudgetStep';
import ReviewStep from '../components/TripPlanner/ReviewStep';
import GeneratingScreen from '../components/Itinerary/GeneratingScreen';
import { aiAPI } from '../api/ai';
import { tripsAPI } from '../api/trips';
import { useAuth } from '../context/AuthContext';

const TripPlannerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('Preparing your itinerary...');
  const [generationError, setGenerationError] = useState(null);
  const [formData, setFormData] = useState({
    destination: location.state?.prefillDestination || null,
    travelers: null,
    startDate: null,
    endDate: null,
    preferences: [],
    budget: location.state?.prefillDestination?.budget ? {
      type: 'flexible',
      amount: parseFloat(location.state.prefillDestination.budget)
    } : null,
    currency: location.state?.prefillDestination?.currency || 'USD',
    groupSize: 1,
    accommodationPreference: '',
    transportationPreference: '',
    specificRequirements: ''
  });

  // Check authentication before generating
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token && user === null) {
      navigate('/login', { 
        state: { from: '/plan-trip' },
        replace: true 
      });
    }
  }, [user, navigate]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Prefill destination if coming from budget finder
  useEffect(() => {
    if (location.state?.prefillDestination) {
      const { city, country } = location.state.prefillDestination;
      setFormData(prev => ({
        ...prev,
        destination: {
          city,
          country,
          full: `${city}, ${country}`
        }
      }));
    }
  }, [location.state]);

  const handleDestinationSelect = (destination) => {
    setFormData(prev => ({ ...prev, destination }));
  };

  const handleDestinationContinue = () => {
    if (formData.destination) {
      handleNext();
    }
  };

  const handleTravelersSelect = (travelers) => {
    let groupSize = 1;
    let tripType = 'only_me';
    
    switch(travelers) {
      case 'Solo':
        tripType = 'only_me';
        groupSize = 1;
        break;
      case 'Couple':
        tripType = 'couple';
        groupSize = 2;
        break;
      case 'Family':
        tripType = 'family';
        groupSize = 4;
        break;
      case 'Friends':
        tripType = 'friends';
        groupSize = 3;
        break;
      case 'Work':
        tripType = 'work';
        groupSize = 5;
        break;
      default:
        tripType = 'only_me';
        groupSize = 1;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      travelers: {
        type: travelers,
        tripType,
        groupSize
      }
    }));
  };

  const handleTravelersContinue = () => {
    if (formData.travelers) {
      handleNext();
    }
  };

  const handleStartDateSelect = (date) => {
    setFormData(prev => ({ ...prev, startDate: date }));
  };

  const handleEndDateSelect = (date) => {
    setFormData(prev => ({ ...prev, endDate: date }));
  };

  const handleDatesContinue = () => {
    if (formData.startDate && formData.endDate) {
      handleNext();
    }
  };

  const handleTogglePreference = (preferenceId) => {
    setFormData(prev => {
      const isSelected = prev.preferences.includes(preferenceId);
      return {
        ...prev,
        preferences: isSelected
          ? prev.preferences.filter(id => id !== preferenceId)
          : [...prev.preferences, preferenceId]
      };
    });
  };

  const handlePreferencesContinue = () => {
    if (formData.preferences.length > 0) {
      handleNext();
    }
  };

  const handleBudgetSelect = (budget) => {
    setFormData(prev => ({ 
      ...prev, 
      budget: {
        type: budget.type,
        amount: parseFloat(budget.amount) || 0
      }
    }));
  };

  const handleBudgetContinue = () => {
    if (formData.budget?.amount && formData.budget?.type) {
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (showGeneration) {
      setShowGeneration(false);
      setGenerationProgress(0);
      setGenerationError(null);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/trips');
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Generate MOCK itinerary as fallback
  const generateMockItinerary = () => {
    const mockTripId = `mock-${Date.now()}`;
    const duration = formData.startDate && formData.endDate 
      ? Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1
      : 5;
    
    const mockResponse = {
      trip_id: mockTripId,
      destination: formData.destination?.full || `${formData.destination?.city}, ${formData.destination?.country}`,
      trip_type: formData.travelers?.tripType || 'solo',
      duration_days: duration,
      total_estimated_cost: {
        min: formData.budget?.amount ? formData.budget.amount * 0.8 : 800,
        max: formData.budget?.amount ? formData.budget.amount * 1.2 : 1200,
        average: formData.budget?.amount || 1000,
        currency: 'USD'
      },
      itinerary: generateMockDays(duration, formData.destination?.city || 'your destination'),
      ai_insights: `Your ${duration}-day trip to ${formData.destination?.city || 'your destination'} is ready! This is a sample itinerary.`,
      recommendations: [
        'Visit the main attractions',
        'Try local cuisine',
        'Book accommodations in advance',
        'Check visa requirements'
      ],
      important_notes: [
        'This is a sample itinerary',
        'Verify all details before traveling',
        'Get travel insurance',
        'Check local COVID-19 restrictions'
      ],
      generated_at: new Date().toISOString(),
      isMock: true
    };

    return mockResponse;
  };

  // Generate mock days for itinerary
  const generateMockDays = (duration, destination) => {
    const days = [];
    for (let i = 0; i < duration; i++) {
      days.push({
        day_number: i + 1,
        date: new Date(new Date().setDate(new Date().getDate() + i)).toISOString().split('T')[0],
        theme: i === 0 ? 'Arrival' : i === duration - 1 ? 'Departure' : 'Exploration',
        summary: `Day ${i + 1} in ${destination}`,
        activities: [
          {
            title: 'Morning Activity',
            description: 'Explore local attractions',
            category: 'sightseeing',
            start_time: '09:00',
            end_time: '12:00',
            location: destination,
            estimated_cost: 50
          },
          {
            title: 'Lunch',
            description: 'Try local cuisine',
            category: 'food',
            start_time: '12:30',
            end_time: '13:30',
            location: 'Local restaurant',
            estimated_cost: 25
          },
          {
            title: 'Afternoon Exploration',
            description: 'Visit cultural sites',
            category: 'culture',
            start_time: '14:00',
            end_time: '17:00',
            location: destination,
            estimated_cost: 40
          }
        ]
      });
    }
    return days;
  };

  // Simulate generation progress
  const startGenerationProgress = () => {
    setGenerationProgress(0);
    setGenerationStatus('Preparing your itinerary...');
    setGenerationError(null);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    setTimeout(() => {
      setGenerationStatus('Analyzing your preferences...');
    }, 1000);
    
    setTimeout(() => {
      setGenerationStatus('Searching for best activities...');
    }, 2000);
    
    setTimeout(() => {
      setGenerationStatus('Creating daily itinerary...');
    }, 3000);
    
    setTimeout(() => {
      setGenerationStatus('Calculating costs & recommendations...');
    }, 4000);
    
    setTimeout(() => {
      setGenerationStatus('Finalizing your personalized trip...');
    }, 5000);

    return interval;
  };

  const handleGenerateItinerary = async () => {
    // Check authentication
    const token = localStorage.getItem('access_token');
    if (!token || !user) {
      navigate('/login', { 
        state: { from: '/plan-trip' },
        replace: true 
      });
      return;
    }

    setShowGeneration(true);
    setLoading(true);
    setGenerationError(null);
    
    // Start progress animation
    const progressInterval = startGenerationProgress();
    
    try {
      // Validate required fields
      if (!formData.destination || !formData.travelers || !formData.startDate || !formData.endDate || 
          !formData.preferences.length || !formData.budget) {
        throw new Error('Missing required trip information');
      }

      // Format travel interests to match backend enum
      const interestMap = {
        'wine_tours': 'wine_tours',
        'road_trips': 'road_trips',
        'food_tourism': 'food_tourism',
        'cultural_exploration': 'cultural_exploration',
        'adventure_travel': 'adventure_travel',
        'city_breaks': 'city_breaks',
        'beach_vacation': 'beach_vacation',
        'mountain_hiking': 'mountain_hiking',
        'historical_sites': 'historical_sites',
        'shopping': 'shopping',
        'nightlife': 'nightlife',
        'family_friendly': 'family_friendly',
        'luxury': 'luxury',
        'budget_travel': 'budget_travel'
      };

      // Format dates to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return new Date().toISOString().split('T')[0];
        if (typeof date === 'string') return date.split('T')[0];
        return date.toISOString().split('T')[0];
      };

      const requestData = {
        destination: formData.destination.full || `${formData.destination.city}, ${formData.destination.country}`,
        trip_type: formData.travelers.tripType,
        start_date: formatDate(formData.startDate),
        end_date: formatDate(formData.endDate),
        travel_interests: formData.preferences.map(p => interestMap[p] || p),
        budget_type: formData.budget.type,
        specific_requirements: formData.specificRequirements || '',
        group_size: formData.travelers.groupSize,
        accommodation_preference: formData.accommodationPreference || '',
        transportation_preference: formData.transportationPreference || ''
      };

      console.log('📤 Sending trip planning request:', requestData);

      // Call AI trip planner
      const response = await aiAPI.planTrip(requestData);
      
      console.log('✅ Trip planned successfully:', response.data);
      
      // Complete progress
      setGenerationProgress(100);
      setGenerationStatus('Itinerary ready!');
      
      // Short delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
      clearInterval(progressInterval);
      
      // ✅ FIXED: Check if we have a real trip ID
      if (response.data && response.data.trip_id && !response.data.trip_id.startsWith('mock-')) {
        const tripId = response.data.trip_id;
        console.log('🚀 REAL TRIP ID FROM BACKEND:', tripId);
        console.log('🚀 Navigating to itinerary with ID:', tripId);
        
        // ✅ REMOVED tripId from state - it's in the URL
        navigate(`/itinerary-detail/${tripId}`, { 
          state: { 
            formData,
            aiResponse: response.data
          },
          replace: true
        });
      } else {
        // Mock fallback if no valid trip ID
        throw new Error('No valid trip ID received from server');
      }
      
    } catch (error) {
      console.error('❌ Failed to generate itinerary:', error);
      
      clearInterval(progressInterval);
      
      // ✅ MOCK FALLBACK - Show mock itinerary when backend fails
      console.log('⚠️ Using mock itinerary fallback');
      
      setGenerationProgress(100);
      setGenerationStatus('Using sample itinerary (backend unavailable)');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResponse = generateMockItinerary();
      const mockTripId = mockResponse.trip_id;
      
      // ✅ REMOVED mockTripId from state - it's in the URL
      navigate(`/itinerary-detail/${mockTripId}`, { 
        state: { 
          formData,
          aiResponse: mockResponse,
          isMock: true
        },
        replace: true
      });
      
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (showGeneration) {
      return (
        <GeneratingScreen 
          formData={formData}
          progress={generationProgress}
          status={generationStatus}
          error={generationError}
          onComplete={() => {
            console.log('✅ Generation complete callback');
          }}
          onCancel={() => {
            setShowGeneration(false);
            setGenerationProgress(0);
            setGenerationError(null);
          }}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <DestinationStep
            selectedDestination={formData.destination}
            onSelect={handleDestinationSelect}
            onContinue={handleDestinationContinue}
          />
        );
      case 2:
        return (
          <TravelersStep
            selectedTravelers={formData.travelers?.type}
            onSelect={handleTravelersSelect}
            onContinue={handleTravelersContinue}
          />
        );
      case 3:
        return (
          <DatesStep
            startDate={formData.startDate}
            endDate={formData.endDate}
            onStartDateSelect={handleStartDateSelect}
            onEndDateSelect={handleEndDateSelect}
            onContinue={handleDatesContinue}
          />
        );
      case 4:
        return (
          <PreferencesStep
            selectedPreferences={formData.preferences}
            onTogglePreference={handleTogglePreference}
            onContinue={handlePreferencesContinue}
          />
        );
      case 5:
        return (
          <BudgetStep
            selectedBudget={formData.budget?.type}
            budgetAmount={formData.budget?.amount}
            onSelect={handleBudgetSelect}
            onContinue={handleBudgetContinue}
          />
        );
      case 6:
        return (
          <ReviewStep
            destination={formData.destination}
            travelers={formData.travelers?.type}
            startDate={formData.startDate}
            endDate={formData.endDate}
            preferences={formData.preferences}
            budget={formData.budget}
            onGenerateItinerary={handleGenerateItinerary}
            onEdit={goToStep}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    if (showGeneration) return true;
    switch (currentStep) {
      case 1:
        return !!formData.destination;
      case 2:
        return !!formData.travelers;
      case 3:
        return !!(formData.startDate && formData.endDate);
      case 4:
        return formData.preferences.length > 0;
      case 5:
        return !!(formData.budget?.amount && formData.budget?.type);
      default:
        return true;
    }
  };

  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Step Progress - Hide during generation */}
      {!showGeneration && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="px-0 py-2">
            <StepProgress currentStep={currentStep} totalSteps={6} />
          </div>
        </div>
      )}
      
      {/* Back Button */}
      <div className="px-6 pb-3 pt-3">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition"
        >
          <span className="text-xl mr-1">←</span>
          <span>{showGeneration ? 'Cancel' : 'Back'}</span>
        </button>
      </div>

      {/* Current Step Content */}
      <div className="pb-32">
        {renderStep()}
      </div>

      {/* Continue Button for steps 1-5 only */}
      {!showGeneration && currentStep < 6 && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
          <button
            onClick={() => {
              switch (currentStep) {
                case 1: handleDestinationContinue(); break;
                case 2: handleTravelersContinue(); break;
                case 3: handleDatesContinue(); break;
                case 4: handlePreferencesContinue(); break;
                case 5: handleBudgetContinue(); break;
                default: handleNext();
              }
            }}
            disabled={!isStepValid() || loading}
            className="w-full py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
            style={{ 
              backgroundColor: isStepValid() && !loading ? PRIMARY_COLOR : PRIMARY_LIGHT,
              color: isStepValid() && !loading ? 'white' : PRIMARY_COLOR
            }}
          >
            {loading ? 'Processing...' : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TripPlannerPage;