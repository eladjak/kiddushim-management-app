
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { User } from "@supabase/supabase-js";

export function useProfileFetcher(user: User | null, setIsLoading: (value: boolean) => void) {
  const [retryCount, setRetryCount] = useState(0);
  const profileCreationAttemptedRef = useRef(false);
  const mountedRef = useRef(true);
  const log = logger.createLogger({ component: 'useProfileFetcher' });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setRetryCount(prev => prev + 1);
      
      // Type assertion for userId to handle Supabase parameter typing
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        log.error("Error fetching profile:", { error, userId });
        return null;
      }

      if (!profile) {
        log.warn("No profile found for user:", { userId, retryAttempt: retryCount });
        return null;
      }

      log.info("Profile fetched successfully:", { userId });
      return profile;
    } catch (error) {
      log.error("Unexpected error in fetchProfile:", error);
      return null;
    }
  }, [retryCount]);

  const cleanup = useCallback(() => {
    mountedRef.current = false;
  }, []);

  return {
    fetchProfile,
    retryCount,
    profileCreationAttemptedRef,
    mountedRef,
    cleanup
  };
}
