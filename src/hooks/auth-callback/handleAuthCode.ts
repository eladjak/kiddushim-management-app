
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

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
    
    // בדיקה אם קיים code verifier באחסון
    let codeVerifier = localStorage.getItem('supabase-code-verifier') || 
                       sessionStorage.getItem('supabase-code-verifier');
    
    // לוג מצב ה-code verifier
    log.info("סטטוס code verifier:", {
      exists: !!codeVerifier,
      length: codeVerifier?.length,
      timestamp: localStorage.getItem('code-verifier-timestamp')
    });
    
    if (codeVerifier) {
      // החלפה רגילה עם PKCE
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          // במקרה של שגיאה, לוג ונסיון ללא PKCE
          log.error("שגיאה בהחלפת קוד עם code verifier:", { 
            error,
            errorMessage: error.message 
          });
          
          if (error.message.includes('both auth code and code verifier') || 
              error.message.includes('pkce')) {
            // במקרה של שגיאת PKCE, ננסה ללא verifier
            log.info("שגיאת PKCE התגלתה, מנסה ללא code verifier");
          } else {
            // שגיאה אחרת, אולי ננסה עם API ישירות
            return await fallbackAuthCodeExchange(code, codeSource, navigate, toastHelper);
          }
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
    
    // השתמש ב-env variables במקום גישה ישירה לתכונות מוגנות
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      log.error("לא ניתן למצוא פרטי חיבור לסופהבייס");
      return false;
    }
    
    // בניית ה-URL להחלפת הקוד
    const tokenExchangeUrl = `${supabaseUrl}/auth/v1/token?grant_type=pkce`;
    
    // בניית הבקשה
    const response = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        code: code,
        code_verifier: '', // אופציונלי, ננסה בלעדיו
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
        const { data, error } = await supabase.auth.setSession({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || '',
        });
        
        if (error) {
          log.error("שגיאה בהגדרת הסשן מטוקנים שהתקבלו:", error);
          return false;
        }
        
        if (data.session) {
          log.info("סשן הוגדר בהצלחה", { userId: data.session.user.id });
          
          showToast(toastHelper, "התחברת בהצלחה");
          
          // ניווט לדף הבית
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 300);
          
          return true;
        }
      } else {
        log.error("אין access_token בתגובה");
      }
    } else {
      // במקרה של שגיאה, ניסיון קריאה לתוכן התגובה
      const errorText = await response.text();
      log.error("שגיאה בקריאה ישירה ל-API:", { 
        status: response.status,
        error: errorText
      });
    }
    
    // אם הגענו לכאן, כל הניסיונות נכשלו
    log.error("כל ניסיונות החלפת הקוד נכשלו");
    return false;
  } catch (err) {
    log.error("שגיאה כללית ב-fallbackAuthCodeExchange:", { error: err });
    return false;
  }
}
