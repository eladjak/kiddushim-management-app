
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
    
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session:", { error });
          setIsLoading(false);
          return;
        }
        
        log.info("Session check result:", { hasSession: !!data.session });
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Force loading state to finish after a very short delay
          // This ensures that other components have time to react to the state change
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
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
    
    // Start session check right away
    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      log.info("Auth state changed:", { event, hasSession: !!newSession });
      
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        
        // Force loading state to finish after a very short delay
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      } else {
        setSession(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, setIsLoading, isLoading };
}
