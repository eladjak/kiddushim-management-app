
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const ONBOARDING_STORAGE_KEY = "kidushishi_onboarding_completed";

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    // Check if user is authenticated and has a profile
    if (user && profile) {
      const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      
      if (!hasCompletedOnboarding) {
        setIsFirstTime(true);
        setShowOnboarding(true);
      }
    }
  }, [user, profile]);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setShowOnboarding(false);
    setIsFirstTime(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setShowOnboarding(false);
    setIsFirstTime(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsFirstTime(true);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isFirstTime,
    completeOnboarding,
    skipOnboarding,
    startOnboarding,
    resetOnboarding
  };
};
