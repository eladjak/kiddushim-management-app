
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";
import { LoggerType } from "./types";

interface AuthContextState {
  mountedRef: React.MutableRefObject<boolean>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  log: LoggerType;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const log = logger.createLogger({ component: 'useAuthState' });
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);
  const initializeRef = useRef(false);
  const checkSessionCalledRef = useRef(false);

  useEffect(() => {
    if (initializeRef.current) return;
    initializeRef.current = true;
    
    log.info("Initializing auth state");
    
    // Set up listener before checking session
    const setupAuthListener = () => {
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
    };
    
    // Set up auth listener first
    setupAuthListener();
    
    // Then check for existing session
    const checkSession = async () => {
      if (checkSessionCalledRef.current) return;
      checkSessionCalledRef.current = true;
      
      try {
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
          setSession(data.session);
          setUser(data.session.user);
        }
        
        // Short delay before completing loading to ensure profiles have time to load
        setTimeout(() => {
          if (mountedRef.current) {
            setIsLoading(false);
          }
        }, 300);
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
        try {
          subscriptionRef.current.data.subscription.unsubscribe();
        } catch (error) {
          log.error("Error unsubscribing from auth state changes:", { error });
        }
      }
      
      clearTimeout(loadingTimeout);
    };
  }, [isLoading]);

  return { user, session, setIsLoading, isLoading };
}
