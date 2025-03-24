
import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";

/**
 * Hook to handle loading state and timeouts
 */
export const useLoadingState = (
  user: User | null,
  profile: Profile | null,
  authLoading: boolean
) => {
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const showProfileCreatingMessageRef = useRef(false);
  
  // Handle loading timeouts
  useEffect(() => {
    // Set a timeout for general loading
    const loadingTimeout = setTimeout(() => {
      setLoadingTimedOut(true);
      setLoading(false);
    }, 7000); // 7 seconds timeout
    
    // Set a shorter timeout for profile creation message
    const profileTimeout = setTimeout(() => {
      showProfileCreatingMessageRef.current = true;
    }, 3000); // After 3 seconds show profile creation message
    
    // If loaded, clear timeouts
    if (!authLoading && (user || (!user && !authLoading))) {
      clearTimeout(loadingTimeout);
      setLoading(false);
    }
    
    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(profileTimeout);
    };
  }, [user, profile, authLoading]);
  
  return {
    loading, 
    loadingTimedOut, 
    showProfileCreatingMessageRef
  };
};
