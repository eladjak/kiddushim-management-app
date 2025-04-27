
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Handle authentication with an auth code
 */
export async function handleAuthCode(
  code: string,
  source: string,
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleAuthCode' });
  
  try {
    log.info("Exchanging auth code for session", { 
      codeSource: source, 
      codeLength: code.length 
    });
    
    // Try to perform code exchange
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      log.error("Error exchanging code for session:", { error, source });
      throw error;
    }
    
    if (data.session) {
      log.info("Successfully exchanged code for session", { 
        userId: data.session.user.id, 
        source 
      });
      
      // Show success message
      showToast(toast, "התחברת בהצלחה");
      
      // Navigate home
      setTimeout(() => {
        log.info("Redirecting to home after code exchange");
        navigate("/", { replace: true });
      }, 300);
      
      return true;
    }
    
    log.error("No session returned after code exchange", { source });
    return false;
  } catch (err) {
    log.error("Error in handleAuthCode:", { error: err, source });
    throw err;
  }
}
