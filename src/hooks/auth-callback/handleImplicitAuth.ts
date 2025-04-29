
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { extractAccessToken } from "./extractAccessToken";
import { showToast } from "./toastHelpers";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handle implicit authentication flow with improved error handling for Hebrew characters
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
    
    // ננסה להשתמש באפשרות הראשונה - חילוץ טוקן מהכתובת
    let success = await extractAccessToken();
    
    // אם לא הצליח, ננסה דרך אחרת - להשתמש ב-getUser API
    if (!success) {
      log.info("Direct token extraction failed, trying alternative approach");
      
      try {
        // קבלת המידע מה-hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // שימוש ב-API אחר של Supabase
          const { data, error } = await supabase.auth.getUser(accessToken);
          
          if (error) {
            log.error("Error getting user with access token:", error);
          } else if (data?.user) {
            log.info("Successfully retrieved user with access token", {
              userId: data.user.id,
              email: data.user.email
            });
            
            // ניסיון להגדיר את הסשן באופן ידני
            try {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: hashParams.get('refresh_token') || '',
              });
              log.info("Successfully set session manually");
              success = true;
            } catch (setSessionError) {
              log.error("Error setting session manually:", { error: setSessionError });
            }
          }
        }
      } catch (altError) {
        log.error("Error in alternative token approach:", { error: altError });
      }
    }
    
    if (success) {
      log.info("Successfully processed implicit auth flow");
      
      // הצגת הודעת הצלחה
      showToast(toastHelper, "התחברת בהצלחה");
      
      // ניווט לדף הבית
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
      
      return true;
    }
    
    log.error("Failed to process access token after all attempts");
    return false;
  } catch (err) {
    log.error("Error in handleImplicitAuth:", { error: err });
    return false;
  }
}
