
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import { processCallback } from "./processCallback";
import { useCallbackCleanup } from "./useCallbackCleanup";

/**
 * הוק מרכזי לטיפול בפלואו קולבק האימות
 */
export function useAuthCallbackFlow() {
  const log = logger.createLogger({ component: 'useAuthCallbackFlow' });
  const location = useLocation();
  const navigate = useNavigate();
  const toastHelper = useToast();
  const processedRef = useRef(false);
  const { handleCriticalError } = useCallbackCleanup();
  
  useEffect(() => {
    // מניעת עיבוד כפול
    if (processedRef.current) {
      log.info("קולבק כבר עובד, מדלג על עיבוד נוסף");
      return;
    }
    
    processedRef.current = true;
    log.info("🚀 מתחיל עיבוד קולבק אימות");
    
    const context = { navigate, toastHelper };
    
    // הפעלת עיבוד הקולבק
    processCallback(context, location).catch((error) => {
      log.error("🚨 כישלון בעיבוד קולבק:", error);
      handleCriticalError(error);
    });
    
  }, [location, navigate, toastHelper, log, handleCriticalError]);
}
