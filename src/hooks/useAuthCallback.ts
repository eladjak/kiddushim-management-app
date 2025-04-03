
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
        
        // First try to extract code from state (preferred method as it's most reliable)
        const stateCode = location.state?.code;
        if (stateCode && stateCode.length > 10) {
          log.info("Found code in location state", { codeLength: stateCode.length });
          
          // Process the auth code
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(stateCode);
          
          if (exchangeError) {
            log.error("Error exchanging code for session:", { error: exchangeError });
            setError(`שגיאת החלפת קוד לסשן: ${exchangeError.message}`);
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
          log.info("Session established successfully with code from state", { 
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
        }

        // Check for an auth code in URL parameters 
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");
        
        if (authCode && authCode.length > 10) {
          log.info("Found auth code in URL parameters", { codeLength: authCode.length });
          
          // Process the auth code
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
          
          if (exchangeError) {
            log.error("Error exchanging code for session:", { error: exchangeError });
            setError(`שגיאת החלפת קוד לסשן: ${exchangeError.message}`);
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
          
          return;
        }
        
        // Check if code is in hash fragment
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashCode = hashParams.get("code");
          
          if (hashCode && hashCode.length > 10) {
            log.info("Found auth code in URL hash", { codeLength: hashCode.length });
            
            // Process the auth code
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(hashCode);
            
            if (exchangeError) {
              log.error("Error exchanging code for session:", { error: exchangeError });
              setError(`שגיאת החלפת קוד לסשן: ${exchangeError.message}`);
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
            log.info("Session established successfully with hash code", { 
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
          }
        }

        // Check for code in URL path (common in some OAuth providers)
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart !== 'callback' && lastPart.length > 20) {
          log.info("Found potential auth code in path", { codeLength: lastPart.length });
          
          // Process the auth code
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(lastPart);
          
          if (exchangeError) {
            log.error("Error exchanging code for session:", { error: exchangeError });
            setError(`שגיאת החלפת קוד לסשן: ${exchangeError.message}`);
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
          log.info("Session established successfully with path code", { 
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
        }
        
        // If no code is found anywhere, check if session might already be established
        log.info("No explicit code found, checking session directly");
        
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
        setError("התחברות נכשלה - לא התקבל קוד אימות. ייתכן שהסיבה לכך היא שהדפדפן הפנה אותך מ-kidushishi-menegment-app.co.il ל-www.kidushishi-menegment-app.co.il בגלל אישור SSL.");
        setLoading(false);
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
