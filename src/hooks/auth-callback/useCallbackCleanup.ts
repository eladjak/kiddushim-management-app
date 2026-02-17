
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { clearAuthStorage } from "@/integrations/supabase/client";

/**
 * הוק לניקוי וטיימר בטיחות עבור קולבק אימות
 */
export function useCallbackCleanup() {
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'useCallbackCleanup' });
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // טיימר בטיחות - אם התהליך נתקע יותר מ-15 שניות
    const safetyTimer = setTimeout(() => {
      log.warn("⏰ הופעל טיימר בטיחות בקולבק אימות");
      navigate("/auth", { replace: true });
    }, 15000);

    // פונקציית ניקוי
    const cleanup = () => {
      clearTimeout(safetyTimer);
    };

    cleanupRef.current = cleanup;

    return cleanup;
  }, [navigate, log]);

  // פונקציה לטיפול בשגיאות חמורות
  const handleCriticalError = (error: unknown) => {
    log.error("🚨 שגיאה חמורה בקולבק, מנקה ומפנה מחדש:", error);
    
    try {
      clearAuthStorage();
    } catch (e) {
      log.error("🚨 שגיאה בניקוי נתוני אימות:", e);
    }
    
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2000);
  };

  return { handleCriticalError };
}
