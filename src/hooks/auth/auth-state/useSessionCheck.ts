
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Logger } from "@/utils/logger";

interface SessionCheckParams {
  mountedRef: React.MutableRefObject<boolean>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  log: Logger;
}

export function useSessionCheck({
  mountedRef,
  setSession,
  setUser,
  setIsLoading,
  log
}: SessionCheckParams) {
  const checkSessionCalledRef = useRef(false);

  if (checkSessionCalledRef.current) return;
  checkSessionCalledRef.current = true;
  
  const checkSession = async () => {
    try {
      log.info("Checking for existing session");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        log.error("Error getting session:", { error });
        if (mountedRef.current) setIsLoading(false);
        return;
      }
      
      log.info("Session check result:", { 
        hasSession: !!data.session,
        userId: data.session?.user?.id
      });
      
      if (!mountedRef.current) return;
      
      if (data.session) {
        log.info("Setting user and session from existing session", { userId: data.session.user.id });
        setSession(data.session);
        setUser(data.session.user);
      }
      
      // אנחנו נותנים קצת זמן לטעינת פרופילים ומידע נוסף
      setTimeout(() => {
        if (mountedRef.current) {
          log.info("Completing initial loading state");
          setIsLoading(false);
        }
      }, 500);
    } catch (err) {
      log.error("Unexpected error checking session:", { error: err });
      if (mountedRef.current) setIsLoading(false);
    }
  };
  
  checkSession();
}
