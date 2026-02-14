// hooks/useTripForm.js - Backend Integration
import { useState } from 'react';

export const useTripForm = (initialStep = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    destination: null,
    travelers: null,
    startDate: null,
    endDate: null,
    preferences: [],
    budget: null,
    currency: 'USD',
    groupSize: 1,
    accommodationPreference: '',
    transportationPreference: '',
    specificRequirements: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateDestination = (destination) => {
    setFormData(prev => ({
      ...prev,
      destination
    }));
  };

  const updateTravelers = (travelers) => {
    setFormData(prev => ({
      ...prev,
      travelers,
      groupSize: travelers?.groupSize || 1,
      tripType: travelers?.tripType
    }));
  };

  const updateDates = (startDate, endDate) => {
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  };

  const updatePreferences = (preferences) => {
    setFormData(prev => ({
      ...prev,
      preferences
    }));
  };

  const togglePreference = (preferenceId) => {
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

  const updateBudget = (budget) => {
    setFormData(prev => ({
      ...prev,
      budget
    }));
  };

  const updateAccommodationPreference = (preference) => {
    setFormData(prev => ({
      ...prev,
      accommodationPreference: preference
    }));
  };

  const updateTransportationPreference = (preference) => {
    setFormData(prev => ({
      ...prev,
      transportationPreference: preference
    }));
  };

  const updateSpecificRequirements = (requirements) => {
    setFormData(prev => ({
      ...prev,
      specificRequirements: requirements
    }));
  };

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getTripType = () => {
    return formData.travelers?.tripType || 'solo';
  };

  const getBudgetType = () => {
    return formData.budget?.type || 'balanced';
  };

  const getBudgetAmount = () => {
    return formData.budget?.amount || 0;
  };

  const getDestinationString = () => {
    if (!formData.destination) return '';
    const { city, country, full } = formData.destination;
    return full || `${city || ''}, ${country || ''}`.replace(/^, |, $/g, '');
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1: // Destination
        return !!formData.destination;
      case 2: // Travelers
        return !!formData.travelers;
      case 3: // Dates
        return !!(formData.startDate && formData.endDate);
      case 4: // Preferences
        return formData.preferences.length > 0 && formData.preferences.length <= 10;
      case 5: // Budget
        return !!(formData.budget?.type && formData.budget?.amount > 0);
      case 6: // Review
        return true;
      default:
        return false;
    }
  };

  const isFormComplete = () => {
    return (
      formData.destination &&
      formData.travelers &&
      formData.startDate &&
      formData.endDate &&
      formData.preferences.length > 0 &&
      formData.preferences.length <= 10 &&
      formData.budget?.type &&
      formData.budget?.amount > 0
    );
  };

  const getFormSummary = () => {
    return {
      destination: getDestinationString(),
      tripType: getTripType(),
      duration: calculateDuration(),
      preferencesCount: formData.preferences.length,
      budgetType: getBudgetType(),
      budgetAmount: getBudgetAmount(),
      groupSize: formData.groupSize,
      startDate: formData.startDate,
      endDate: formData.endDate
    };
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      destination: null,
      travelers: null,
      startDate: null,
      endDate: null,
      preferences: [],
      budget: null,
      currency: 'USD',
      groupSize: 1,
      accommodationPreference: '',
      transportationPreference: '',
      specificRequirements: ''
    });
  };

  const prefillFromDestination = (destinationData) => {
    setFormData(prev => ({
      ...prev,
      destination: {
        city: destinationData.city,
        country: destinationData.country,
        full: destinationData.full || `${destinationData.city}, ${destinationData.country}`,
        coordinates: destinationData.coordinates
      }
    }));
  };

  return {
    currentStep,
    formData,
    updateFormData,
    updateDestination,
    updateTravelers,
    updateDates,
    updatePreferences,
    togglePreference,
    updateBudget,
    updateAccommodationPreference,
    updateTransportationPreference,
    updateSpecificRequirements,
    calculateDuration,
    getTripType,
    getBudgetType,
    getBudgetAmount,
    getDestinationString,
    isStepValid,
    isFormComplete,
    getFormSummary,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    prefillFromDestination
  };
};