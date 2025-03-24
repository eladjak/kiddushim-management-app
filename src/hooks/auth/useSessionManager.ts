
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Hook to manage session retrieval and validation
 */
export function useSessionManager() {
  const [error, setError] = useState<string | null>(null);
  const log = logger.createLogger({ component: 'useSessionManager' });

  /**
   * Get current session data
   */
  const getSession = async () => {
    try {
      log.info("Getting session");
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        log.error("Error getting session:", { error });
        setError(error.message);
        return null;
      }
      
      if (!data.session) {
        log.error("No session found");
        setError("לא ניתן למצוא פרטי משתמש. אנא נסה להתחבר שוב.");
        return null;
      }
      
      log.info("Session retrieved successfully");
      return data.session;
    } catch (error: any) {
      log.error("Unexpected error getting session:", { error });
      setError(error.message || "שגיאה לא צפויה בקבלת נתוני משתמש");
      return null;
    }
  };

  /**
   * Clean URL hash after authentication
   */
  const cleanUrlHash = () => {
    try {
      window.history.replaceState({}, document.title, "/");
      log.info("URL hash cleaned");
    } catch (error) {
      log.error("Error cleaning URL hash:", { error });
      // Non-critical error, don't set error state
    }
  };

  return {
    getSession,
    cleanUrlHash,
    error,
    setError
  };
}
