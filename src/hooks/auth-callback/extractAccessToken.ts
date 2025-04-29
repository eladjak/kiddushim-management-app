
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * חילוץ טוקן גישה מה-URL hash לצורך זרימת Implicit Flow
 * גרסה משודרגת עם תמיכה טובה יותר בקידוד עברית ומנגנוני גיבוי
 */
export async function extractAccessToken(): Promise<boolean> {
  const log = logger.createLogger({ component: 'extractAccessToken' });
  
  try {
    log.info("מנסה לחלץ access token מה-URL hash");
    
    // בדיקה שיש לנו hash ב-URL
    if (!window.location.hash || !window.location.hash.includes('access_token')) {
      log.info("לא נמצא access token ב-URL hash");
      return false;
    }
    
    // ניסיון לחלץ את פרמטרי ה-hash
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1) // הסרת ה-'#' המוביל
    );
    
    // קבלת הטוקנים
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const expiresIn = hashParams.get('expires_in');
    const expiresAt = hashParams.get('expires_at');
    
    if (!accessToken) {
      log.error("יש hash אך לא נמצא access token תקף");
      return false;
    }
    
    log.info("נמצא access token ב-hash, מנסה להגדיר סשן", {
      tokenLength: accessToken.length,
      hasRefreshToken: !!refreshToken,
      hasExpiresIn: !!expiresIn,
      hasExpiresAt: !!expiresAt
    });
    
    // גישה 1: הגדרת סשן ישירות
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });
      
      if (error) {
        log.error("שגיאה בהגדרת סשן:", error);
      } else if (data?.session) {
        log.info("הוגדר סשן בהצלחה מתוך access token", {
          userId: data.session.user.id,
          expiresAt: data.session.expires_at
        });
        
        return true;
      }
    } catch (setSessionError) {
      log.error("חריגה בהגדרת הסשן:", setSessionError);
    }
    
    // גישה 2: שימוש ב-API של getUser כחלופה
    try {
      log.info("מנסה להשתמש ב-getUser API");
      const { data, error } = await supabase.auth.getUser(accessToken);
      
      if (error) {
        log.error("שגיאה בקבלת משתמש עם access token:", error);
      } else if (data.user) {
        log.info("התקבל משתמש תקין עם access token", {
          userId: data.user.id
        });
        
        // ניסיון שני להגדרת סשן
        try {
          const sessionResult = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionResult.error) {
            log.error("ניסיון שני להגדרת סשן נכשל:", sessionResult.error);
          } else {
            log.info("הצלחה בהגדרת סשן בניסיון השני");
            return true;
          }
        } catch (secondError) {
          log.error("חריגה בניסיון השני להגדרת סשן:", secondError);
        }
        
        // גישה 3: ניסיון לשמור את הטוקן בלוקל סטורג' באופן ידני
        try {
          log.info("מנסה לשמור את הטוקן ולאתחל סשן באופן ידני");
          
          // חישוב של expires_at אם הוא לא קיים
          const calculatedExpiresAt = expiresAt 
            ? parseInt(expiresAt) 
            : expiresIn 
              ? Math.floor(Date.now() / 1000) + parseInt(expiresIn)
              : Math.floor(Date.now() / 1000) + 3600; // ברירת מחדל לשעה
          
          // הגדרת אובייקט הסשן באופן ידני
          const manualSession = {
            access_token: accessToken,
            refresh_token: refreshToken || '',
            expires_at: calculatedExpiresAt,
            expires_in: parseInt(expiresIn || '3600'),
            token_type: 'bearer',
          };
          
          // שמירה ב-localStorage, אבל עם מפתח שנבנה בצורה בטוחה
          // במקום גישה ישירה ל-supabaseUrl שהוא protected
          const supabaseUrlParts = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'unknown';
          localStorage.setItem(`sb-${supabaseUrlParts}-auth-token`, JSON.stringify({
            currentSession: manualSession,
            expiresAt: calculatedExpiresAt
          }));
          
          // רענון הסשן כדי לגרום לשינוי מצב האימות
          const refreshResult = await supabase.auth.refreshSession();
          
          if (refreshResult.data?.session) {
            log.info("הצלחנו לרענן את הסשן לאחר הגדרה ידנית");
            return true;
          }
          
          // בדיקה אחת אחרונה אם יש לנו משתמש מחובר
          const checkSession = await supabase.auth.getSession();
          if (checkSession.data.session) {
            log.info("יש לנו סשן תקף לאחר כל הניסיונות");
            return true;
          }
        } catch (manualError) {
          log.error("ניסיון ידני לשמירת סשן נכשל:", manualError);
        }
      }
    } catch (getUserError) {
      log.error("שגיאה בקבלת משתמש:", getUserError);
    }
    
    // גישה 4: ניסיון להשתמש ב-API של refreshSession עם הטוקן
    try {
      log.info("מנסה את גישת refreshSession עם הטוקן");
      
      // קריאה ל-exchangeCodeForSession עם הטוקן כקוד
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        log.error("שגיאה ברענון סשן:", error);
      } else if (data.session) {
        log.info("הצלחה ברענון סשן", {
          userId: data.session.user.id
        });
        return true;
      }
    } catch (refreshError) {
      log.error("שגיאה בגישת refreshSession:", refreshError);
    }
    
    // גישה 5: שימוש בקריאת API ישירה לסופהבייס
    try {
      log.info("מנסה קריאת REST API ישירה");
      
      // השתמש ב-env variables במקום גישה ישירה לתכונות מוגנות
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        log.error("לא ניתן למצוא פרטי חיבור לסופהבייס");
        return false;
      }
      
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken || undefined
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        log.info("קריאת REST API הצליחה", result);
        
        // ניסיון להגדיר את הסשן שוב
        try {
          await supabase.auth.setSession({
            access_token: result.access_token || accessToken,
            refresh_token: result.refresh_token || refreshToken || '',
          });
          
          return true;
        } catch (finalSetSessionError) {
          log.error("שגיאה אחרונה בהגדרת סשן:", finalSetSessionError);
        }
      } else {
        log.error("קריאת REST API נכשלה:", {
          status: response.status,
          text: await response.text()
        });
      }
    } catch (apiError) {
      log.error("שגיאה בקריאת API ישירה:", apiError);
    }
    
    log.error("כל הניסיונות לעיבוד access token נכשלו");
    return false;
  } catch (err) {
    log.error("שגיאה כללית בחילוץ access token:", err);
    return false;
  }
}
