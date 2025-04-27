
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";
import { extractAccessToken } from "./extractAccessToken";

/**
 * טיפול במצב של אימות שמגיע מפרוטוקול implicit flow
 * במיוחד רלוונטי לספקי זהות שמחזירים access_token במקום קוד אוטוריזציה
 */
export async function handleImplicitAuth(
  navigate: NavigateFunction,
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleImplicitAuth' });
  
  try {
    // בדיקה אם מדובר באימות בפרוטוקול implicit flow (לא PKCE)
    const isRedirectAuth = sessionStorage.getItem('auth_redirect_initiated') === 'true';
    const authTimestamp = parseInt(sessionStorage.getItem('auth_redirect_time') || '0');
    const currentTime = Date.now();
    
    // אם לא התחיל תהליך אימות או שעבר יותר מדי זמן, זה כנראה לא חלק מתהליך אימות
    if (!isRedirectAuth || currentTime - authTimestamp > 300000) { // 5 דקות
      log.info("Not part of an auth redirect flow", {
        isRedirectAuth,
        timeDiff: currentTime - authTimestamp
      });
      return false;
    }

    log.info("Detected return from auth redirect, checking for tokens");
    
    // ניקוי נתוני מעקב אימות
    sessionStorage.removeItem('auth_redirect_initiated');
    sessionStorage.removeItem('auth_redirect_time');
    
    // בדיקה אם יש access_token בחלק ה-hash של הכתובת
    if (window.location.hash && window.location.hash.includes('access_token')) {
      log.info("Found access_token in hash, processing");
      
      const success = await extractAccessToken();
      
      if (success) {
        log.info("Successfully set session from implicit flow");
        
        showToast(toastHelper, "התחברת בהצלחה");
        
        // ניווט לדף הבית
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 300);
        
        return true;
      }
    }
    
    log.info("No tokens found or failed to process tokens");
    return false;
  } catch (err) {
    log.error("Error in handleImplicitAuth:", { error: err });
    return false;
  }
}
