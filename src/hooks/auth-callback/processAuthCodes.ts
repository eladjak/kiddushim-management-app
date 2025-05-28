
import { logger } from "@/utils/logger";
import { useLocation } from "react-router-dom";
import { handleAuthCode } from "./handleAuthCode";
import type { AuthCallbackContext, AuthProcessResult } from "./types";

/**
 * מעבד קודי אימות מסוגים שונים
 */
export async function processAuthCodes(
  context: AuthCallbackContext,
  location: ReturnType<typeof useLocation>
): Promise<AuthProcessResult> {
  const log = logger.createLogger({ component: 'processAuthCodes' });
  const { navigate, toastHelper } = context;
  
  try {
    const urlCode = new URLSearchParams(window.location.search).get('code');
    const stateCode = location.state?.code;
    
    // מסלול 1: קוד סשן מהסטייט
    if (stateCode && stateCode.length > 10) {
      log.info("📋 נמצא קוד ב-location state, מעבד");
      const success = await handleAuthCode(stateCode, 'location_state', navigate, toastHelper);
      
      if (success) {
        log.info("✅ עיבוד קוד מסטייט הצליח");
        return { success: true, source: 'location_state' };
      } else {
        log.error("❌ עיבוד קוד מסטייט נכשל");
      }
    }
    
    // מסלול 2: קוד ב-URL
    if (urlCode && urlCode.length > 10) {
      log.info("🔗 נמצא קוד בפרמטרי ה-URL, מעבד");
      
      const success = await handleAuthCode(urlCode, 'url_direct', navigate, toastHelper);
      
      if (success) {
        log.info("✅ עיבוד קוד מה-URL הצליח");
        return { success: true, source: 'url_direct' };
      } else {
        log.error("❌ עיבוד קוד מה-URL נכשל");
      }
    }
    
    return { success: false };
  } catch (err) {
    log.error("🚨 שגיאה בעיבוד קודי אימות:", err);
    return { success: false };
  }
}
