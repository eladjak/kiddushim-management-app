
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import type { AuthCallbackContext, AuthProcessResult } from "./types";

/**
 * בודק אם קיים סשן תקף
 */
export async function checkExistingSession(
  context: AuthCallbackContext
): Promise<AuthProcessResult> {
  const log = logger.createLogger({ component: 'checkExistingSession' });
  const { navigate, toastHelper } = context;
  
  try {
    // בדיקת סשן קיים
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      log.info("✅ נמצא סשן קיים, מועבר לדף הבית");
      
      toastHelper.toast({
        description: "התחברת בהצלחה",
      });
      
      navigate("/", { replace: true });
      return { success: true, source: 'existing_session' };
    }
    
    // בדיקת משתמש מאומת
    const { data: userData, error } = await supabase.auth.getUser();
    if (!error && userData.user) {
      log.info("✅ המשתמש כבר מאומת, מועבר לדף הבית");
      navigate("/", { replace: true });
      return { success: true, source: 'authenticated_user' };
    }
    
    return { success: false };
  } catch (err) {
    log.error("🚨 שגיאה בבדיקת סשן קיים:", err);
    return { success: false };
  }
}
