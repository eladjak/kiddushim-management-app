
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { containsNonLatinChars } from "@/utils/encoding";

/**
 * מטפל בהחלפת קוד אימות לטוקן
 */
export async function handleAuthCode(
  code: string, 
  source: string,
  navigate: NavigateFunction, 
  toastHelper: { toast: (props: { variant?: "destructive"; description: string }) => void }
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleAuthCode' });
  
  try {
    log.info(`מעבד קוד מ-${source}`);
    
    // טיפול בסשן - מנסה ליצור ישירות מהקוד
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      log.error(`שגיאה בהחלפת קוד ל-session מ-${source}:`, error);
      return false;
    }
    
    if (!data.session) {
      log.error(`לא התקבל סשן בהחלפת הקוד מ-${source}`);
      return false;
    }
    
    // Handle potential encoding issues with Hebrew/non-Latin characters in user metadata
    if (data.session?.user?.user_metadata) {
      log.info("User authenticated successfully with metadata");
      
      // Check metadata with Hebrew characters but don't encode
      const metadata = data.session.user.user_metadata;
      for (const key in metadata) {
        if (typeof metadata[key] === 'string' && containsNonLatinChars(metadata[key] as string)) {
          log.info(`Hebrew characters detected in metadata field: ${key}`);
          // רק לוג - לא מנסים לקודד או לשנות כלום
        }
      }
    }
    
    log.info(`התחברות הצליחה באמצעות קוד מ-${source}`, { userId: data.session.user.id });
    
    toastHelper.toast({
      description: "התחברת בהצלחה",
    });
    
    // מעבר לדף הראשי
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);
    
    return true;
  } catch (err) {
    log.error(`שגיאה בלתי צפויה בטיפול בקוד מ-${source}:`, err);
    return false;
  }
}
