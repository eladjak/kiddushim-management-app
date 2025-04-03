
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";

export function useAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const log = logger.createLogger({ component: 'useAuthCallback' });
  const { toast } = useToast();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        log.info("Handling auth callback");
        setLoading(true);
        
        // Get the raw URL for better debugging
        const fullUrl = window.location.href;
        log.info("Processing callback URL", { url: fullUrl });
        
        // Check for an auth code in different parts of the URL
        let authCode: string | null = null;
        
        // Check in search params (most common)
        const urlParams = new URLSearchParams(window.location.search);
        authCode = urlParams.get("code");
        
        // If not found in search params, check if it's in the pathname
        if (!authCode) {
          // Sometimes the URL might be formatted differently with the code in the path
          // Example: /auth/callback/CODE instead of /auth/callback?code=CODE
          const pathParts = window.location.pathname.split('/');
          const lastPart = pathParts[pathParts.length - 1];
          
          if (lastPart && lastPart !== 'callback') {
            authCode = lastPart;
            log.info("Found potential code in URL path", { code: authCode });
          }
        }
        
        // Check in hash fragment (sometimes redirects put it here)
        if (!authCode && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          authCode = hashParams.get("code");
          if (authCode) {
            log.info("Found code in URL hash fragment", { codeLength: authCode.length });
          }
        }
        
        // If we still don't have a code, check for errors
        if (!authCode) {
          log.warn("No auth code found in URL", { fullUrl });
          
          // Check for error parameters
          const errorParam = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          if (errorParam || errorDescription) {
            const errorMessage = errorDescription || errorParam || "Unknown error";
            log.error("Auth error from provider", { error: errorParam, description: errorDescription });
            setError(`שגיאה מספק האימות: ${errorMessage}`);
          } else {
            setError("התחברות נכשלה - לא נמצא קוד אימות בכתובת");
          }
          
          setLoading(false);
          return;
        }
        
        log.info("Found auth code, processing it", { codeLength: authCode.length });
        
        // Process the auth code
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
        
        if (exchangeError) {
          log.error("Error exchanging code for session:", { error: exchangeError });
          
          // Enhanced error message for debugging OAuth flow
          setError(`שגיאת החלפת קוד לסשן: ${exchangeError.message} (${exchangeError.status || 'unknown status'})`);
          setLoading(false);
          return;
        }
        
        if (!data.session) {
          log.warn("No session found after code exchange");
          setError("התחברות נכשלה - לא נוצרה סשן לאחר החלפת קוד");
          setLoading(false);
          return;
        }
        
        // Successfully authenticated
        log.info("Session established successfully with code exchange", { 
          userId: data.session.user.id,
          provider: data.session.user.app_metadata.provider
        });
        
        // Clear URL parameters
        if (window.history.replaceState) {
          window.history.replaceState(null, document.title, window.location.pathname);
        }
        
        // Show success message
        toast({
          description: "התחברת בהצלחה",
        });
        
        // Navigate home
        setTimeout(() => {
          log.info("Redirecting to home after successful authentication");
          navigate("/", { replace: true });
        }, 500);
        
      } catch (err: any) {
        log.error("Unexpected error in auth callback:", { error: err });
        setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [navigate]);

  return { loading, error };
}
