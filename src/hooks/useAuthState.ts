
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const log = logger.createLogger({ component: 'useAuthState' });
  const isInitializedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    log.info("Auth state hook initialized, checking for session...");
    
    // Set mounted flag on initialization
    mountedRef.current = true;
    let authStateSubscription: { data: { subscription: { unsubscribe: () => void } } };
    
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        if (!mountedRef.current) return;
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session:", { error });
          if (mountedRef.current) setIsLoading(false);
          return;
        }
        
        log.info("Session check result:", { 
          hasSession: !!data.session,
          userId: data.session?.user?.id ? `${data.session.user.id.substring(0, 8)}...` : 'none'
        });
        
        if (data.session) {
          // If we have a session, update state immediately
          if (mountedRef.current) {
            setSession(data.session);
            setUser(data.session.user);
            
            // Only set loading to false after we've processed the session
            setIsLoading(false);
            isInitializedRef.current = true;
          }
        } else {
          if (mountedRef.current) {
            setSession(null);
            setUser(null);
            
            // Only set loading to false if this is our first check
            if (!isInitializedRef.current) {
              setIsLoading(false);
              isInitializedRef.current = true;
            }
          }
        }
      } catch (err) {
        log.error("Unexpected error checking session:", { error: err });
        if (mountedRef.current) setIsLoading(false);
      }
    };
    
    // Setup auth state change listener before checking session
    setupAuthListener();
    
    // Then check the current session
    checkSession();
    
    // Listen for changes on auth state (logged in, signed out, etc.)
    function setupAuthListener() {
      authStateSubscription = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mountedRef.current) return;
        
        log.info("Auth state changed:", { 
          event, 
          hasSession: !!newSession,
          userId: newSession?.user?.id ? `${newSession.user.id.substring(0, 8)}...` : 'none'
        });
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession && mountedRef.current) {
            setSession(newSession);
            setUser(newSession.user);
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mountedRef.current) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
        }
      });
    }

    // Set a backup timeout to ensure loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      if (mountedRef.current && isLoading) {
        log.warn("Force completing auth loading state after timeout");
        setIsLoading(false);
      }
    }, 700);

    return () => {
      mountedRef.current = false;
      if (authStateSubscription?.data?.subscription) {
        authStateSubscription.data.subscription.unsubscribe();
      }
      clearTimeout(loadingTimeout);
    };
  }, []);

  return { user, session, setIsLoading, isLoading };
}
