
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Check if session is already established via implicit flow
 */
export async function handleImplicitAuth(
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleImplicitAuth' });

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
