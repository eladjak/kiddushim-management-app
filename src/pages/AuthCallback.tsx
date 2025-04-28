
import { useAuthCallback } from "@/hooks/auth-callback/useAuthCallback";
import { logger } from "@/utils/logger";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { extractAccessToken } from "@/hooks/auth-callback/extractAccessToken";
import { useToast } from "@/hooks/use-toast";
import { clearAuthStorage } from "@/integrations/supabase/client";

/**
 * דף זה מטפל בקולבק OAuth ובהקמת סשן
 * יש להגדיר אותו ככתובת הפניה בספקי אימות
 */
const AuthCallback = () => {
  const { loading, error } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  const location = useLocation();
  const navigate = useNavigate();
  const toastHelper = useToast();
  const processedRef = useRef(false);
  
  useEffect(() => {
    // מניעת עיבוד כפול
    if (processedRef.current) {
      return;
    }
    
    processedRef.current = true;
    
    const handleCallback = async () => {
      try {
        log.info("Processing callback URL", {
          hasHash: !!window.location.hash,
          hashLength: window.location.hash ? window.location.hash.length : 0,
          search: window.location.search,
          hasCode: !!new URLSearchParams(window.location.search).get('code')
        });
        
        // בדיקה אם יש לנו access_token בפרגמנט
        if (window.location.hash && window.location.hash.includes('access_token')) {
          log.info("Found access_token in hash, processing directly");
          
          // עיבוד הטוקן ישירות
          const success = await extractAccessToken();
          
          if (success) {
            log.info("Successfully processed access token");
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            // מעבר הביתה עם השהיה קצרה
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 300);
            
            return;
          } else {
            log.error("Failed to process access token");
            
            // ננסה לנקות את כל נתוני האימות
            try {
              clearAuthStorage();
            } catch (e) {
              log.error("Error clearing auth data:", e);
            }
          }
        }
      } catch (err) {
        log.error("Unexpected error in callback handler:", { error: err });
      }
    };
    
    // טיפול בקולבק פעם אחת בלבד
    handleCallback();
    
    // טיימר בטיחות
    const safetyTimer = setTimeout(() => {
      if (loading && !error) {
        log.warn("Safety timeout triggered in auth callback");
        navigate("/", { replace: true });
      }
    }, 12000); // 12 שניות
    
    return () => {
      clearTimeout(safetyTimer);
    };
  }, []); 

  // הצגת טעינה או שגיאה בממשק המשתמש
  if (loading) {
    return <AuthCallbackLoading />;
  }

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  // הצגת טעינה בכל מקרה כי אנחנו צפויים לנתב בקרוב
  return <AuthCallbackLoading />;
};

export default AuthCallback;
