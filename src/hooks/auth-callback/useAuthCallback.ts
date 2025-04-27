
import { useState, useEffect, useRef } from "react";
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
  const [processAttempts, setProcessAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const log = logger.createLogger({ component: 'useAuthCallback' });
  const toastHelper = useToast(); // Get the toast object
  const processingRef = useRef(false);
  const maxRetriesRef = useRef(2);
  
  useEffect(() => {
    let isMounted = true;
    
    // קבוע הבעיה: אם כבר מעבדים בקשה, אל תתחיל עוד פעם
    if (processingRef.current) {
      return;
    }
    
    processingRef.current = true;

    async function processAuthCallback() {
      try {
        if (!isMounted) return;

        log.info("Handling auth callback", { attemptNumber: processAttempts + 1 });
        
        // הגבלת מספר נסיונות העיבוד למניעת לופ אינסופי
        if (processAttempts >= maxRetriesRef.current) {
          log.error("Maximum auth processing attempts reached, stopping", { attempts: processAttempts });
          setError("מספר נסיונות מקסימלי הושג. אנא נסה שוב מאוחר יותר.");
          setLoading(false);
          return;
        }
        
        setProcessAttempts(prev => prev + 1);

        // Check if we have access_token in hash
        const hasAccessTokenInHash = window.location.hash && window.location.hash.includes('access_token');
        
        // First priority: Process access_token from hash fragment - MOST IMPORTANT FOR GOOGLE OAUTH
        if (hasAccessTokenInHash) {
          log.info("Found access_token in hash, processing directly", {
            hashLength: window.location.hash.length
          });
          
          // Force a short delay to ensure DOM is fully loaded
          await new Promise(resolve => setTimeout(resolve, 150));
          
          const tokenSuccess = await extractAccessToken();
          
          if (tokenSuccess) {
            log.info("Successfully processed access token from hash");
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            if (isMounted) {
              // Navigate home
              setTimeout(() => {
                navigate("/", { replace: true });
              }, 300);
            }
            return;
          } else {
            log.error("Failed to process access token from hash");
          }
        }
        
        // Second priority: Check for existing session
        const sessionExists = await handleExistingSession(navigate, toastHelper);
        if (sessionExists) return;
        
        // Third priority: Handle code from state (from redirection)
        if (location.state?.code && location.state.code.length > 10) {
          try {
            log.info("Using code from location state");
            await handleAuthCode(location.state.code, location.state?.authSource || 'location_state', navigate, toastHelper);
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
        const implicitAuthSuccess = await handleImplicitAuth(navigate, toastHelper);
        if (implicitAuthSuccess) return;
        
        // Fifth priority: Check for code in URL
        try {
          const urlCodeSuccess = await handleUrlCode(navigate, toastHelper);
          if (urlCodeSuccess) return;
        } catch (err) {
          log.error("Error processing URL code:", { error: err });
          if (isMounted) {
            await handlePkceError(navigate, setError, setLoading);
            return;
          }
        }

        // Sixth priority: One more try with access token if present
        if (hasAccessTokenInHash) {
          log.info("Trying access_token extraction one more time");
          
          // Wait a moment before trying again
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const secondTokenSuccess = await extractAccessToken();
          
          if (secondTokenSuccess) {
            log.info("Successfully extracted token on second attempt");
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            if (isMounted) {
              navigate("/", { replace: true });
            }
            return;
          }
        }
        
        // If we get here, authentication failed
        if (isMounted) {
          log.error("No authentication method succeeded", {
            hasHash: !!window.location.hash,
            hashIncludesAccessToken: hasAccessTokenInHash
          });
          
          // למנוע הפניה אינסופית
          // Check if we're on a domain without www prefix (could cause SSL issues)
          const hostname = window.location.hostname;
          if (hostname === 'kidushishi-menegment-app.co.il' && processAttempts < 1) {
            log.info("Detected non-www domain, redirecting to www version");
            setError("מועבר לכתובת עם תעודת SSL תקינה...");
            
            // Short delay to show the message
            setTimeout(() => {
              const protocol = window.location.protocol;
              const pathname = window.location.pathname;
              const search = window.location.search;
              const hash = window.location.hash;
              window.location.href = `${protocol}//www.kidushishi-menegment-app.co.il${pathname}${search}${hash}`;
            }, 1000);
            return;
          }
          
          await handlePkceError(navigate, setError, setLoading);
        }
      } catch (err: any) {
        log.error("Unexpected error in auth callback:", { error: err });
        if (isMounted) {
          setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
          setLoading(false);
        }
      } finally {
        // וודא שאנחנו מעדכנים את הסטייט ב-unmounting
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Process the callback
    processAuthCallback();

    return () => {
      isMounted = false;
      log.info("Auth callback page unmounted");
    };
  }, [navigate, location, toastHelper, processAttempts]);

  return { loading, error };
}
