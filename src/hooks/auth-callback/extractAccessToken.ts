
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { containsNonLatinChars } from "@/utils/encoding";

/**
 * מחלץ access token מכתובת URL עם טיפול משופר
 */
export async function extractAccessToken(): Promise<boolean> {
  const log = logger.createLogger({ component: 'extractAccessToken' });
  
  try {
    log.info("מחלץ access token מה-URL");
    
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) {
      log.error("לא נמצא access token בכתובת URL", { hash: hash ? hash.substring(0, 50) : 'empty' });
      return false;
    }

    log.info("נמצא hash עם access token", { hashLength: hash.length });

    // פירוס ה-hash כפרמטרים
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const expiresIn = hashParams.get("expires_in");
    
    log.info("פרמטרי אימות שנמצאו:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      expiresIn,
      accessTokenLength: accessToken ? accessToken.length : 0
    });
    
    if (!accessToken) {
      log.error("לא נמצא access token בפרמטרים");
      return false;
    }
    
    // וידוא שה-access token נראה תקף
    if (accessToken.length < 20) {
      log.error("access token קצר מדי", { length: accessToken.length });
      return false;
    }

    // ניקוי ה-URL לפני הגדרת הסשן
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
      log.info("URL נוקה בהצלחה");
    } catch (historyError) {
      log.warn("לא ניתן לנקות את ה-URL:", historyError);
    }
    
    // הגדרת הסשן באמצעות הטוקנים
    log.info("מנסה להגדיר סשן עם הטוקנים");
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });
    
    if (error) {
      log.error("שגיאה בהגדרת הסשן:", error);
      
      // אם השגיאה קשורה לטוקן לא תקף, ננסה לנקות ולהפנות מחדש
      if (error.message?.includes('invalid_token') || 
          error.message?.includes('expired') ||
          error.message?.includes('JWT')) {
        log.warn("טוקן לא תקף או פג תוקף, מנקה נתונים");
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          log.error("שגיאה בניקוי סשן:", signOutError);
        }
      }
      
      return false;
    }
    
    if (!data.session) {
      log.error("לא התקבל סשן מהטוקנים");
      return false;
    }
    
    // בדיקה לתווים עבריים במטאדטה
    if (data.user?.user_metadata) {
      for (const key in data.user.user_metadata) {
        if (typeof data.user.user_metadata[key] === 'string' && 
            containsNonLatinChars(data.user.user_metadata[key] as string)) {
          log.info(`זוהו תווים עבריים בשדה מטאדטה: ${key}`);
        }
      }
    }
    
    log.info("הסשן הוגדר בהצלחה עם access token", { 
      userId: data.user?.id,
      email: data.user?.email,
      provider: data.user?.app_metadata?.provider
    });
    
    return true;
  } catch (err) {
    log.error("שגיאה בלתי צפויה בחילוץ access token:", err);
    return false;
  }
}
