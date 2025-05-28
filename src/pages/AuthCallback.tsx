
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
        log.info("מעבד כתובת קולבק", {
          hasHash: !!window.location.hash,
          hashLength: window.location.hash ? window.location.hash.length : 0,
          search: window.location.search,
          hasCode: !!new URLSearchParams(window.location.search).get('code'),
          stateCode: location.state?.code ? true : false,
          hasAccessToken: window.location.hash && window.location.hash.includes('access_token'),
          currentUrl: window.location.href
        });
        
        // מסלול 1: בדיקה אם יש לנו access_token בפרגמנט (זהו המסלול הנוכחי)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          log.info("זוהה access_token ב-hash, מעבד ישירות");
          
          // נשמור את ה-hash לפני שהוא נמחק
          const originalHash = window.location.hash;
          log.info("Hash מקורי נשמר:", { hashStart: originalHash.substring(0, 100) });
          
          const success = await extractAccessToken();
          
          if (success) {
            log.info("עיבוד access token הצליח");
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            // מעבר הביתה עם השהיה קצרה
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 500);
            
            return;
          } else {
            log.error("עיבוד access token נכשל, מנסה דרכים חלופיות");
            
            // אם נכשל, ננסה לחלץ הפרמטרים ידנית
            try {
              const hashParams = new URLSearchParams(originalHash.substring(1));
              const accessToken = hashParams.get("access_token");
              const refreshToken = hashParams.get("refresh_token");
              
              if (accessToken && accessToken.length > 20) {
                log.info("מנסה הגדרת סשן ידנית");
                
                const { data, error: setSessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || "",
                });
                
                if (!setSessionError && data.session) {
                  log.info("הגדרת סשן ידנית הצליחה");
                  
                  toastHelper.toast({
                    description: "התחברת בהצלחה",
                  });
                  
                  setTimeout(() => {
                    navigate("/", { replace: true });
                  }, 500);
                  
                  return;
                }
              }
            } catch (manualError) {
              log.error("שגיאה בעיבוד ידני:", manualError);
            }
          }
        }
        
        // מסלול 2: בדיקה אם יש לנו קוד סשן מהסטייט
        if (location.state?.code && location.state.code.length > 10) {
          log.info("נמצא קוד ב-location state, מעבד");
          const success = await handleAuthCode(
            location.state.code, 
            'location_state', 
            navigate, 
            toastHelper
          );
          
          if (success) {
            log.info("עיבוד קוד מסטייט הצליח");
            return;
          } else {
            log.error("עיבוד קוד מסטייט נכשל");
          }
        }
        
        // מסלול 3: בדיקה אם יש לנו קוד ב-URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlCode = urlParams.get('code');
        
        if (urlCode && urlCode.length > 10) {
          log.info("נמצא קוד בפרמטרי ה-URL, מעבד ישירות");
          
          const success = await handleAuthCode(urlCode, 'url_direct', navigate, toastHelper);
          
          if (success) {
            log.info("עיבוד קוד מה-URL הצליח");
            return;
          } else {
            log.error("עיבוד קוד מה-URL נכשל");
          }
        }
        
        // מסלול 4: בדיקה אם יש לנו סשן פעיל
        try {
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            log.info("נמצא סשן קיים, מועבר לדף הבית");
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            navigate("/", { replace: true });
            return;
          }
        } catch (sessionError) {
          log.error("שגיאה בבדיקת סשן קיים:", { error: sessionError });
        }
        
        // אם הגענו לכאן, זה אומר שלא הצלחנו לזהות את שיטת האימות הנכונה
        log.warn("לא נמצאה שיטת אימות תקפה");
        
        // ננסה לראות אם המשתמש מחובר ישירות
        try {
          const { data, error } = await supabase.auth.getUser();
          if (!error && data.user) {
            log.info("המשתמש כבר מאומת, מועבר לדף הבית");
            navigate("/", { replace: true });
            return;
          }
        } catch (e) {
          log.error("שגיאה בבדיקת סטטוס משתמש:", e);
        }
        
        // אם כל השיטות נכשלו
        log.error("כל שיטות האימות נכשלו");
        toastHelper.toast({
          title: "שגיאה בהתחברות",
          description: "לא ניתן היה להשלים את תהליך ההתחברות. נא לנסות שוב.",
          variant: "destructive"
        });
        
        // ניקוי וחזרה לדף התחברות
        clearAuthStorage();
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
        
      } catch (err) {
        log.error("שגיאה בלתי צפויה במעבד הקולבק:", { error: err });
        
        toastHelper.toast({
          title: "שגיאה",
          description: "אירעה שגיאה בלתי צפויה. נא לנסות שוב.",
          variant: "destructive"
        });
        
        // ננסה לנקות את כל נתוני האימות
        try {
          clearAuthStorage();
        } catch (e) {
          log.error("שגיאה בניקוי נתוני אימות:", e);
        }
        
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
      }
    };
    
    // טיפול בקולבק פעם אחת בלבד
    handleCallback();
    
    // טיימר בטיחות
    const safetyTimer = setTimeout(() => {
      if (loading && !error) {
        log.warn("הופעל טיימר בטיחות בקולבק אימות");
        navigate("/auth", { replace: true });
      }
    }, 15000); // 15 שניות
    
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
