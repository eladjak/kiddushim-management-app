
import { useEffect } from "react";
import { logger } from "@/utils/logger";

/**
 * Hook לניקוי URL לאחר עיבוד קולבק מוצלח
 */
export function useUrlCleanup() {
  const log = logger.createLogger({ component: 'useUrlCleanup' });
  
  useEffect(() => {
    // ניקוי ה-URL אם יש פרמטרי אימות רגישים
    const hasAuthParams = window.location.hash.includes('access_token') || 
                         window.location.search.includes('code=');
    
    if (hasAuthParams) {
      log.info("מנקה פרמטרי אימות מה-URL");
      
      try {
        // ניקוי ה-URL
        window.history.replaceState({}, document.title, window.location.pathname);
        log.info("URL נוקה בהצלחה");
      } catch (error) {
        log.warn("לא ניתן לנקות את ה-URL:", error);
      }
    }
  }, []);
}
