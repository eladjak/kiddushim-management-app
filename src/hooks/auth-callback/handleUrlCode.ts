
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { handleAuthCode } from "./handleAuthCode";
import { ToastType } from "./types";

/**
 * טיפול בקוד אימות מפרמטרי ה-URL
 * עם יכולות בדיקה ועיבוד משופרות
 */
export async function handleUrlCode(
  navigate: NavigateFunction,
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleUrlCode' });
  
  try {
    log.info("בודק אם יש קוד אימות בפרמטרי ה-URL");
    
    // חילוץ מפרמטרי ה-URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      log.info("לא נמצא קוד אימות ב-URL");
      return false;
    }
    
    log.info("נמצא קוד אימות ב-URL", { codeLength: code.length });
    
    // וידוא שהקוד נראה תקף - צריך להיות ארוך מספיק
    if (code.length < 10) {
      log.warn("קוד אימות קצר מדי", { codeLength: code.length });
      return false;
    }
    
    // ניסיון החלפת הקוד לסשן
    return await handleAuthCode(code, 'url_params', navigate, toastHelper);
  } catch (err) {
    log.error("שגיאה בטיפול בקוד מה-URL:", { error: err });
    return false;
  }
}
