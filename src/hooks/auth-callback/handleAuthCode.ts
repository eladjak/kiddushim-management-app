
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Handle authentication with a code from URL or state
 */
export async function handleAuthCode(
  code: string, 
  source: string, 
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleAuthCode' });

  log.info("Processing auth code", { 
    codeLength: code.length,
    source 
  });
  
  try {
    // Process the auth code
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      log.error("Error exchanging code for session:", { error: exchangeError });
      
      // If error mentions PKCE, indicates special handling needed
      if (exchangeError.message && exchangeError.message.includes("pkce")) {
        return false;
      }
      
      throw new Error(`שגיאת החלפת קוד לסשן: ${exchangeError.message}`);
    }
    
    if (!data.session) {
      log.warn("No session found after code exchange");
      throw new Error("התחברות נכשלה - לא נוצרה סשן לאחר החלפת קוד");
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
    showToast(toast, "התחברת בהצלחה");
    
    // Navigate home
    setTimeout(() => {
      log.info("Redirecting to home after successful authentication");
      navigate("/", { replace: true });
    }, 300);
    
    return true;
  } catch (err) {
    log.error("Error in code exchange process:", { error: err });
    throw err;
  }
}
