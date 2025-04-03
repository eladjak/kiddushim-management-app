
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
        
        // Get the full URL for better debugging
        const fullUrl = location.state?.fullUrl || window.location.href;
        log.info("Processing callback URL", { url: fullUrl });
        
        // Check for an auth code in different parts of the URL
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");
        
        // If no code is in the URL directly, it might be handled by the client automatically
        // So we'll check the session directly
        if (!authCode) {
          log.info("No explicit code in URL, checking session directly");
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            log.error("Error getting session:", { error: sessionError });
            setError(sessionError.message);
            setLoading(false);
            return;
          }
          
          if (sessionData.session) {
            log.info("Session is already established", { userId: sessionData.session.user.id });
            
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
            
            return;
          }
          
          // No code and no session, likely an error
          setError("התחברות נכשלה - לא התקבל קוד אימות");
          setLoading(false);
          return;
        }
        
        // With automatic code exchange disabled, process code manually
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
  }, [navigate, location]);

  return { loading, error };
}
