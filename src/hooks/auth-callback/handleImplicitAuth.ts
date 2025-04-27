
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Check if session is already established via implicit flow
 * או שיש hash fragment שמכיל access_token
 */
export async function handleImplicitAuth(
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleImplicitAuth' });

  try {
    // בדוק אם יש פרגמנט בכתובת שמכיל access_token
    if (window.location.hash && window.location.hash.includes('access_token')) {
      log.info("Found access_token in URL hash, processing implicit flow", {
        hashLength: window.location.hash.length
      });
      
      try {
        // נסה לעבד את ה-hash לאימות
        // השיטה getSessionFromUrl לא קיימת יותר, במקומה נשתמש ב-signInWithOtp שמקבל את ה-URL
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: true, // מונע הפניה נוספת
            queryParams: {
              access_token: new URLSearchParams(window.location.hash.substring(1)).get('access_token') || ''
            }
          }
        });
        
        if (error) {
          log.error("Error processing hash URL for auth:", { error });
          return false;
        }
        
        // בדיקה אם הפעולה יצרה סשן
        const sessionResult = await supabase.auth.getSession();
        if (sessionResult.data.session) {
          log.info("Successfully established session from hash URL", { 
            userId: sessionResult.data.session.user.id 
          });
          
          // נקה את הפרמטרים מהכתובת
          if (window.history.replaceState) {
            window.history.replaceState(null, document.title, window.location.pathname);
          }
          
          // הצג הודעת הצלחה
          showToast(toast, "התחברת בהצלחה");
          
          // נווט הביתה
          setTimeout(() => {
            log.info("Redirecting to home with hash-based auth session");
            navigate("/", { replace: true });
          }, 300);
          
          return true;
        }
      } catch (hashError) {
        log.error("Error processing URL hash for auth:", { error: hashError });
      }
    }
    
    // בדיקה לסשן קיים
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      log.info("Session already established via implicit flow", { 
        userId: sessionData.session.user.id 
      });
      
      // נקה את הפרמטרים מהכתובת
      if (window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
      
      // הצג הודעת הצלחה
      showToast(toast, "התחברת בהצלחה");
      
      // נווט הביתה 
      setTimeout(() => {
        log.info("Redirecting to home with implicit auth session");
        navigate("/", { replace: true });
      }, 300);
      
      return true;
    }
    
    return false;
  } catch (err) {
    log.error("Error checking for implicit session:", { error: err });
    return false;
  }
}
