
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import { handleExistingSession } from "./handleExistingSession";
import { handleAuthCode } from "./handleAuthCode";
import { handleImplicitAuth } from "./handleImplicitAuth";
import { handleUrlCode } from "./handleUrlCode";
import { handlePkceError } from "./handlePkceError";

/**
 * Hook to handle the authentication callback process
 */
export function useAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const log = logger.createLogger({ component: 'useAuthCallback' });
  const toast = useToast();

  useEffect(() => {
    async function processAuthCallback() {
      try {
        log.info("Handling auth callback");
        setLoading(true);
        
        // Get the full URL for better debugging
        const fullUrl = location.state?.fullUrl || window.location.href;
        log.info("Processing callback URL", { url: fullUrl });
        
        // First check if we have already processed this auth
        const sessionExists = await handleExistingSession(navigate, toast);
        if (sessionExists) return;
        
        // First try to extract code from state (preferred method as it's most reliable)
        const stateCode = location.state?.code;
        const authSource = location.state?.authSource;
        
        if (stateCode && stateCode.length > 10) {
          try {
            await handleAuthCode(stateCode, authSource || 'location_state', navigate, toast);
            return;
          } catch (err) {
            log.error("Error handling state code:", { error: err });
            await handlePkceError(navigate, setError, setLoading);
            return;
          }
        }

        // Check if session is already established via implicit flow
        const implicitAuthSuccess = await handleImplicitAuth(navigate, toast);
        if (implicitAuthSuccess) return;
                
        // Check for code in URL parameters
        try {
          const urlCodeSuccess = await handleUrlCode(navigate, toast);
          if (urlCodeSuccess) return;
        } catch (err) {
          log.error("Error processing URL code:", { error: err });
          await handlePkceError(navigate, setError, setLoading);
          return;
        }
        
        // No code and no session, likely an error with domain redirects
        await handlePkceError(navigate, setError, setLoading);
      } catch (err: any) {
        log.error("Unexpected error in auth callback:", { error: err });
        setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
        setLoading(false);
      }
    }

    processAuthCallback();
  }, [navigate, location, toast]);

  return { loading, error };
}
