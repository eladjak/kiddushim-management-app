
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle OAuth redirect URLs that might come to the index page
 */
export function useAuthRedirect() {
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'useAuthRedirect' });
  const processedRef = useRef(false);

  useEffect(() => {
    // מניעת עיבוד כפול
    if (processedRef.current) {
      return;
    }
    
    const handleAuthRedirect = async () => {
      try {
        // קודם נבדוק אם יש כבר סשן פעיל
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          log.info("יש כבר סשן פעיל, לא צריך לעבד redirect");
          processedRef.current = true;
          return false;
        }
        
        // בדיקה אם קיים קוד אימות בכתובת ה-URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        // בדיקה אם קיים access_token ב-hash
        const hasAccessToken = window.location.hash && window.location.hash.includes('access_token');
        
        // רק אם יש נתוני אימות תקפים
        if ((code && code.length > 10) || hasAccessToken) {
          processedRef.current = true;
          
          if (hasAccessToken) {
            log.info("Detected access_token in URL hash, redirecting to auth callback with hash preserved");
            
            // שמירת כל ה-hash כמו שהוא
            const fullHash = window.location.hash;
            
            navigate("/auth/callback", { 
              replace: true,
              state: {
                hasAccessToken: true,
                authSource: 'implicit_flow',
                originalHash: fullHash, // שמירת ה-hash המלא
                preservedUrl: window.location.href // שמירת כל הכתובת
              }
            });
            return true;
          }
          
          if (code) {
            log.info("Detected auth code in URL, redirecting to callback page");
            navigate("/auth/callback", { 
              replace: true, 
              state: { 
                code,
                authSource: 'index_redirect'
              } 
            });
            return true;
          }
        }
      } catch (error) {
        log.error("Error processing auth redirect:", error);
      }
      
      return false;
    };
    
    // השהיה קטנה כדי לוודא שהדף נטען
    setTimeout(() => {
      handleAuthRedirect();
    }, 100);
  }, [navigate]);
}
