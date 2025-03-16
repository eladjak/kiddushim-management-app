
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const log = logger.createLogger({ component: 'useAuthState' });

  useEffect(() => {
    log.info("Auth state hook initialized, checking for session...");
    
    let authStateSubscription: { data: { subscription: { unsubscribe: () => void } } };
    
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session:", { error });
          setIsLoading(false);
          return;
        }
        
        log.info("Session check result:", { 
          hasSession: !!data.session,
          userId: data.session?.user?.id ? `${data.session.user.id.substring(0, 8)}...` : 'none'
        });
        
        if (data.session) {
          // If we have a session, update state immediately
          setSession(data.session);
          setUser(data.session.user);
          setIsLoading(false);
        } else {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      } catch (err) {
        log.error("Unexpected error checking session:", { error: err });
        setIsLoading(false);
      }
    };
    
    // Listen for changes on auth state (logged in, signed out, etc.)
    const setupAuthListener = () => {
      authStateSubscription = supabase.auth.onAuthStateChange(async (event, newSession) => {
        log.info("Auth state changed:", { 
          event, 
          hasSession: !!newSession,
          userId: newSession?.user?.id ? `${newSession.user.id.substring(0, 8)}...` : 'none'
        });
        
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          setIsLoading(false);
        } else {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      });
    };
    
    // Start session check and setup listeners
    checkSession();
    setupAuthListener();

    // Set a backup timeout to ensure loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        log.warn("Force completing auth loading state after timeout");
        setIsLoading(false);
      }
    }, 800); // Even shorter timeout

    return () => {
      if (authStateSubscription?.data?.subscription) {
        authStateSubscription.data.subscription.unsubscribe();
      }
      clearTimeout(loadingTimeout);
    };
  }, []);

  return { user, session, setIsLoading, isLoading };
}
