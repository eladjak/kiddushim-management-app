
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { extractAccessToken } from "./extractAccessToken";
import { showToast } from "./toastHelpers";

/**
 * Handle implicit authentication flow
 */
export async function handleImplicitAuth(
  navigate: NavigateFunction, 
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleImplicitAuth' });
  
  try {
    log.info("Checking for access_token in URL hash");
    
    // בדיקה אם יש פרגמנט בכתובת
    if (!window.location.hash || !window.location.hash.includes('access_token')) {
      log.info("No access_token found in hash");
      return false;
    }
    
    log.info("Found access_token in hash, attempting to process");
    
    // פרוש את הטוקן מהפרגמנט ונסה להגדיר סשן
    const success = await extractAccessToken();
    
    if (success) {
      log.info("Successfully processed implicit auth flow");
      
      // הצגת הודעת הצלחה
      showToast(toastHelper, "התחברת בהצלחה");
      
      // ניווט לדף הבית
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 300);
      
      return true;
    }
    
    log.error("Failed to process access token");
    return false;
  } catch (err) {
    log.error("Error in handleImplicitAuth:", { error: err });
    return false;
  }
}
