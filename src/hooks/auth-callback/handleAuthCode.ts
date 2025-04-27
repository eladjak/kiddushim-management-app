
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Handle authentication with a code from URL or state
 */
export async function handleAuthCode(
  code: string, 
  source: string, 
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleAuthCode' });

  log.info("Processing auth code", { 
    codeLength: code.length,
    source 
  });
  
  try {
    // ניקוי כל מונים של רידיירקט
    sessionStorage.removeItem('auth_redirect_count');
    
    // החלפת הקוד לסשן
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      log.error("Error exchanging code for session:", { error: exchangeError });
      
      // אם השגיאה קשורה ל-PKCE, יש צורך בטיפול מיוחד
      if (exchangeError.message && exchangeError.message.includes("pkce")) {
        log.info("PKCE error detected, trying alternative flow");
        return false;
      }
      
      throw new Error(`שגיאת החלפת קוד לסשן: ${exchangeError.message}`);
    }
    
    if (!data.session) {
      log.warn("No session found after code exchange");
      
      // בדיקה נוספת אם נוצרה סשן בדרך אחרת
      const sessionResult = await supabase.auth.getSession();
      if (sessionResult.data.session) {
        log.info("Session found through direct check after code exchange");
        
        // ניקוי פרמטרים מהכתובת
        if (window.history.replaceState) {
          window.history.replaceState(null, document.title, window.location.pathname);
        }
        
        // הצגת הודעת הצלחה
        showToast(toast, "התחברת בהצלחה");
        
        // ניווט הביתה
        setTimeout(() => {
          log.info("Redirecting to home after successful authentication");
          navigate("/", { replace: true });
        }, 300);
        
        return true;
      }
      
      throw new Error("התחברות נכשלה - לא נוצרה סשן לאחר החלפת קוד");
    }
    
    // התחברות מוצלחת
    log.info("Session established successfully with code exchange", { 
      userId: data.session.user.id,
      provider: data.session.user.app_metadata.provider
    });
    
    // ניקוי פרמטרים מהכתובת
    if (window.history.replaceState) {
      window.history.replaceState(null, document.title, window.location.pathname);
    }
    
    // הצגת הודעת הצלחה
    showToast(toast, "התחברת בהצלחה");
    
    // ניווט הביתה
    setTimeout(() => {
      log.info("Redirecting to home after successful authentication");
      navigate("/", { replace: true });
    }, 300);
    
    return true;
  } catch (err) {
    log.error("Error in code exchange process:", { error: err });
    throw err;
  }
}
