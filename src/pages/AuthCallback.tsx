
import { useAuthCallback } from "@/hooks/auth-callback/useAuthCallback";
import { logger } from "@/utils/logger";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { extractAccessToken } from "@/hooks/auth-callback/extractAccessToken";
import { useToast } from "@/hooks/use-toast";
import { clearAuthStorage, supabase } from "@/integrations/supabase/client";
import { handleAuthCode } from "@/hooks/auth-callback/handleAuthCode";

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
          hasCode: !!new URLSearchParams(window.location.search).get('code'),
          stateCode: location.state?.code ? true : false
        });
        
        // בדיקה אם יש לנו קוד סשן מהסטייט
        if (location.state?.code && location.state.code.length > 10) {
          log.info("Found code in location state, processing");
          const success = await handleAuthCode(
            location.state.code, 
            'location_state', 
            navigate, 
            toastHelper
          );
          
          if (success) {
            log.info("Successfully processed code from state");
            return;
          } else {
            log.error("Failed to process code from state");
          }
        }
        
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
            }, 500);
            
            return;
          } else {
            log.error("Failed to process access token");
          }
        }
        
        // בדיקה אם יש לנו קוד ב-URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlCode = urlParams.get('code');
        
        if (urlCode && urlCode.length > 10) {
          log.info("Found code in URL params, processing directly");
          
          const success = await handleAuthCode(urlCode, 'url_direct', navigate, toastHelper);
          
          if (success) {
            log.info("Successfully processed code from URL");
            return;
          } else {
            log.error("Failed to process code from URL");
          }
        }
        
        // בדיקה אם יש לנו סשן פעיל
        try {
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            log.info("Found existing session, redirecting to home");
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            navigate("/", { replace: true });
            return;
          }
        } catch (sessionError) {
          log.error("Error checking for existing session:", { error: sessionError });
        }
        
        log.warn("No valid authentication method found");
        
      } catch (err) {
        log.error("Unexpected error in callback handler:", { error: err });
        
        // ננסה לנקות את כל נתוני האימות
        try {
          clearAuthStorage();
        } catch (e) {
          log.error("Error clearing auth data:", e);
        }
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
