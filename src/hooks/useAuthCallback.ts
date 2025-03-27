
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export function useAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const log = logger.createLogger({ component: 'useAuthCallback' });

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        log.info("Handling auth callback");
        setLoading(true);
        
        // First check for an auth code in the URL query parameters (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");
        
        if (authCode) {
          log.info("Found auth code in URL, waiting for Supabase to process it");
          
          // The code is handled internally by Supabase's PKCE flow
          // Wait for Supabase to process the code and establish session
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if session was established
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            log.error("Error getting session after code exchange:", sessionError);
            setError(sessionError.message);
            setLoading(false);
            return;
          }
          
          if (sessionData.session) {
            log.info("Session established after code exchange", { 
              userId: sessionData.session.user.id 
            });
            
            // Clear URL parameters to remove code
            if (window.history.replaceState) {
              window.history.replaceState(null, document.title, window.location.pathname);
            }
            
            // Navigate to home page
            setTimeout(() => {
              navigate("/", { replace: true });
              setLoading(false);
            }, 800);
            return;
          } else {
            log.warn("No session found after code exchange");
            setError("התחברות נכשלה - לא נוצרה סשן לאחר החלפת קוד");
            setLoading(false);
            return;
          }
        }
        
        // Then check for access_token in the URL hash (old flow)
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
        }
        
        // Check URL for errors
        const errorParam = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");
        
        if (errorParam) {
          const errorMsg = errorDescription || `שגיאת אימות: ${errorParam}`;
          log.error("Auth callback URL contains error:", { error: errorMsg });
          setError(errorMsg);
          setLoading(false);
          return;
        }
        
        // If we reach here, we don't have tokens or code, try to get session normally
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session in auth callback:", error);
          setError(error.message);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          // Successfully authenticated
          log.info("Auth callback successful, redirecting to home", { 
            userId: data.session.user.id 
          });
          
          // Force reload to ensure session is properly set in all components
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
        log.error("Unexpected error in auth callback:", err);
        setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [navigate]);

  return { loading, error };
}
