
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";

/**
 * Hook to handle OAuth redirect URLs that might come to the index page
 */
export function useAuthRedirect() {
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'useAuthRedirect' });

  useEffect(() => {
    // בדיקה אם יש לנו אינדיקציה של תהליך אימות פעיל
    const handleAuthRedirect = () => {
      try {
        // בדיקה אם קיים קוד אימות בכתובת ה-URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        // בדיקה אם קיים access_token ב-hash
        const hasAccessToken = window.location.hash && window.location.hash.includes('access_token');
        
        if (code && code.length > 10) {
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
        
        if (hasAccessToken) {
          log.info("Detected access_token in URL hash, redirecting to auth callback");
          navigate("/auth/callback", { replace: true });
          return true;
        }
      } catch (error) {
        log.error("Error processing auth redirect:", error);
      }
      
      return false;
    };
    
    handleAuthRedirect();
  }, [navigate]);
}
