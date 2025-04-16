
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Logger } from "@/utils/logger";

interface AuthListenerParams {
  mountedRef: React.MutableRefObject<boolean>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  log: Logger;
}

export function useAuthListener({
  mountedRef,
  setSession,
  setUser,
  setIsLoading,
  log
}: AuthListenerParams) {
  const subscriptionRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);

  try {
    const authListener = supabase.auth.onAuthStateChange(async (event, newSession) => {
      log.info("Auth state changed:", { 
        event, 
        hasSession: !!newSession,
        userId: newSession?.user?.id
      });
      
      if (!mountedRef.current) return;
      
      // הטיפול בכל סוגי האירועים
      if (newSession) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          log.info("Setting user and session from auth event", { event, userId: newSession.user.id });
          setSession(newSession);
          setUser(newSession.user);
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        log.info("User signed out, clearing session and user");
        setSession(null);
        setUser(null);
        setIsLoading(false);
      }
    });
    
    subscriptionRef.current = authListener;
  } catch (error) {
    log.error("Error setting up auth listener:", { error });
    setIsLoading(false);
  }

  const cleanup = () => {
    if (subscriptionRef.current?.data?.subscription) {
      try {
        log.info("Cleaning up auth listener subscription");
        subscriptionRef.current.data.subscription.unsubscribe();
      } catch (error) {
        log.error("Error unsubscribing from auth state changes:", { error });
      }
    }
  };

  return { subscription: subscriptionRef.current, cleanup };
}
