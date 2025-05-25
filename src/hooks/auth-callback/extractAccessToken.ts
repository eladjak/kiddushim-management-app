
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { safeEncode, safeDecode, containsNonLatinChars } from "@/utils/encoding";

/**
 * מחלץ access token מכתובת URL
 */
export async function extractAccessToken(): Promise<boolean> {
  const log = logger.createLogger({ component: 'extractAccessToken' });
  
  try {
    log.info("מחלץ access token מה-URL");
    
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) {
      log.error("לא נמצא access token בכתובת URL");
      return false;
    }

    // ניקוי ה-URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // פירוס ה-hash כאובייקט
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    
    if (!accessToken) {
      log.error("לא נמצא access token בפרמטרים");
      return false;
    }
    
    // הגדרת הסשן באמצעות הטוקנים
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });
    
    if (error) {
      log.error("שגיאה בהגדרת הסשן:", error);
      return false;
    }
    
    // Check for Hebrew characters in metadata but don't try to encode them
    if (data.user?.user_metadata) {
      for (const key in data.user.user_metadata) {
        if (typeof data.user.user_metadata[key] === 'string' && 
            containsNonLatinChars(data.user.user_metadata[key] as string)) {
          log.info(`Detected Hebrew characters in user metadata field: ${key}`);
          // רק לוג מידע - לא מנסים לקודד כלום
        }
      }
    }
    
    log.info("הסשן הוגדר בהצלחה עם access token", { userId: data.user?.id });
    return true;
  } catch (err) {
    log.error("שגיאה בלתי צפויה בחילוץ access token:", err);
    return false;
  }
}
