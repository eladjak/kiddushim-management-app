
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
        
        // First check if we have already processed this auth
        const existingSession = await supabase.auth.getSession();
        if (existingSession?.data?.session) {
          log.info("Found existing session, skipping code exchange");
          
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
            log.info("Redirecting to home with existing session");
            navigate("/", { replace: true });
          }, 300);
          
          return;
        }
        
        // First try to extract code from state (preferred method as it's most reliable)
        const stateCode = location.state?.code;
        const authSource = location.state?.authSource;
        
        if (stateCode && stateCode.length > 10) {
          log.info("Found code in location state", { 
            codeLength: stateCode.length,
            source: authSource || 'unknown' 
          });
          
          try {
            // Process the auth code
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(stateCode);
            
            if (exchangeError) {
              log.error("Error exchanging code for session:", { error: exchangeError });
              
              // If error mentions PKCE, handle specially
              if (exchangeError.message && exchangeError.message.includes("pkce")) {
                await handlePkceError();
                return;
              }
              
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
            }, 300);
            
            return;
          } catch (err) {
            log.error("Unexpected error exchanging code:", { error: err });
            await handlePkceError();
            return;
          }
        }

        // Check if session is already established via implicit flow
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            log.info("Session already established via implicit flow", { 
              userId: sessionData.session.user.id 
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
              log.info("Redirecting to home with implicit auth session");
              navigate("/", { replace: true });
            }, 300);
            
            return;
          }
        } catch (err) {
          log.error("Error checking for implicit session:", { error: err });
          // Continue checking for other auth methods
        }
                
        // Check for an auth code in URL parameters (we're not using state here)
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");
        
        if (authCode && authCode.length > 10) {
          log.info("Found auth code in URL parameters", { codeLength: authCode.length });
          
          // Process the auth code
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
            
            if (exchangeError) {
              log.error("Error exchanging code for session:", { error: exchangeError });
              
              // If error mentions PKCE, handle specially
              if (exchangeError.message && exchangeError.message.includes("pkce")) {
                await handlePkceError();
                return;
              }
              
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
            }, 300);
            
            return;
          } catch (err) {
            log.error("Unexpected error exchanging code:", { error: err });
            await handlePkceError();
            return;
          }
        }
        
        // No code and no session, likely an error with domain redirects
        await handlePkceError();
      } catch (err: any) {
        log.error("Unexpected error in auth callback:", { error: err });
        setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
        setLoading(false);
      }
    }
    
    async function handlePkceError() {
      log.info("Handling potential PKCE error or SSL certificate domain mismatch");
      
      // Check if we were redirected from www.domain to domain or vice versa
      const hostname = window.location.hostname;
      const isNonWwwDomain = hostname === 'kidushishi-menegment-app.co.il';
      
      if (isNonWwwDomain) {
        log.info("Detected non-www domain that may cause SSL issues", { hostname });
        
        setError("ההתחברות נכשלה בגלל בעיית תעודה - לאתר יש תעודת אבטחה רק עבור www.kidushishi-menegment-app.co.il, לא kidushishi-menegment-app.co.il. אנא השתמש בכתובת המתחילה ב-www.");
        setLoading(false);
        return;
      }
      
      // Clean up all auth state and redirect to auth page
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear out any leftover verifiers
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('supabase.auth.') || key.includes('kidushishi-auth-token'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      setError("התחברות נכשלה - קרתה בעיה באימות. אנא נסה שוב.");
      setLoading(false);
    }

    handleAuthCallback();
  }, [navigate, location, toast]);

  return { loading, error };
}
