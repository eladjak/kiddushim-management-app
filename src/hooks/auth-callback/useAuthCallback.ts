
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import { handleExistingSession } from "./handleExistingSession";
import { handleAuthCode } from "./handleAuthCode";
import { handleImplicitAuth } from "./handleImplicitAuth";
import { handleUrlCode } from "./handleUrlCode";
import { handlePkceError } from "./handlePkceError";
import { extractAccessToken } from "./extractAccessToken";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle the authentication callback process
 */
export function useAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const log = logger.createLogger({ component: 'useAuthCallback' });
  const toast = useToast(); // Get the full toast object

  useEffect(() => {
    let isMounted = true;
    let wasProcessed = false;

    // Check if we have access_token in hash and immediately try to process it
    const hasAccessTokenInHash = window.location.hash && window.location.hash.includes('access_token');
    
    async function processAuthCallback() {
      try {
        log.info("Handling auth callback");
        
        if (!isMounted || wasProcessed) return;
        wasProcessed = true;

        // Get the full URL for better debugging
        const fullUrl = location.state?.fullUrl || window.location.href;
        log.info("Processing callback URL", { url: fullUrl });
        
        // First priority: Extract and process access_token from hash fragment
        // This is critical for Google OAuth which can use implicit flow
        if (hasAccessTokenInHash) {
          log.info("Found access_token in hash, processing");
          const tokenSuccess = await extractAccessToken();
          
          if (tokenSuccess) {
            log.info("Successfully extracted and used access token");
            toast.toast({
              description: "התחברת בהצלחה",
            });
            
            // Short delay before redirecting to ensure state updates
            setTimeout(() => {
              if (isMounted) {
                navigate("/", { replace: true });
              }
            }, 300);
            return;
          } else {
            log.error("Failed to use access token from URL hash");
          }
        }
        
        // Second priority: Check if we have already processed this auth
        const sessionExists = await handleExistingSession(navigate, toast);
        if (sessionExists) return;
        
        // Third priority: Handle code from state (from redirection)
        const stateCode = location.state?.code;
        const authSource = location.state?.authSource;
        
        if (stateCode && stateCode.length > 10) {
          try {
            log.info("Using code from location state");
            await handleAuthCode(stateCode, authSource || 'location_state', navigate, toast);
            return;
          } catch (err) {
            log.error("Error handling state code:", { error: err });
            if (isMounted) {
              await handlePkceError(navigate, setError, setLoading);
              return;
            }
          }
        }

        // Fourth priority: Handle implicit auth flow
        const implicitAuthSuccess = await handleImplicitAuth(navigate, toast);
        if (implicitAuthSuccess) return;
                
        // Fifth priority: Look for code in URL parameters
        try {
          const urlCodeSuccess = await handleUrlCode(navigate, toast);
          if (urlCodeSuccess) return;
        } catch (err) {
          log.error("Error processing URL code:", { error: err });
          if (isMounted) {
            await handlePkceError(navigate, setError, setLoading);
            return;
          }
        }

        // Sixth priority: Try one more direct extractAccessToken approach
        if (hasAccessTokenInHash) {
          log.info("Trying access_token extraction one more time");
          
          // Wait a moment before trying again
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const secondTokenSuccess = await extractAccessToken();
          
          if (secondTokenSuccess) {
            log.info("Successfully extracted and used access token on second attempt");
            toast.toast({
              description: "התחברת בהצלחה",
            });
            
            setTimeout(() => {
              if (isMounted) {
                navigate("/", { replace: true });
              }
            }, 300);
            return;
          }
        }
        
        // If we reach this point, no authentication method worked
        if (isMounted) {
          log.error("No authentication method succeeded");
          await handlePkceError(navigate, setError, setLoading);
        }
      } catch (err: any) {
        log.error("Unexpected error in auth callback:", { error: err });
        if (isMounted) {
          setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
          setLoading(false);
        }
      }
    }

    processAuthCallback();

    return () => {
      isMounted = false;
      log.info("Auth callback page unmounted");
    };
  }, [navigate, location, toast]);

  return { loading, error };
}
