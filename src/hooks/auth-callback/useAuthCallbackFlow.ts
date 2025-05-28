
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import { clearAuthStorage } from "@/integrations/supabase/client";
import { processAccessToken } from "./processAccessToken";
import { processAuthCodes } from "./processAuthCodes";
import { checkExistingSession } from "./checkExistingSession";
import { handleAuthFailure } from "./handleAuthFailure";

/**
 * הוק מרכזי לטיפול בפלואו קולבק האימות
 */
export function useAuthCallbackFlow() {
  const log = logger.createLogger({ component: 'useAuthCallbackFlow' });
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
        
        const context = { navigate, toastHelper };
        
        // מסלול 1: access_token ב-hash (זהו המסלול העיקרי לגוגל אוט')
        if (hasAccessToken) {
          const result = await processAccessToken(context);
          if (result.success) {
            return true;
          }
        }
        
        // מסלול 2 ו-3: קודי אימות
        const codesResult = await processAuthCodes(context, location);
        if (codesResult.success) {
          return true;
        }
        
        // מסלול 4: בדיקת סשן קיים
        const sessionResult = await checkExistingSession(context);
        if (sessionResult.success) {
          return true;
        }
        
        // אם הגענו לכאן - לא הצלחנו לזהות שיטת אימות
        log.warn("⚠️ לא נמצאה שיטת אימות תקפה");
        handleAuthFailure(context);
        
        return false;
        
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
        
        return false;
      }
    };
    
    handleCallback();
    
    // טיימר בטיחות
    const safetyTimer = setTimeout(() => {
      log.warn("⏰ הופעל טיימר בטיחות בקולבק אימות");
      navigate("/auth", { replace: true });
    }, 15000);
    
    return () => {
      clearTimeout(safetyTimer);
    };
  }, []);
}
