
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * פונקציה לחילוץ אקסס-טוקן מהכתובת (hash fragment)
 * עם טיפול מיוחד בתווים מיוחדים/עבריים
 */
export async function extractAccessToken(): Promise<boolean> {
  const log = logger.createLogger({ component: 'extractAccessToken' });
  
  try {
    log.info("Extracting access token from URL hash");
    
    // בדיקה אם יש פרגמנט בכתובת
    if (!window.location.hash) {
      log.error("No hash fragment found in URL");
      return false;
    }
    
    // חילוץ פרמטרים מהפרגמנט
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // חילוץ פרמטרים רלוונטיים
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const expiresIn = hashParams.get('expires_in');
    const tokenType = hashParams.get('token_type') || 'bearer';
    const providerToken = hashParams.get('provider_token');
    
    log.info("Extracted token data from hash", { 
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      expiresIn,
      tokenType,
      hasProviderToken: !!providerToken
    });
    
    if (!accessToken) {
      log.error("No access token found in URL hash");
      return false;
    }
    
    log.info("Setting up session with extracted access token");
    
    try {
      // הגדרת סשן עם הטוקן שמצאנו
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });
      
      if (error || !data.session) {
        log.error("Error setting session with access token", { error });
        
        // ננסה שיטת גיבוי אם השיטה הראשית נכשלה
        try {
          log.info("Attempting backup method with getUser API");
          const userResponse = await supabase.auth.getUser(accessToken);
          
          if (userResponse.error) {
            log.error("Backup method also failed", { error: userResponse.error });
            return false;
          }
          
          log.info("Backup method succeeded in getting user", {
            userId: userResponse.data.user.id,
          });
          
          return true;
        } catch (backupError) {
          log.error("Error in backup token method", { error: backupError });
        }
        
        return false;
      }
      
      log.info("Successfully set session with access token", {
        userId: data.session.user.id,
        email: data.session.user.email,
      });
      
      // ניקוי מידע אימות מכל מקום אפשרי
      try {
        // מאחסון מקומי
        localStorage.removeItem('auth_redirect_initiated');
        localStorage.removeItem('auth_redirect_time');
        localStorage.removeItem('auth_redirect_count');
        localStorage.removeItem('auth_provider');
        
        // מאחסון הסשן
        sessionStorage.removeItem('auth_redirect_initiated');
        sessionStorage.removeItem('auth_redirect_time');
        sessionStorage.removeItem('auth_redirect_count');
        
        log.info("Cleared auth redirect indicators");
      } catch (e) {
        log.warn("Error clearing auth redirect indicators", e);
      }
      
      // ניקוי ה-hash מהכתובת
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
        log.info("Cleared URL hash");
      }
      
      return true;
    } catch (sessionError) {
      log.error("Error during setSession operation:", { error: sessionError });
      return false;
    }
  } catch (err) {
    log.error("Error extracting access token from hash", { error: err });
    return false;
  }
}
