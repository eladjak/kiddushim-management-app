
import { logger } from "@/utils/logger";
import { extractAccessToken } from "./extractAccessToken";
import { supabase } from "@/integrations/supabase/client";
import type { AuthCallbackContext, AuthProcessResult } from "./types";

/**
 * מעבד access token מ-hash ברמה הגבוהה ביותר
 */
export async function processAccessToken(
  context: AuthCallbackContext
): Promise<AuthProcessResult> {
  const log = logger.createLogger({ component: 'processAccessToken' });
  const { navigate, toastHelper } = context;
  
  try {
    const hasAccessToken = window.location.hash && window.location.hash.includes('access_token');
    
    if (!hasAccessToken) {
      log.info("לא נמצא access_token ב-hash");
      return { success: false };
    }
    
    log.info("🎯 זוהה access_token ב-hash - מעבד ישירות בעדיפות עליונה");
    
    // ניסיון ראשון - באמצעות extractAccessToken
    let success = await extractAccessToken();
    
    if (success) {
      log.info("✅ עיבוד access token הצליח דרך extractAccessToken");
      
      // וידוא שיש סשן תקף
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        toastHelper.toast({
          description: "התחברת בהצלחה",
        });
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
        
        return { success: true, source: 'access_token_extract' };
      } else {
        log.warn("extractAccessToken הצליח אבל אין סשן תקף");
        success = false;
      }
    }
    
    // ניסיון שני - עיבוד ידני משופר
    if (!success) {
      log.info("🔧 מנסה פתרון ידני משופר");
      
      try {
        // ניקוי ה-URL קודם
        const originalHash = window.location.hash;
        const hashParams = new URLSearchParams(originalHash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const expiresIn = hashParams.get("expires_in");
        
        log.info("פרמטרי טוקן שנמצאו:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          expiresIn,
          accessTokenLength: accessToken ? accessToken.length : 0
        });
        
        if (accessToken && accessToken.length > 20) {
          // ניקוי ה-URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // הגדרת הסשן
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
          
          if (!setSessionError && data.session) {
            log.info("✅ הגדרת סשן ידנית הצליחה", {
              userId: data.session.user.id,
              email: data.session.user.email
            });
            
            // וידוא נוסף שהסשן נשמר
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const { data: verifySession } = await supabase.auth.getSession();
            if (verifySession.session) {
              toastHelper.toast({
                description: "התחברת בהצלחה",
              });
              
              setTimeout(() => {
                navigate("/", { replace: true });
              }, 500);
              
              return { success: true, source: 'manual_session' };
            } else {
              log.error("❌ הסשן לא נשמר למרות ההצלחה");
            }
          } else {
            log.error("❌ הגדרת סשן ידנית נכשלה:", setSessionError);
          }
        } else {
          log.error("❌ access token לא תקף או קצר מדי");
        }
      } catch (manualError) {
        log.error("🚨 שגיאה בעיבוד ידני:", manualError);
      }
    }
    
    // ניסיון שלישי - exchangeCodeForSession אם יש קוד
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && code.length > 10) {
      log.info("🔄 מנסה exchangeCodeForSession כפתרון אחרון");
      
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error && data.session) {
          log.info("✅ exchangeCodeForSession הצליח");
          
          toastHelper.toast({
            description: "התחברת בהצלחה",
          });
          
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 500);
          
          return { success: true, source: 'code_exchange' };
        } else {
          log.error("❌ exchangeCodeForSession נכשל:", error);
        }
      } catch (exchangeError) {
        log.error("🚨 שגיאה ב-exchangeCodeForSession:", exchangeError);
      }
    }
    
    log.error("❌ כל הניסיונות לעיבוד access token נכשלו");
    return { success: false };
    
  } catch (err) {
    log.error("🚨 שגיאה בלתי צפויה בעיבוד access token:", err);
    return { success: false };
  }
}
