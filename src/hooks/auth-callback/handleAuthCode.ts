
import { NavigateFunction } from "react-router-dom";
import { supabase, clearAuthStorage } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Handle authentication with an auth code
 */
export async function handleAuthCode(
  code: string,
  source: string,
  navigate: NavigateFunction,
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleAuthCode' });
  
  try {
    log.info("Exchanging auth code for session", { 
      codeSource: source, 
      codeLength: code.length,
      codeFirstThree: code.substring(0, 3) + '...'
    });
    
    // תיקון הקוד אם יש בו רווחים במקום סימני +
    const fixedCode = code.replace(/ /g, '+');
    
    // קבלת מאמת הקוד מהלוקל סטורג' או מסשן סטורג'
    let codeVerifier = localStorage.getItem('supabase-code-verifier');
    
    // אם לא נמצא בלוקל סטורג', ננסה לקבל מסשן סטורג'
    if (!codeVerifier) {
      codeVerifier = sessionStorage.getItem('supabase-code-verifier');
      log.info("Using code verifier from sessionStorage instead of localStorage");
    }
    
    // בדיקה מתי נוצר מאמת הקוד (למנוע שימוש בישנים)
    const verifierTimestamp = localStorage.getItem('code-verifier-timestamp');
    const isVerifierRecent = verifierTimestamp && 
      (Date.now() - parseInt(verifierTimestamp, 10)) < 10 * 60 * 1000; // 10 דקות
    
    log.info("Code verifier status:", { 
      hasCodeVerifier: !!codeVerifier,
      verifierLength: codeVerifier?.length,
      isVerifierRecent,
      verifierFirstChars: codeVerifier ? codeVerifier.substring(0, 5) + '...' : 'none'
    });
    
    // ניסיון עם או בלי code verifier - ננסה את שתי האפשרויות
    let success = false;
    
    // ניסיון 1: עם PKCE ו-code verifier אם יש לנו אחד תקף
    if (codeVerifier && isVerifierRecent) {
      log.info("Attempting PKCE code exchange with verifier");
      
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
        
        if (error) {
          log.error("Error exchanging code for session with PKCE:", { error, source });
          // המשך לניסיון הבא
        } else if (data.session) {
          log.info("Successfully exchanged code for session with PKCE", { 
            userId: data.session.user.id, 
            source 
          });
          
          // הצלחה! הצגת הודעה וניקוי
          showToast(toastHelper, "התחברת בהצלחה");
          
          try {
            // ניקוי מאמתי הקוד שכבר לא דרושים
            localStorage.removeItem('supabase-code-verifier');
            localStorage.removeItem('code-verifier-timestamp');
            sessionStorage.removeItem('supabase-code-verifier');
            log.info("Cleaned up code verifiers after successful auth");
          } catch (cleanupError) {
            log.warn("Error cleaning up code verifiers:", { error: cleanupError });
          }
          
          // ניווט הביתה
          setTimeout(() => {
            log.info("Redirecting to home after successful PKCE code exchange");
            navigate("/", { replace: true });
          }, 500);
          
          return true;
        }
      } catch (pkceError) {
        log.error("Exception during PKCE code exchange:", { error: pkceError });
      }
    }
    
    // ניסיון 2: החלפת קוד ללא תלות ב-PKCE
    if (!success) {
      log.info("Attempting code exchange without PKCE as fallback");
      
      try {
        // נסיון מיוחד בלי לציין code verifier בכלל
        const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
        
        if (error) {
          log.error("Error in alternative code exchange:", { error });
        } else if (data.session) {
          log.info("Successfully exchanged code with alternative method", { 
            userId: data.session.user.id, 
            source 
          });
          
          // הצלחה! הצגת הודעה וניקוי
          showToast(toastHelper, "התחברת בהצלחה");
          
          // ניווט הביתה
          setTimeout(() => {
            log.info("Redirecting to home after successful alternative code exchange");
            navigate("/", { replace: true });
          }, 500);
          
          return true;
        }
      } catch (altError) {
        log.error("Error in alternative code exchange method:", { error: altError });
      }
    }
    
    // ניסיון 3: נסיון באמצעות fetch API ישירות (במקרה של תקלה בספריה)
    if (!success) {
      log.info("Attempting direct fetch API as final fallback");
      
      try {
        // הכנת נתוני בקשה
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase configuration");
        }
        
        // שליחת בקשת REST ישירה
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code&code=${fixedCode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({})
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          log.error("Direct fetch API failed:", { status: response.status, data });
        } else if (data?.access_token) {
          log.info("Successfully received token from direct fetch API");
          
          // נסיון להגדיר את הסשן באופן ידני
          try {
            await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token || '',
            });
            log.info("Successfully set session manually from direct fetch");
            
            // הצגת הודעת הצלחה
            showToast(toastHelper, "התחברת בהצלחה");
            
            // ניווט לדף הבית
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 500);
            
            return true;
          } catch (setSessionError) {
            log.error("Error setting session from direct fetch:", { error: setSessionError });
          }
        }
      } catch (fetchError) {
        log.error("Error in direct fetch attempt:", { error: fetchError });
      }
    }
    
    // אם הגענו לכאן, כל השיטות נכשלו
    log.error("All code exchange methods failed", { source });
    return false;
  } catch (err) {
    log.error("Error in handleAuthCode:", { error: err, source });
    throw err;
  }
}
