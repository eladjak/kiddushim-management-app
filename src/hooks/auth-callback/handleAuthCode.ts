
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
      codeLength: code.length 
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
    
    // ניסיון עם PKCE אם יש לנו מאמת קוד עדכני
    if (codeVerifier && isVerifierRecent) {
      log.info("Attempting PKCE code exchange with verifier");
      
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
        
        if (error) {
          log.error("Error exchanging code for session with PKCE:", { error, source });
          // המשך לניסיון ללא PKCE
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
    } else {
      log.warn("No valid code verifier found, attempting non-PKCE code exchange");
    }
    
    // אם PKCE נכשל או לא היה זמין, ננסה החלפת קוד ללא תלות ב-PKCE
    log.info("Attempting alternative code exchange as fallback");
    
    try {
      // ניסיון עם API אחר ללא דרישת מאמת קוד
      const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
      
      if (error) {
        log.error("Error in alternative code exchange:", { error });
        return false;
      }
      
      if (data.session) {
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
    
    // אם הגענו לכאן, כל השיטות נכשלו
    log.error("All code exchange methods failed", { source });
    return false;
  } catch (err) {
    log.error("Error in handleAuthCode:", { error: err, source });
    throw err;
  }
}
