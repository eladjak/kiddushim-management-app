
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
        const hasAccessToken = window.location.hash && window.location.hash.includes('access_token');
        const urlCode = new URLSearchParams(window.location.search).get('code');
        const stateCode = location.state?.code;
        
        log.info("🔍 מעבד כתובת קולבק - סקירה ראשונית", {
          hasHash: !!window.location.hash,
          hashLength: window.location.hash ? window.location.hash.length : 0,
          hasAccessToken,
          hasUrlCode: !!urlCode,
          hasStateCode: !!stateCode,
          currentUrl: window.location.href.substring(0, 100) + "..."
        });
        
        // מסלול 1: access_token ב-hash (זהו המסלול העיקרי לגוגל אוט')
        if (hasAccessToken) {
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
            
            return;
          } else {
            log.error("❌ עיבוד access token נכשל - מנסה פתרונות חלופיים");
            
            // ננסה לחלץ הפרמטרים ידנית אם הפונקציה הרגילה נכשלה
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
                  
                  return;
                } else {
                  log.error("❌ גם הגדרת סשן ידנית נכשלה:", setSessionError);
                }
              }
            } catch (manualError) {
              log.error("🚨 שגיאה בעיבוד ידני:", manualError);
            }
          }
        }
        
        // מסלול 2: קוד סשן מהסטייט
        if (stateCode && stateCode.length > 10) {
          log.info("📋 נמצא קוד ב-location state, מעבד");
          const success = await handleAuthCode(stateCode, 'location_state', navigate, toastHelper);
          
          if (success) {
            log.info("✅ עיבוד קוד מסטייט הצליח");
            return;
          } else {
            log.error("❌ עיבוד קוד מסטייט נכשל");
          }
        }
        
        // מסלול 3: קוד ב-URL
        if (urlCode && urlCode.length > 10) {
          log.info("🔗 נמצא קוד בפרמטרי ה-URL, מעבד");
          
          const success = await handleAuthCode(urlCode, 'url_direct', navigate, toastHelper);
          
          if (success) {
            log.info("✅ עיבוד קוד מה-URL הצליח");
            return;
          } else {
            log.error("❌ עיבוד קוד מה-URL נכשל");
          }
        }
        
        // מסלול 4: בדיקת סשן קיים
        try {
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            log.info("✅ נמצא סשן קיים, מועבר לדף הבית");
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            navigate("/", { replace: true });
            return;
          }
        } catch (sessionError) {
          log.error("🚨 שגיאה בבדיקת סשן קיים:", { error: sessionError });
        }
        
        // אם הגענו לכאן - לא הצלחנו לזהות שיטת אימות
        log.warn("⚠️ לא נמצאה שיטת אימות תקפה - בודק סטטוס משתמש");
        
        try {
          const { data, error } = await supabase.auth.getUser();
          if (!error && data.user) {
            log.info("✅ המשתמש כבר מאומת, מועבר לדף הבית");
            navigate("/", { replace: true });
            return;
          }
        } catch (e) {
          log.error("🚨 שגיאה בבדיקת סטטוס משתמש:", e);
        }
        
        // כישלון בכל השיטות
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
        
      } catch (err) {
        log.error("🚨 שגיאה בלתי צפויה במעבד הקולבק:", { error: err });
        
        toastHelper.toast({
          title: "שגיאה",
          description: "אירעה שגיאה בלתי צפויה. נא לנסות שוב.",
          variant: "destructive"
        });
        
        try {
          clearAuthStorage();
        } catch (e) {
          log.error("🚨 שגיאה בניקוי נתוני אימות:", e);
        }
        
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
      }
    };
    
    handleCallback();
    
    // טיימר בטיחות
    const safetyTimer = setTimeout(() => {
      if (loading && !error) {
        log.warn("⏰ הופעל טיימר בטיחות בקולבק אימות");
        navigate("/auth", { replace: true });
      }
    }, 15000);
    
    return () => {
      clearTimeout(safetyTimer);
    };
  }, []); 

  if (loading) {
    return <AuthCallbackLoading />;
  }

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
