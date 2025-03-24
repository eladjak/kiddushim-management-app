
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { User } from "@supabase/supabase-js";

/**
 * Hook to handle profile fetching logic
 */
export function useProfileFetcher(user: User | null, setIsLoading: (value: boolean) => void) {
  const [retryCount, setRetryCount] = useState(0);
  const log = logger.createLogger({ component: 'useProfileFetcher' });
  const mountedRef = useRef(true);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileCreationAttemptedRef = useRef(false);

  /**
   * Fetch user profile from the database
   */
  const fetchProfile = async (userId: string) => {
    try {
      log.info("Fetching profile for user:", { userId, retry: retryCount });
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!mountedRef.current) return null;

      if (error) {
        if (error.code === 'PGRST116') { // Row not found
          log.info("Profile not found, it may be created by the trigger soon");
          
          // Wait a moment and try again
          if (retryCount < 5) { // Increased from 3 to 5 for more retries
            const newRetryCount = retryCount + 1;
            log.info("Retrying profile fetch...", { retryCount: newRetryCount });
            if (mountedRef.current) setRetryCount(newRetryCount);
            
            return new Promise(resolve => {
              retryTimerRef.current = setTimeout(() => {
                if (mountedRef.current) {
                  resolve(fetchProfile(userId));
                } else {
                  resolve(null);
                }
              }, 1500);
            });
          }
          
          return null;
        }
        
        log.error("Error fetching profile:", { error });
        if (mountedRef.current) setIsLoading(false);
        return null;
      }

      log.info("Profile fetched successfully");
      return data;
    } catch (error) {
      log.error("Error fetching profile:", { error });
      if (mountedRef.current) setIsLoading(false);
      return null;
    }
  };

  /**
   * Cleanup function to handle component unmounting
   */
  const cleanup = () => {
    mountedRef.current = false;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
    }
  };

  return {
    fetchProfile,
    retryCount,
    profileCreationAttemptedRef,
    mountedRef,
    cleanup
  };
}
