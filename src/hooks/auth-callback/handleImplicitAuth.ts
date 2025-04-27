
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Check if session is already established via implicit flow
 * או שיש hash fragment שמכיל access_token
 */
export async function handleImplicitAuth(
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleImplicitAuth' });

  try {
    // בדוק אם יש פרגמנט בכתובת שמכיל access_token
    if (window.location.hash && window.location.hash.includes('access_token')) {
      log.info("Found access_token in URL hash, processing implicit flow", {
        hashLength: window.location.hash.length
      });
      
      try {
        // Extract access token directly from the hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          log.error("No access token found in hash");
          return false;
        }

        log.info("Extracted access token from hash", { 
          tokenLength: accessToken.length
        });
        
        // Try to set session with the token
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (error) {
          log.error("Error setting session with access token:", { error });
          return false;
        }
        
        // Check if we have a session now
        if (data.session) {
          log.info("Successfully established session from hash URL", { 
            userId: data.session.user.id 
          });
          
          // Clear the hash from URL
          if (window.history.replaceState) {
            window.history.replaceState(null, document.title, window.location.pathname);
          }
          
          // Show success message
          showToast(toast, "התחברת בהצלחה");
          
          // Navigate home
          setTimeout(() => {
            log.info("Redirecting to home with hash-based auth session");
            navigate("/", { replace: true });
          }, 300);
          
          return true;
        }
      } catch (hashError) {
        log.error("Error processing URL hash for auth:", { error: hashError });
      }
    }
    
    // Check for existing session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      log.info("Session already established via implicit flow", { 
        userId: sessionData.session.user.id 
      });
      
      // Clear any hash or params
      if (window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
      
      // Show success message
      showToast(toast, "התחברת בהצלחה");
      
      // Navigate home
      setTimeout(() => {
        log.info("Redirecting to home with implicit auth session");
        navigate("/", { replace: true });
      }, 300);
      
      return true;
    }
    
    return false;
  } catch (err) {
    log.error("Error checking for implicit session:", { error: err });
    return false;
  }
}
