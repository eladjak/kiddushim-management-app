
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { LoggerType } from "./types";

/**
 * Hook to listen for authentication state changes and update the user context.
 */
export const useAuthListener = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const log = logger.createLogger({ component: 'useAuthListener' });

  useEffect(() => {
    auth.setIsLoading(true);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log.info(`Auth state change event: ${event}`);
        
        if (session) {
          log.info("User session detected", { userId: session.user.id });
          auth.setUser(session.user);
          
          // Redirect from auth callback page
          if (location.pathname === '/auth-callback') {
            log.info("Redirecting from auth callback");
            navigate('/dashboard', { replace: true });
          }
        } else {
          log.info("No user session detected, clearing user context");
          auth.setUser(null);
          auth.setProfile(null);
          
          // Redirect to signin page if not already there
          if (!['/signin', '/signup', '/auth-callback'].includes(location.pathname)) {
            log.info("Redirecting to signin page");
            navigate('/signin', { replace: true });
          }
        }
        
        auth.setIsLoading(false);
      }
    );

    return () => {
      log.info("Removing auth state change subscription");
      subscription.unsubscribe();
    };
  }, [auth, navigate, location]);
};
