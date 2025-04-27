
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
    let isMounted = true;
    let wasProcessed = false;

    async function processAuthCallback() {
      try {
        log.info("Handling auth callback");
        
        if (!isMounted || wasProcessed) return;
        wasProcessed = true;

        // Get the full URL for better debugging
        const fullUrl = location.state?.fullUrl || window.location.href;
        log.info("Processing callback URL", { url: fullUrl });
        
        // First try to extract and use access token from hash fragment (highest priority for Google Auth)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const tokenSuccess = await extractAccessToken();
          if (tokenSuccess) {
            toast({
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
        
        // Check if we have already processed this auth
        const sessionExists = await handleExistingSession(navigate, toast);
        if (sessionExists) return;
        
        // Try to extract code from state (preferred method as it's most reliable)
        const stateCode = location.state?.code;
        const authSource = location.state?.authSource;
        
        if (stateCode && stateCode.length > 10) {
          try {
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

        // בדוק אם יש תהליך אימות אימפליסיטי (כלומר, תגיות באש URL)
        // זו הבדיקה החשובה ביותר עבור התחברות Google!
        const implicitAuthSuccess = await handleImplicitAuth(navigate, toast);
        if (implicitAuthSuccess) return;
                
        // בדיקה לקוד ב-URL params  
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
        
        // אין קוד ואין סשן, כנראה שגיאה עם הפניות דומיין
        if (isMounted) {
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
