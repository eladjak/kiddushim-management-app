
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
    
    // בדיקה אם ה-code כולל תו + שקיים ב-PKCE אך יתכן שבמהלך הניתוב התחלף לרווח
    // זו בעיה נפוצה כאשר מפעילים PKCE עם גוגל
    const fixedCode = code.replace(/ /g, '+');
    
    // וידוא שיש לנו code_verifier בסשן סטורג'
    const codeVerifier = sessionStorage.getItem('supabase-code-verifier');
    log.info("Code verifier status:", { 
      hasCodeVerifier: !!codeVerifier,
      verifierLength: codeVerifier?.length 
    });
    
    // Try to perform code exchange with PKCE
    if (codeVerifier) {
      log.info("Attempting PKCE code exchange with verifier");
      const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
      
      if (error) {
        log.error("Error exchanging code for session with PKCE:", { error, source });
        // המשך עם כישלון
      } else {
        if (data.session) {
          log.info("Successfully exchanged code for session with PKCE", { 
            userId: data.session.user.id, 
            source 
          });
          
          // Show success message
          showToast(toastHelper, "התחברת בהצלחה");
          
          // Clear auth redirect indicators after successful auth
          try {
            sessionStorage.removeItem('auth_redirect_initiated');
            sessionStorage.removeItem('auth_redirect_time');
            sessionStorage.removeItem('auth_redirect_count');
            // מחיקת מפתח ה-code_verifier אחרי שהיה בשימוש מוצלח
            sessionStorage.removeItem('supabase-code-verifier');
          } catch (e) {
            log.warn("Error clearing auth redirect indicators:", e);
          }
          
          // Navigate home
          setTimeout(() => {
            log.info("Redirecting to home after code exchange");
            navigate("/", { replace: true });
          }, 300);
          
          return true;
        }
      }
    } else {
      // אם אין לנו verifier, ננסה לבצע חילוף קוד ללא PKCE
      log.warn("No code verifier found, attempting non-PKCE code exchange");
      
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
        
        if (error) {
          log.error("Error exchanging code without PKCE:", { error });
        } else if (data.session) {
          log.info("Successfully exchanged code without PKCE", { 
            userId: data.session.user.id, 
            source 
          });
          
          // Show success message
          showToast(toastHelper, "התחברת בהצלחה");
          
          // Clear auth redirect indicators
          try {
            sessionStorage.removeItem('auth_redirect_initiated');
            sessionStorage.removeItem('auth_redirect_time');
            sessionStorage.removeItem('auth_redirect_count');
          } catch (e) {
            log.warn("Error clearing auth redirect indicators:", e);
          }
          
          // Navigate home
          setTimeout(() => {
            log.info("Redirecting to home after non-PKCE code exchange");
            navigate("/", { replace: true });
          }, 300);
          
          return true;
        }
      } catch (exchangeError) {
        log.error("Error in non-PKCE code exchange attempt:", { error: exchangeError });
      }
    }
    
    // אם הגענו לכאן, שתי השיטות נכשלו
    log.error("Both PKCE and non-PKCE code exchange methods failed", { source });
    return false;
  } catch (err) {
    log.error("Error in handleAuthCode:", { error: err, source });
    throw err;
  }
}
