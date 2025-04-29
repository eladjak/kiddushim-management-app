
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { extractAccessToken } from "./extractAccessToken";
import { showToast } from "./toastHelpers";

/**
 * טיפול בזרימת אימות Implicit עם טיפול טוב יותר בתווים עבריים
 */
export async function handleImplicitAuth(
  navigate: NavigateFunction, 
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleImplicitAuth' });
  
  try {
    log.info("בודק אם יש access_token ב-URL hash");
    
    // בדיקה אם יש פרגמנט בכתובת
    if (!window.location.hash || !window.location.hash.includes('access_token')) {
      log.info("לא נמצא access_token בפרגמנט");
      return false;
    }
    
    // שמירת ה-hash המקורי כגיבוי לפני שהוא נמחק
    const originalHash = window.location.hash;
    
    log.info("נמצא access_token בפרגמנט, מנסה לעבד", {
      hashLength: originalHash.length
    });
    
    // ניקוי ה-URL מפרמטרים רגישים
    try {
      history.replaceState(null, document.title, window.location.pathname);
    } catch (historyError) {
      log.warn("לא ניתן לנקות את ה-URL:", historyError);
    }
    
    const success = await extractAccessToken();
    
    if (success) {
      log.info("עיבוד זרימת Implicit הצליח");
      
      showToast(toastHelper, "התחברת בהצלחה");
      
      // ניווט לדף הבית
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
      
      return true;
    } else {
      log.error("עיבוד ה-access token נכשל");
      return false;
    }
  } catch (err) {
    log.error("שגיאה ב-handleImplicitAuth:", err);
    return false;
  }
}
