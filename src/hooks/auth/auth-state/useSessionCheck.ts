import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { LoggerType } from "./types";

/**
 * Hook to check and handle existing Supabase sessions
 */
export function useSessionCheck() {
  const { session, setSession, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const log: LoggerType = logger.createLogger({ component: 'useSessionCheck' });

  useEffect(() => {
    const checkExistingSession = async () => {
      setIsLoading(true);
      try {
        log.info("Checking existing session...");
        
        // Check if there's an existing session in local storage
        const storedSession = supabase.auth.getSession();
        
        if (storedSession) {
          log.info("Existing session found in local storage");
          setSession(storedSession);
        } else {
          log.info("No existing session found in local storage");
        }
      } catch (error) {
        log.error("Error checking existing session:", error);
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
      }
    };

    // Run the check only once when the component mounts
    if (!sessionChecked) {
      checkExistingSession();
    }
  }, [navigate, setSession, setIsLoading, sessionChecked, log]);

  return sessionChecked;
}
