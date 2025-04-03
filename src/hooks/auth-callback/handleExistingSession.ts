
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Check for existing session and handle if found
 */
export async function handleExistingSession(
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleExistingSession' });
  
  const existingSession = await supabase.auth.getSession();
  if (existingSession?.data?.session) {
    log.info("Found existing session, skipping code exchange");
    
    // Clear URL parameters
    if (window.history.replaceState) {
      window.history.replaceState(null, document.title, window.location.pathname);
    }
    
    // Show success message
    showToast(toast, "התחברת בהצלחה");
    
    // Navigate home
    setTimeout(() => {
      log.info("Redirecting to home with existing session");
      navigate("/", { replace: true });
    }, 300);
    
    return true;
  }
  
  return false;
}
