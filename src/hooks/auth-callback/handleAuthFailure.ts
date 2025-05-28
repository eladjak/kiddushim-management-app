
import { logger } from "@/utils/logger";
import { clearAuthStorage } from "@/integrations/supabase/client";
import type { AuthCallbackContext } from "./types";

/**
 * מטפל בכישלון אימות
 */
export function handleAuthFailure(context: AuthCallbackContext): void {
  const log = logger.createLogger({ component: 'handleAuthFailure' });
  const { navigate, toastHelper } = context;
  
  log.error("🚨 כל שיטות האימות נכשלו");
  
  toastHelper.toast({
    title: "שגיאה בהתחברות",
    description: "לא ניתן היה להשלים את תהליך ההתחברות. נא לנסות שוב.",
    variant: "destructive"
  });
  
  clearAuthStorage();
  
  setTimeout(() => {
    navigate("/auth", { replace: true });
  }, 2000);
}
