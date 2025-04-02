
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
        
        if (authCode) {
          log.info("Found auth code in URL, processing it directly", { codeLength: authCode.length });
          
          // Manually call exchangeCodeForSession to process the code
          const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
          
          if (error) {
            log.error("Error exchanging code for session:", { error });
            setError(error.message);
            setLoading(false);
            return;
          }
          
          if (data.session) {
            log.info("Session established successfully with code exchange", { 
              userId: data.session.user.id 
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
            return;
          } else {
            log.warn("No session found after code exchange");
            setError("התחברות נכשלה - לא נוצרה סשן לאחר החלפת קוד");
            setLoading(false);
            return;
          }
        }
        
        // If we reach here without a code, check if we already have a session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session in auth callback:", { error });
          setError(error.message);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          // Successfully authenticated
          log.info("Auth callback successful, already has session", { 
            userId: data.session.user.id 
          });
          
          // Redirect to home
          toast({
            description: "התחברת בהצלחה", 
          });
          
          setTimeout(() => {
            navigate("/", { replace: true });
            setLoading(false);
          }, 800);
          return;
        }
        
        // If we still don't have a session, show an error
        log.warn("No session found in auth callback");
        setError("התחברות נכשלה - לא נמצאה סשן משתמש");
        setLoading(false);
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
