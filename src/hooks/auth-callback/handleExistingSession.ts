
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Check if we already have a valid session
 */
export async function handleExistingSession(
  navigate: NavigateFunction,
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleExistingSession' });

  try {
    log.info("Checking for existing session");
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log.error("Error checking for existing session:", { error });
      return false;
    }
    
    if (data.session) {
      log.info("Session already exists", { 
        userId: data.session.user.id 
      });
      
      // Show success message
      showToast(toastHelper, "התחברת בהצלחה");
      
      // Navigate home
      setTimeout(() => {
        log.info("Redirecting to home with existing session");
        navigate("/", { replace: true });
      }, 300);
      
      return true;
    }
    
    log.info("No existing session found");
    return false;
  } catch (err) {
    log.error("Error in handleExistingSession:", { error: err });
    return false;
  }
}
