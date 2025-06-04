
import { logger } from "@/utils/logger";
import { processAccessToken } from "./processAccessToken";
import { processAuthCodes } from "./processAuthCodes";
import { checkExistingSession } from "./checkExistingSession";
import { handleAuthFailure } from "./handleAuthFailure";
import type { AuthCallbackContext } from "./types";
import type { Location } from "react-router-dom";

/**
 * מעבד את כל זרימת הקולבק בצורה מסודרת
 */
export async function processCallback(
  context: AuthCallbackContext,
  location: Location
): Promise<void> {
  const log = logger.createLogger({ component: 'processCallback' });
  
  try {
    const hasAccessToken = window.location.hash && window.location.hash.includes('access_token');
    const urlCode = new URLSearchParams(window.location.search).get('code');
    const stateCode = location.state?.code;
    
    // אם יש hash שמור ב-state, נשחזר אותו
    const preservedHash = location.state?.originalHash;
    const preservedUrl = location.state?.preservedUrl;
    
    log.info("🔍 מעבד כתובת קולבק - סקירה ראשונית", {
      hasHash: !!window.location.hash,
      hashLength: window.location.hash ? window.location.hash.length : 0,
      hasAccessToken,
      hasUrlCode: !!urlCode,
      hasStateCode: !!stateCode,
      hasPreservedHash: !!preservedHash,
      hasPreservedUrl: !!preservedUrl,
      currentUrl: window.location.href.substring(0, 100) + "..."
    });
    
    // אם יש hash שמור, נשחזר אותו זמנית לצורך עיבוד
    if (preservedHash && !hasAccessToken) {
      log.info("🔄 משחזר hash שמור לצורך עיבוד", { preservedHash: preservedHash.substring(0, 50) + "..." });
      
      // שחזור זמני של ה-hash
      window.location.hash = preservedHash;
      
      // עיבוד מיידי
      const result = await processAccessToken(context);
      if (result.success) {
        return;
      }
      
      // ניקוי ה-hash לאחר העיבוד
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // מסלול 1: access_token ב-hash (זהו המסלול העיקרי לגוגל אוט')
    if (hasAccessToken) {
      const result = await processAccessToken(context);
      if (result.success) {
        return;
      }
    }
    
    // מסלול 2 ו-3: קודי אימות
    const codesResult = await processAuthCodes(context, location);
    if (codesResult.success) {
      return;
    }
    
    // מסלול 4: בדיקת סשן קיים
    const sessionResult = await checkExistingSession(context);
    if (sessionResult.success) {
      return;
    }
    
    // אם הגענו לכאן - לא הצלחנו לזהות שיטת אימות
    log.warn("⚠️ לא נמצאה שיטת אימות תקפה");
    handleAuthFailure(context);
    
  } catch (err) {
    log.error("🚨 שגיאה בלתי צפויה במעבד הקולבק:", { error: err });
    handleAuthFailure(context);
  }
}
