
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import { processCallback } from "./processCallback";
import { useCallbackCleanup } from "./useCallbackCleanup";
import { supabase } from "@/integrations/supabase/client";

/**
 * הוק מרכזי לטיפול בפלואו קולבק האימות
 */
export function useAuthCallbackFlow() {
  const log = logger.createLogger({ component: 'useAuthCallbackFlow' });
  const location = useLocation();
  const navigate = useNavigate();
  const toastHelper = useToast();
  const processedRef = useRef(false);
  const processingRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { handleCriticalError } = useCallbackCleanup();
  
  useEffect(() => {
    // מניעת עיבוד כפול - בדיקה משופרת
    if (processedRef.current || processingRef.current) {
      log.info("קולבק כבר עובד או הושלם, מדלג על עיבוד נוסף", {
        processed: processedRef.current,
        processing: processingRef.current
      });
      return;
    }
    
    // בדיקה מיידית אם יש כבר סשן פעיל
    const checkExistingSessionFirst = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session) {
          log.info("✅ נמצא סשן פעיל בקולבק, מפנה לדף הבית", {
            userId: data.session.user.id,
            email: data.session.user.email
          });
          
          processedRef.current = true;
          
          toastHelper.toast({
            description: "התחברת בהצלחה",
          });
          
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 500);
          
          return true;
        }
      } catch (err) {
        log.warn("שגיאה בבדיקת סשן קיים:", err);
      }
      return false;
    };
    
    // אם יש סשן קיים, לא צריך לעבד כלום
    checkExistingSessionFirst().then(hasExistingSession => {
      if (hasExistingSession) {
        return;
      }
      
      // בדיקה אם יש בכלל מה לעבד
      const hasAccessToken = window.location.hash && window.location.hash.includes('access_token');
      const urlCode = new URLSearchParams(window.location.search).get('code');
      const stateCode = location.state?.code;
      const preservedHash = location.state?.originalHash;
      
      if (!hasAccessToken && !urlCode && !stateCode && !preservedHash) {
        log.warn("אין נתוני אימות לעיבוד בקולבק");
        // במקום להיכשל, ננסה לבדוק סשן קיים
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 1000);
        return;
      }
      
      processingRef.current = true;
      setIsProcessing(true);
      processedRef.current = true;
      
      log.info("🚀 מתחיל עיבוד קולבק אימות", {
        hasAccessToken,
        hasUrlCode: !!urlCode,
        hasStateCode: !!stateCode,
        hasPreservedHash: !!preservedHash,
        processing: processingRef.current
      });
      
      const context = { navigate, toastHelper };
      
      // הפעלת עיבוד הקולבק עם timeout
      const processWithTimeout = async () => {
        try {
          await Promise.race([
            processCallback(context, location),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Callback processing timeout")), 10000)
            )
          ]);
          
          log.info("✅ עיבוד קולבק הושלם בהצלחה");
        } catch (error) {
          log.error("🚨 כישלון בעיבוד קולבק:", error);
          handleCriticalError(error);
        } finally {
          processingRef.current = false;
          setIsProcessing(false);
        }
      };
      
      processWithTimeout();
    });
    
  }, [location, navigate, toastHelper, log, handleCriticalError]);

  return { isProcessing };
}
