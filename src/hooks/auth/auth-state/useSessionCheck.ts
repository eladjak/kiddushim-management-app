
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";

/**
 * Hook to check and handle existing Supabase sessions
 */
export function useSessionCheck() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const log = logger.createLogger({ component: 'useSessionCheck' });

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        log.info("Checking existing session...");
        
        // Check if there's an existing session in local storage
        const { data } = await supabase.auth.getSession();
        const storedSession = data?.session;
        
        if (storedSession) {
          log.info("Existing session found in local storage");
          // Note: We're not directly updating session state since
          // that's handled by the useAuthentication hook now
        } else {
          log.info("No existing session found in local storage");
        }
      } catch (error) {
        log.error("Error checking existing session:", error);
      } finally {
        setSessionChecked(true);
      }
    };

    // Run the check only once when the component mounts
    if (!sessionChecked) {
      checkExistingSession();
    }
  }, [navigate, auth, sessionChecked, log]);

  return sessionChecked;
}
