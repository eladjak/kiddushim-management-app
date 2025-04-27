
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { clearAuthStorage } from "@/integrations/supabase/client";

/**
 * מוציא access_token מה-hash והופך אותו לסשן
 * משמש במיוחד עבור אותנטיקציית גוגל שמחזירה access_token בחלק ה-hash של ה-URL
 */
export async function extractAccessToken(): Promise<boolean> {
  const log = logger.createLogger({ component: 'extractAccessToken' });
  
  try {
    // בדיקה אם יש hash ואם הוא מכיל access_token
    if (!window.location.hash || !window.location.hash.includes('access_token')) {
      log.info("No access_token found in hash");
      return false;
    }

    log.info("Found access_token in hash, attempting extraction");
    
    // חילוץ הפרמטרים מה-hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || '';
    const expiresIn = hashParams.get('expires_in');
    
    if (!accessToken) {
      log.error("Access token not found in hash params");
      return false;
    }

    log.info("Successfully extracted token info from hash", { 
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      expiresIn 
    });

    // מיפוי הפרמטרים לסשן 
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    // בדיקה אם הצלחנו להגדיר את הסשן
    if (error) {
      log.error("Error setting session with token:", { error });
      
      // ניסיון נקיון ונסיון חוזר אם נכשלנו
      clearAuthStorage();
      
      // נסיון נוסף עם setSession אחרי ניקוי האחסון
      const retryResult = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (retryResult.error) {
        log.error("Second attempt to set session also failed:", { error: retryResult.error });
        return false;
      }
      
      log.info("Second attempt to set session succeeded");
      return true;
    }

    // נקה את ה-hash מהכתובת URL למניעת ניסיון עיבוד חוזר
    if (window.history.replaceState) {
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }

    log.info("Successfully set session with access token", {
      hasUser: !!data.session?.user,
      userId: data.session?.user?.id
    });
    
    return true;
  } catch (err) {
    log.error("Error in extractAccessToken:", { error: err });
    return false;
  }
}
