
import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/logger";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";

/**
 * Hook to manage loading states and timeouts for the Index page
 */
export const useLoadingState = (
  user: User | null,
  profile: Profile | null,
  authLoading: boolean
) => {
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const log = logger.createLogger({ component: 'useLoadingState' });
  const mountedRef = useRef(true);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showProfileCreatingMessageRef = useRef(false);
  const profileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set loading state based on auth status
  useEffect(() => {
    if (!mountedRef.current) return;
    
    // If auth is no longer loading, or we have a user, we can stop loading
    if (!authLoading || user) {
      if (mountedRef.current) setLoading(false);
    }
    
    // Additional timeout to prevent infinite loading
    timeoutIdRef.current = setTimeout(() => {
      if (loading && mountedRef.current) {
        log.warn("Auth loading timed out");
        setLoadingTimedOut(true);
        setLoading(false);
      }
    }, 800);
    
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [authLoading, user, loading]);

  // Set a timeout to show profile creating message if needed
  useEffect(() => {
    // Clear any existing timeout
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }

    // Reset refs when profile is loaded
    if (profile) {
      showProfileCreatingMessageRef.current = false;
      return;
    }

    if (user && !profile && !authLoading) {
      log.warn("User authenticated but no profile found", {
        userId: user.id.substring(0, 8) + '...',
        email: user.email
      });
      
      // After 3 seconds of waiting for profile, show the profile creating message
      profileTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && user && !profile) {
          showProfileCreatingMessageRef.current = true;
          // Force re-render
          setLoading(prev => !prev);
        }
      }, 3000);
      
      return () => {
        if (profileTimeoutRef.current) {
          clearTimeout(profileTimeoutRef.current);
        }
      };
    }
  }, [user, profile, authLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
      }
    };
  }, []);

  return {
    loading,
    loadingTimedOut,
    showProfileCreatingMessageRef,
    setLoading
  };
};
