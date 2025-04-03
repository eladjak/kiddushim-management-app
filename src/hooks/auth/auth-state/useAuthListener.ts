
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
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
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
        subscriptionRef.current.data.subscription.unsubscribe();
      } catch (error) {
        log.error("Error unsubscribing from auth state changes:", { error });
      }
    }
  };

  return { subscription: subscriptionRef.current, cleanup };
}
