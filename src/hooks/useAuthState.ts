
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const log = logger.createLogger({ component: 'useAuthState' });
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);
  const initializeRef = useRef(false);

  useEffect(() => {
    if (initializeRef.current) return;
    initializeRef.current = true;
    
    log.info("Initializing auth state");
    
    // Set up listener before checking session
    const setupAuthListener = () => {
      const authListener = supabase.auth.onAuthStateChange(async (event, newSession) => {
        log.info("Auth state changed:", { 
          event, 
          hasSession: !!newSession,
        });
        
        if (!mountedRef.current) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
    };
    
    // Set up auth listener first
    setupAuthListener();
    
    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session:", { error });
          if (mountedRef.current) setIsLoading(false);
          return;
        }
        
        log.info("Session check result:", { 
          hasSession: !!data.session
        });
        
        if (!mountedRef.current) return;
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
        
        // Set loading to false regardless of session status
        setIsLoading(false);
      } catch (err) {
        log.error("Unexpected error checking session:", { error: err });
        if (mountedRef.current) setIsLoading(false);
      }
    };
    
    checkSession();

    // Set a backup timeout to ensure loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      if (isLoading && mountedRef.current) {
        log.warn("Force completing auth loading state after timeout");
        setIsLoading(false);
      }
    }, 700);

    return () => {
      mountedRef.current = false;
      
      if (subscriptionRef.current?.data?.subscription) {
        subscriptionRef.current.data.subscription.unsubscribe();
      }
      
      clearTimeout(loadingTimeout);
    };
  }, []);

  return { user, session, setIsLoading, isLoading };
}
