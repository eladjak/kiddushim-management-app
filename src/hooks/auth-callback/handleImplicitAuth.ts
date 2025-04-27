
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";
import { extractAccessToken } from "./extractAccessToken";

/**
 * Handle implicit auth flow (missing code but was redirected)
 */
export async function handleImplicitAuth(
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleImplicitAuth' });
  
  try {
    log.info("Checking for implicit auth flow");
    
    // First priority: check for access_token in hash
    if (window.location.hash && window.location.hash.includes('access_token')) {
      log.info("Found access_token in hash, processing");
      const success = await extractAccessToken();
      
      if (success) {
        log.info("Successfully processed access token from hash");
        showToast(toast, "התחברת בהצלחה");
        
        // Navigate home
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 300);
        
        return true;
      } else {
        log.error("Failed to process access token from hash");
      }
    }
    
    // Second priority: Check if we were redirected from auth
    const wasRedirected = localStorage.getItem('auth_redirect_initiated') === 'true' || 
                         sessionStorage.getItem('auth_redirect_initiated') === 'true';
    
    if (!wasRedirected) {
      log.info("Not part of an auth redirect flow");
      return false;
    }
    
    log.info("Was redirected from auth, checking current session");
    
    // Clear the redirect flags
    localStorage.removeItem('auth_redirect_initiated');
    localStorage.removeItem('auth_redirect_time');
    sessionStorage.removeItem('auth_redirect_initiated');
    sessionStorage.removeItem('auth_redirect_time');
    
    // Check if we have a session now (might have been set by OAuth provider)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log.error("Error checking session after redirect:", { error });
      return false;
    }
    
    if (data.session) {
      log.info("Found session after auth redirect", {
        userId: data.session.user.id,
      });
      
      // Show success message
      showToast(toast, "התחברת בהצלחה");
      
      // Navigate home
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 300);
      
      return true;
    }
    
    log.info("No session found after auth redirect");
    return false;
  } catch (err) {
    log.error("Error in handleImplicitAuth:", { error: err });
    return false;
  }
}
