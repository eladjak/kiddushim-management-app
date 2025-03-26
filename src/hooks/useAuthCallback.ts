
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export function useAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'useAuthCallback' });

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        log.info("Handling auth callback");
        setLoading(true);
        
        // First check if we have an access_token in the URL hash (case for OAuth providers)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        
        // If we have tokens in the URL hash, set the session manually
        if (accessToken && refreshToken) {
          log.info("Found tokens in URL hash, setting session");
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            log.error("Error setting session from tokens:", sessionError);
            setError(sessionError.message);
            setLoading(false);
            return;
          }
          
          if (data?.session) {
            log.info("Session set successfully from tokens", { 
              userId: data.session.user.id 
            });
            
            // Clear the URL hash to avoid exposing tokens
            if (window.history.replaceState) {
              window.history.replaceState(null, document.title, window.location.pathname);
            }
            
            // Wait a bit before redirecting to make sure session is saved
            setTimeout(() => {
              navigate("/", { replace: true });
              setLoading(false);
            }, 800);
            return;
          }
        } else {
          log.info("No tokens in URL hash, checking for session");
        }
        
        // Check URL for errors
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");
        
        if (errorParam) {
          const errorMsg = errorDescription || `שגיאת אימות: ${errorParam}`;
          log.error("Auth callback URL contains error:", { error: errorMsg });
          setError(errorMsg);
          setLoading(false);
          return;
        }
        
        // If no tokens in hash, try to get session normally
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session in auth callback:", error);
          setError(error.message);
          setLoading(false);
          return;
        }
        
        if (!data.session) {
          log.warn("No session found in auth callback");
          
          // Try to extract session via URL code parameter (for some OAuth flows)
          const code = url.searchParams.get("code");
          if (code) {
            log.info("Found code in URL, might be handled by Supabase internal");
            
            // The code is handled internally by Supabase, give it a moment
            setTimeout(async () => {
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData.session) {
                log.info("Session retrieved after code exchange");
                navigate("/", { replace: true });
              } else {
                setError("התחברות נכשלה - לא נמצאה סשן משתמש");
              }
              setLoading(false);
            }, 1500);
            return;
          }
          
          setError("התחברות נכשלה - לא נמצאה סשן משתמש");
          setLoading(false);
          return;
        }
        
        // Successfully authenticated
        log.info("Auth callback successful, redirecting to home", { 
          userId: data.session.user.id 
        });
        
        // Force reload to ensure session is properly set in all components
        setTimeout(() => {
          navigate("/", { replace: true });
          setLoading(false);
        }, 800);
      } catch (err: any) {
        log.error("Unexpected error in auth callback:", err);
        setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [navigate]);

  return { loading, error };
}
