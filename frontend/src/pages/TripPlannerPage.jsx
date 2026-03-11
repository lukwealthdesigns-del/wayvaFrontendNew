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
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const [currentStep, setCurrentStep]               = useState(1);
  const [loading, setLoading]                       = useState(false);
  const [showGeneration, setShowGeneration]         = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus]     = useState('Preparing your itinerary...');
  const [generationError, setGenerationError]       = useState(null);

  // ── Normalise incoming destination from either search (state.destination)
  //    or budget finder (state.prefillDestination) ──────────────────────────
  const resolveIncomingDestination = () => {
    const s = location.state;
    if (!s) return null;

    if (s.destination) {
      const d = s.destination;
      return {
        city:        d.name    || d.city    || '',
        country:     d.country || '',
        full:        d.displayName || `${d.name || d.city}, ${d.country}`,
        coordinates: d.coordinates || null,
      };
    }

    if (s.prefillDestination) {
      const d = s.prefillDestination;
      return {
        city:    d.city    || '',
        country: d.country || '',
        full:    `${d.city}, ${d.country}`,
      };
    }

    return null;
  };

  const incomingDestination = resolveIncomingDestination();

  const [formData, setFormData] = useState({
    destination: incomingDestination,
    travelers:   null,
    startDate:   null,
    endDate:     null,
    preferences: [],
    budget: location.state?.prefillDestination?.budget
      ? { type: 'flexible', amount: parseFloat(location.state.prefillDestination.budget) }
      : null,
    currency:                  location.state?.prefillDestination?.currency || 'USD',
    groupSize:                 1,
    accommodationPreference:   '',
    transportationPreference:  '',
    specificRequirements:      ''
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token && user === null) {
      navigate('/login', { state: { from: '/plan-trip' }, replace: true });
    }
  }, [user, navigate]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // If a destination arrived via state, skip straight to step 2
  useEffect(() => {
    if (incomingDestination) {
      setCurrentStep(2);
    }
  }, []);

  // ── Step handlers ─────────────────────────────────────────────────────────
  const handleDestinationSelect   = (dest) => setFormData(prev => ({ ...prev, destination: dest }));
  const handleDestinationContinue = ()     => { if (formData.destination) handleNext(); };

  const handleTravelersSelect = (travelers) => {
    const map = {
      Solo:    { tripType: 'only_me', groupSize: 1 },
      Couple:  { tripType: 'couple',  groupSize: 2 },
      Family:  { tripType: 'family',  groupSize: 4 },
      Friends: { tripType: 'friends', groupSize: 3 },
      Work:    { tripType: 'work',    groupSize: 5 },
    };
    const { tripType, groupSize } = map[travelers] || { tripType: 'only_me', groupSize: 1 };
    setFormData(prev => ({ ...prev, travelers: { type: travelers, tripType, groupSize } }));
  };
  const handleTravelersContinue  = () => { if (formData.travelers) handleNext(); };

  const handleStartDateSelect    = (date) => setFormData(prev => ({ ...prev, startDate: date }));
  const handleEndDateSelect      = (date) => setFormData(prev => ({ ...prev, endDate: date }));
  const handleDatesContinue      = ()     => { if (formData.startDate && formData.endDate) handleNext(); };

  const handleTogglePreference   = (id)   => setFormData(prev => {
    const isSelected = prev.preferences.includes(id);
    return {
      ...prev,
      preferences: isSelected
        ? prev.preferences.filter(p => p !== id)
        : [...prev.preferences, id]
    };
  });
  const handlePreferencesContinue = ()    => { if (formData.preferences.length > 0) handleNext(); };

  const handleBudgetSelect       = (budget) => setFormData(prev => ({
    ...prev,
    budget: { type: budget.type, amount: parseFloat(budget.amount) || 0 }
  }));
  const handleBudgetContinue     = ()     => { if (formData.budget?.amount && formData.budget?.type) handleNext(); };

  const handleNext = () => { if (currentStep < 6) setCurrentStep(currentStep + 1); };
  const goToStep   = (step) => setCurrentStep(step);

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

  // ── Mock itinerary fallback ───────────────────────────────────────────────
  const generateMockDays = (duration, destination) => {
    const days = [];
    for (let i = 0; i < duration; i++) {
      days.push({
        day_number: i + 1,
        date:       new Date(new Date().setDate(new Date().getDate() + i)).toISOString().split('T')[0],
        theme:      i === 0 ? 'Arrival' : i === duration - 1 ? 'Departure' : 'Exploration',
        summary:    `Day ${i + 1} in ${destination}`,
        activities: [
          { title: 'Morning Activity', description: 'Explore local attractions', category: 'sightseeing', start_time: '09:00', end_time: '12:00', location: destination, estimated_cost: 50 },
          { title: 'Lunch',            description: 'Try local cuisine',         category: 'food',        start_time: '12:30', end_time: '13:30', location: 'Local restaurant', estimated_cost: 25 },
          { title: 'Afternoon',        description: 'Visit cultural sites',      category: 'culture',     start_time: '14:00', end_time: '17:00', location: destination, estimated_cost: 40 },
        ]
      });
    }
    return days;
  };

  const generateMockItinerary = () => {
    const duration = formData.startDate && formData.endDate
      ? Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1
      : 5;
    return {
      trip_id:      `mock-${Date.now()}`,
      destination:  formData.destination?.full || `${formData.destination?.city}, ${formData.destination?.country}`,
      trip_type:    formData.travelers?.tripType || 'solo',
      duration_days: duration,
      total_estimated_cost: {
        min:      formData.budget?.amount ? formData.budget.amount * 0.8 : 800,
        max:      formData.budget?.amount ? formData.budget.amount * 1.2 : 1200,
        average:  formData.budget?.amount || 1000,
        currency: 'USD'
      },
      itinerary:        generateMockDays(duration, formData.destination?.city || 'your destination'),
      ai_insights:      `Your ${duration}-day trip to ${formData.destination?.city || 'your destination'} is ready!`,
      recommendations:  ['Visit the main attractions', 'Try local cuisine', 'Book accommodations in advance', 'Check visa requirements'],
      important_notes:  ['This is a sample itinerary', 'Verify all details before traveling', 'Get travel insurance'],
      generated_at:     new Date().toISOString(),
      isMock:           true
    };
  };

  // ── Generation progress animation ─────────────────────────────────────────
  const startGenerationProgress = () => {
    setGenerationProgress(0);
    setGenerationStatus('Preparing your itinerary...');
    setGenerationError(null);

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + 10;
      });
    }, 300);

    setTimeout(() => setGenerationStatus('Analyzing your preferences...'),         1000);
    setTimeout(() => setGenerationStatus('Searching for best activities...'),       2000);
    setTimeout(() => setGenerationStatus('Creating daily itinerary...'),            3000);
    setTimeout(() => setGenerationStatus('Calculating costs & recommendations...'), 4000);
    setTimeout(() => setGenerationStatus('Finalizing your personalized trip...'),   5000);

    return interval;
  };

  // ── Main generate handler ─────────────────────────────────────────────────
  const handleGenerateItinerary = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !user) {
      navigate('/login', { state: { from: '/plan-trip' }, replace: true });
      return;
    }

    setShowGeneration(true);
    setLoading(true);
    setGenerationError(null);

    const progressInterval = startGenerationProgress();

    try {
      if (!formData.destination || !formData.travelers || !formData.startDate ||
          !formData.endDate || !formData.preferences.length || !formData.budget) {
        throw new Error('Missing required trip information');
      }

      const interestMap = {
        wine_tours: 'wine_tours', road_trips: 'road_trips', food_tourism: 'food_tourism',
        cultural_exploration: 'cultural_exploration', adventure_travel: 'adventure_travel',
        city_breaks: 'city_breaks', beach_vacation: 'beach_vacation',
        mountain_hiking: 'mountain_hiking', historical_sites: 'historical_sites',
        shopping: 'shopping', nightlife: 'nightlife', family_friendly: 'family_friendly',
        luxury: 'luxury', budget_travel: 'budget_travel'
      };

      const formatDate = (date) => {
        if (!date) return new Date().toISOString().split('T')[0];
        if (typeof date === 'string') return date.split('T')[0];
        return date.toISOString().split('T')[0];
      };

      const requestData = {
        destination:               formData.destination.full || `${formData.destination.city}, ${formData.destination.country}`,
        trip_type:                 formData.travelers.tripType,
        start_date:                formatDate(formData.startDate),
        end_date:                  formatDate(formData.endDate),
        travel_interests:          formData.preferences.map(p => interestMap[p] || p),
        budget_type:               formData.budget.type,
        specific_requirements:     formData.specificRequirements || '',
        group_size:                formData.travelers.groupSize,
        accommodation_preference:  formData.accommodationPreference || '',
        transportation_preference: formData.transportationPreference || ''
      };

      console.log('📤 Sending trip planning request:', requestData);

      const response = await aiAPI.planTrip(requestData);
      console.log('✅ Trip planned successfully:', response.data);

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGenerationStatus('Itinerary ready!');
      await new Promise(resolve => setTimeout(resolve, 500));

      if (response.data?.trip_id && !response.data.trip_id.startsWith('mock-')) {
        // ✅ Navigate to success screen first, pass tripId + formData
        navigate('/itinerary-success', {
          state: {
            tripId:    response.data.trip_id,
            formData,
            aiResponse: response.data
          },
          replace: true
        });
      } else {
        throw new Error('No valid trip ID received from server');
      }

    } catch (error) {
      console.error('❌ Failed to generate itinerary:', error);
      clearInterval(progressInterval);

      console.log('⚠️ Using mock itinerary fallback');
      setGenerationProgress(100);
      setGenerationStatus('Using sample itinerary (backend unavailable)');
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockResponse = generateMockItinerary();

      // ✅ Mock also goes to success screen first
      navigate('/itinerary-success', {
        state: {
          tripId:    mockResponse.trip_id,
          formData,
          aiResponse: mockResponse,
          isMock:    true
        },
        replace: true
      });

    } finally {
      setLoading(false);
    }
  };

  // ── Step renderer ─────────────────────────────────────────────────────────
  const renderStep = () => {
    if (showGeneration) {
      return (
        <GeneratingScreen
          formData={formData}
          progress={generationProgress}
          status={generationStatus}
          error={generationError}
          onComplete={() => console.log('✅ Generation complete')}
          onCancel={() => {
            setShowGeneration(false);
            setGenerationProgress(0);
            setGenerationError(null);
          }}
        />
      );
    }

    switch (currentStep) {
      case 1: return (
        <DestinationStep
          selectedDestination={formData.destination}
          onSelect={handleDestinationSelect}
          onContinue={handleDestinationContinue}
        />
      );
      case 2: return (
        <TravelersStep
          selectedTravelers={formData.travelers?.type}
          onSelect={handleTravelersSelect}
          onContinue={handleTravelersContinue}
        />
      );
      case 3: return (
        <DatesStep
          startDate={formData.startDate}
          endDate={formData.endDate}
          onStartDateSelect={handleStartDateSelect}
          onEndDateSelect={handleEndDateSelect}
          onContinue={handleDatesContinue}
        />
      );
      case 4: return (
        <PreferencesStep
          selectedPreferences={formData.preferences}
          onTogglePreference={handleTogglePreference}
          onContinue={handlePreferencesContinue}
        />
      );
      case 5: return (
        <BudgetStep
          selectedBudget={formData.budget?.type}
          budgetAmount={formData.budget?.amount}
          onSelect={handleBudgetSelect}
          onContinue={handleBudgetContinue}
        />
      );
      case 6: return (
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
      default: return null;
    }
  };

  const isStepValid = () => {
    if (showGeneration) return true;
    switch (currentStep) {
      case 1: return !!formData.destination;
      case 2: return !!formData.travelers;
      case 3: return !!(formData.startDate && formData.endDate);
      case 4: return formData.preferences.length > 0;
      case 5: return !!(formData.budget?.amount && formData.budget?.type);
      default: return true;
    }
  };

  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Step Progress — hidden during generation */}
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

      {/* Step Content */}
      <div className="pb-32">
        {renderStep()}
      </div>

      {/* Continue Button — steps 1–5 only */}
      {!showGeneration && currentStep < 6 && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
          <button
            onClick={() => {
              switch (currentStep) {
                case 1: handleDestinationContinue();  break;
                case 2: handleTravelersContinue();    break;
                case 3: handleDatesContinue();        break;
                case 4: handlePreferencesContinue();  break;
                case 5: handleBudgetContinue();       break;
                default: handleNext();
              }
            }}
            disabled={!isStepValid() || loading}
            className="w-full py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
            style={{
              backgroundColor: isStepValid() && !loading ? PRIMARY_COLOR : PRIMARY_LIGHT,
              color:           isStepValid() && !loading ? 'white'       : PRIMARY_COLOR
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