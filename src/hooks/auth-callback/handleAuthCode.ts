
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
    
    // ניסיון ראשון: החלפת קוד ללא תלות ב-PKCE
    try {
      log.info("Attempting code exchange without specifying verifier");
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
      
      if (error) {
        log.error("Error in code exchange without verifier:", { error, source });
      } else if (data.session) {
        log.info("Successfully exchanged code without specifying verifier", { 
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
          log.info("Redirecting to home after successful code exchange");
          navigate("/", { replace: true });
        }, 500);
        
        return true;
      }
    } catch (exchangeError) {
      log.error("Exception during code exchange without verifier:", { error: exchangeError });
    }
    
    // ניסיון שני: עם PKCE ו-code verifier אם יש לנו אחד תקף
    if (codeVerifier && isVerifierRecent) {
      log.info("Attempting PKCE code exchange with verifier");
      
      try {
        // ניסיון לשלוח את הקוד והמאמת ישירות לספאביס
        const { data, error } = await fetch(`https://uqumzjmyejlhoyliyesu.supabase.co/auth/v1/token?grant_type=authorization_code&code=${fixedCode}&code_verifier=${codeVerifier}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdW16am15ZWpsaG95bGl5ZXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwODA1MDIsImV4cCI6MjA1NDY1NjUwMn0.btzU9O72DPhxW_gm_G_AKPOaVBuKI8F4KSrnhdNmRO8'
          }
        }).then(r => r.json());
        
        if (error) {
          log.error("Error exchanging code with direct API call:", error);
        } else if (data?.access_token) {
          log.info("Successfully obtained token with direct API call");
          
          // נסיון להגדיר את הסשן באופן ידני
          const sessionResult = await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token || '',
          });
          
          if (!sessionResult.error) {
            log.info("Successfully set session from direct API call");
            
            // הצגת הודעת הצלחה
            showToast(toastHelper, "התחברת בהצלחה");
            
            // ניקוי
            localStorage.removeItem('supabase-code-verifier');
            localStorage.removeItem('code-verifier-timestamp');
            
            // ניווט הביתה
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 500);
            
            return true;
          }
        }
      } catch (directApiError) {
        log.error("Error in direct API call:", { error: directApiError });
      }
    }
    
    // ניסיון שלישי: ניסיון אחרון עם SDK וללא מאמת
    try {
      log.info("Final attempt: Using SDK without verifier");
      
      // שלב אחרון: ניסיון נוסף עם ה-SDK הרגיל
      const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
      
      if (error) {
        log.error("Error in final code exchange attempt:", { error });
        
        // אם יש שגיאה של תוקף פג, ננסה להפנות את המשתמש להתחברות חדשה
        if (error.message && (
          error.message.includes("expired") || 
          error.message.includes("invalid_grant") || 
          error.message.includes("PKCE")
        )) {
          log.info("Code expired or invalid, cleaning up and redirecting to new login");
          
          // ניקוי
          clearAuthStorage();
          
          showToast(toastHelper, "קוד האימות פג תוקף, נא להתחבר מחדש");
          
          // הפניה לדף ההתחברות
          setTimeout(() => {
            navigate("/auth", { replace: true });
          }, 1000);
        }
      } else if (data.session) {
        log.info("Success in final attempt!");
        
        // הצגת הודעת הצלחה
        showToast(toastHelper, "התחברת בהצלחה");
        
        // ניווט הביתה
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
        
        return true;
      }
    } catch (finalError) {
      log.error("Exception in final code exchange attempt:", { error: finalError });
    }
    
    // אם הגענו לכאן, כל השיטות נכשלו
    log.error("All code exchange methods failed", { source });
    return false;
  } catch (err) {
    log.error("Error in handleAuthCode:", { error: err, source });
    throw err;
  }
}
