
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
    
    // קבלת מאמת הקוד מהלוקל סטורג' במקום משמירה בסשן סטורג'
    const codeVerifier = localStorage.getItem('supabase-code-verifier');
    
    // בדיקה מתי נוצר מאמת הקוד (למנוע שימוש בישנים)
    const verifierTimestamp = localStorage.getItem('code-verifier-timestamp');
    const isVerifierRecent = verifierTimestamp && 
      (Date.now() - parseInt(verifierTimestamp, 10)) < 5 * 60 * 1000; // 5 דקות
    
    log.info("Code verifier status:", { 
      hasCodeVerifier: !!codeVerifier,
      verifierLength: codeVerifier?.length,
      isVerifierRecent
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
          clearAuthStorage();
          
          // ניווט הביתה
          setTimeout(() => {
            log.info("Redirecting to home after successful PKCE code exchange");
            navigate("/", { replace: true });
          }, 300);
          
          return true;
        }
      } catch (pkceError) {
        log.error("Exception during PKCE code exchange:", { error: pkceError });
      }
    } else {
      log.warn("No code verifier found, attempting non-PKCE code exchange");
    }
    
    // אם PKCE נכשל או לא היה זמין, ננסה החלפת קוד ללא PKCE
    log.info("Attempting non-PKCE code exchange as fallback");
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
      
      if (error) {
        log.error("Error in non-PKCE code exchange:", { error });
        return false;
      }
      
      if (data.session) {
        log.info("Successfully exchanged code with non-PKCE method", { 
          userId: data.session.user.id, 
          source 
        });
        
        // הצלחה! הצגת הודעה וניקוי
        showToast(toastHelper, "התחברת בהצלחה");
        clearAuthStorage();
        
        // ניווט הביתה
        setTimeout(() => {
          log.info("Redirecting to home after successful non-PKCE code exchange");
          navigate("/", { replace: true });
        }, 300);
        
        return true;
      }
    } catch (nonPkceError) {
      log.error("Error exchanging code without PKCE:", { error: nonPkceError });
    }
    
    // אם הגענו לכאן, שתי השיטות נכשלו
    log.error("Both PKCE and non-PKCE code exchange methods failed", { source });
    return false;
  } catch (err) {
    log.error("Error in handleAuthCode:", { error: err, source });
    throw err;
  }
}
