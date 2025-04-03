
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
        
        // First check for an auth code in the URL query parameters (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");
        
        if (!authCode) {
          log.warn("No auth code found in URL");
          setError("התחברות נכשלה - לא נמצא קוד אימות בכתובת");
          setLoading(false);
          return;
        }
        
        log.info("Found auth code in URL, processing it", { codeLength: authCode.length });
        
        // Manually call exchangeCodeForSession to process the code
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
