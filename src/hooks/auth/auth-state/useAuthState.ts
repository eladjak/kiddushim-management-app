
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";
import { useAuthListener } from "./useAuthListener";
import { useSessionCheck } from "./useSessionCheck";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const log = logger.createLogger({ component: 'useAuthState' });
  const mountedRef = useRef(true);
  const initializeRef = useRef(false);

  useEffect(() => {
    if (initializeRef.current) return;
    initializeRef.current = true;
    
    log.info("Initializing auth state");
    
    // Set up auth listener
    const { subscription, cleanup: cleanupListener } = useAuthListener({
      mountedRef,
      setSession,
      setUser,
      setIsLoading,
      log
    });
    
    // Check for existing session
    useSessionCheck({
      mountedRef,
      setSession,
      setUser,
      setIsLoading,
      log
    });

    // הגדרת טיימאאוט כמנגנון גיבוי למצב שהטעינה תקועה
    const loadingTimeout = setTimeout(() => {
      if (isLoading && mountedRef.current) {
        log.warn("Force completing auth loading state after timeout");
        setIsLoading(false);
      }
    }, 2000); // הגדלנו את הזמן כדי לתת מספיק זמן לתהליך האימות

    return () => {
      log.info("Cleanup auth state hook");
      mountedRef.current = false;
      cleanupListener();
      clearTimeout(loadingTimeout);
    };
  }, [isLoading]);

  // בדיקה נוספת אם יש לנו סשן וחיבור של המשתמש
  useEffect(() => {
    if (session && !user && !isLoading) {
      log.info("Session exists but no user - fixing state");
      setUser(session.user);
    }
  }, [session, user, isLoading]);

  return { user, session, setIsLoading, isLoading };
}
