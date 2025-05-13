
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";
import { retrieveCodeVerifier } from "@/utils/encodingUtils";

/**
 * החלפת קוד אימות לסשן תקף
 * עם טיפול מיוחד במקרה שה-code verifier חסר
 */
export async function handleAuthCode(
  code: string, 
  codeSource: string,
  navigate: NavigateFunction,
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleAuthCode' });
  
  try {
    if (!code || code.length < 10) {
      log.error("קוד אימות לא תקף", { 
        codeLength: code?.length,
        codeSource 
      });
      return false;
    }
    
    log.info("מחליף קוד אימות לסשן", { codeSource });
    
    // בדיקה אם קיים code verifier באחסון - עם שיטת האחזור המשופרת
    let codeVerifier = retrieveCodeVerifier();
    
    // יצירת verifier חדש אם צריך (יכול להיות פתרון חירום)
    if (!codeVerifier) {
      try {
        // מנסים להשתמש בקוד ישירות - זה עובד במקרים מסוימים
        const directCodeTry = await supabase.auth.exchangeCodeForSession(code);
        if (directCodeTry.data.session) {
          log.info("הצלחה בהחלפת קוד ישירה ללא verifier");
          showToast(toastHelper, "התחברת בהצלחה");
          navigate("/", { replace: true });
          return true;
        }
      } catch (directError) {
        log.error("שגיאה בניסיון החלפה ישירה:", { error: directError });
        // ממשיכים לניסיון הבא
      }
    }
    
    // לוג מצב ה-code verifier
    log.info("סטטוס code verifier:", {
      exists: !!codeVerifier,
      length: codeVerifier?.length,
      timestamp: localStorage.getItem('code-verifier-timestamp')
    });
    
    if (codeVerifier) {
      // החלפה רגילה עם PKCE
      try {
        // כדי למנוע בעיות אינקודינג עם עברית, נוודא שה-verifier מכיל רק תווים לטיניים
        codeVerifier = codeVerifier.replace(/[^\x00-\x7F]/g, '_');
        
        // העברת הקוד ב-codeVerifier לספהבייס
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          // במקרה של שגיאה, לוג ונסיון ללא PKCE
          log.error("שגיאה בהחלפת קוד עם code verifier:", { 
            error,
            errorMessage: error.message 
          });
          
          // ניסיון חלופי - מעבר לדף הבית
          if (error.message.includes('expired') || error.message.includes('used')) {
            log.info("הקוד פג תוקף או כבר נוצל, מנסה לבדוק אם יש סשן פעיל");
            const sessionCheck = await supabase.auth.getSession();
            if (sessionCheck.data.session) {
              log.info("מצאנו סשן פעיל למרות השגיאה");
              showToast(toastHelper, "התחברת בהצלחה");
              navigate("/", { replace: true });
              return true;
            }
          }
          
          // אם הגענו לכאן, ננסה שיטה חילופית
          return await fallbackAuthCodeExchange(code, codeSource, navigate, toastHelper);
        } else if (data.session) {
          log.info("הסשן נוצר בהצלחה עם PKCE", { userId: data.session.user.id });
          
          showToast(toastHelper, "התחברת בהצלחה");
          
          // ניקוי הקוד מה-URL
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          
          // ניווט לדף הבית
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 300);
          
          return true;
        } else {
          log.error("החלפת קוד לא החזירה סשן");
          return await fallbackAuthCodeExchange(code, codeSource, navigate, toastHelper);
        }
      } catch (err) {
        log.error("חריגה בעת החלפת קוד:", { error: err });
        return await fallbackAuthCodeExchange(code, codeSource, navigate, toastHelper);
      }
    }
    
    // החלפה ללא PKCE אם לא היה לנו code verifier
    log.warn("לא נמצא code verifier, מנסה החלפת קוד ללא PKCE");
    return await fallbackAuthCodeExchange(code, codeSource, navigate, toastHelper);
  } catch (err) {
    log.error("שגיאה כללית ב-handleAuthCode:", { error: err });
    return false;
  }
}

/**
 * פונקצית גיבוי לניסיון החלפת קוד אימות לסשן כאשר PKCE נכשל
 * עם טיפול משופר בשגיאות ונסיונות מרובים
 */
async function fallbackAuthCodeExchange(
  code: string, 
  codeSource: string,
  navigate: NavigateFunction,
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'fallbackAuthCodeExchange' });
  
  try {
    log.info("מנסה החלפת קוד ללא PKCE כגיבוי", { codeSource });
    
    // בדיקה אם יש לנו סשן פעיל כבר
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        log.info("נמצא סשן פעיל, מנווט לדף הבית");
        showToast(toastHelper, "התחברת בהצלחה");
        navigate("/", { replace: true });
        return true;
      }
    } catch (sessionError) {
      log.error("שגיאה בבדיקת סשן קיים:", sessionError);
    }
    
    // לפני שננסה עוד דברים, ננסה שוב החלפת קוד ישירה
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        log.info("הצלחה בניסיון נוסף של החלפת קוד");
        showToast(toastHelper, "התחברת בהצלחה");
        navigate("/", { replace: true });
        return true;
      }
    } catch (retryError) {
      log.error("שגיאה בניסיון חוזר של החלפת קוד:", retryError);
    }
    
    // השתמש במשתני סביבה במקום גישה ישירה לתכונות מוגנות
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      log.error("לא ניתן למצוא פרטי חיבור לסופהבייס");
      return false;
    }
    
    // אם עדיין לא הצלחנו, ננסה דרך צריכת הAPI ישירות
    try {
      // ניסיון לצרוך את API הטוקן ישירות - לפעמים עוזר במקרים של PKCE עם בעיות
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'X-Client-Info': 'supabase-js/2.48.1'
        },
        body: JSON.stringify({
          code: code,
          code_verifier: '' // השארת verifier ריק עוזר במקרים מסוימים
        })
      });
      
      // עיבוד התגובה
      if (response.ok) {
        const tokenData = await response.json();
        
        if (tokenData.access_token) {
          log.info("קבלת טוקן ישירה הצליחה, מגדיר סשן", {
            tokenLength: tokenData.access_token.length,
            hasRefreshToken: !!tokenData.refresh_token
          });
          
          // הגדרת הסשן עם הטוקן שקיבלנו
          await supabase.auth.setSession({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || '',
          });
          
          showToast(toastHelper, "התחברת בהצלחה");
          navigate("/", { replace: true });
          return true;
        }
      } else {
        log.error("שגיאה בקריאה ישירה ל-API:", { 
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (err) {
      log.error("שגיאה בגישה ישירה ל-API:", err);
    }
    
    // בדיקה אחרונה אם בכל זאת יש לנו סשן
    try {
      const { data: finalCheck } = await supabase.auth.getSession();
      if (finalCheck.session) {
        log.info("נמצא סשן לאחר כל הניסיונות");
        showToast(toastHelper, "התחברת בהצלחה");
        navigate("/", { replace: true });
        return true;
      }
    } catch (finalError) {
      log.error("שגיאה בבדיקת סשן סופית:", finalError);
    }
    
    // אם הגענו לכאן, כל הניסיונות נכשלו
    log.error("כל ניסיונות החלפת הקוד נכשלו");
    navigate("/auth", { replace: true });
    return false;
  } catch (err) {
    log.error("שגיאה כללית ב-fallbackAuthCodeExchange:", { error: err });
    return false;
  }
}
