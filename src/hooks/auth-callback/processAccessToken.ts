
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
      return { success: false };
    }
    
    log.info("🎯 זוהה access_token ב-hash - מעבד ישירות בעדיפות עליונה");
    
    const success = await extractAccessToken();
    
    if (success) {
      log.info("✅ עיבוד access token הצליח בהצלחה");
      
      toastHelper.toast({
        description: "התחברת בהצלחה",
      });
      
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
      
      return { success: true, source: 'access_token' };
    }
    
    // ניסיון פתרון חלופי
    log.error("❌ עיבוד access token נכשל - מנסה פתרונות חלופיים");
    
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      
      if (accessToken && accessToken.length > 20) {
        log.info("🔧 מנסה הגדרת סשן ידנית כפתרון חלופי");
        
        const { data, error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });
        
        if (!setSessionError && data.session) {
          log.info("✅ הגדרת סשן ידנית הצליחה");
          
          toastHelper.toast({
            description: "התחברת בהצלחה",
          });
          
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 500);
          
          return { success: true, source: 'manual_session' };
        } else {
          log.error("❌ גם הגדרת סשן ידנית נכשלה:", setSessionError);
        }
      }
    } catch (manualError) {
      log.error("🚨 שגיאה בעיבוד ידני:", manualError);
    }
    
    return { success: false };
  } catch (err) {
    log.error("🚨 שגיאה בעיבוד access token:", err);
    return { success: false };
  }
}
