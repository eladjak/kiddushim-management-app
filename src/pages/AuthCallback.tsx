
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { logger } from "@/utils/logger";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useEffect } from "react";
import { supabase } from "@/services/supabase/client";

/**
 * This page handles OAuth callback and session establishment
 * It should be configured as the redirect URL in Auth providers
 */
const AuthCallback = () => {
  const { loading, error } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  
  useEffect(() => {
    const logInfo = async () => {
      const sessionCheck = await supabase.auth.getSession();
      
      log.info("Auth callback page loaded", { 
        loading, 
        hasError: !!error, 
        hash: !!window.location.hash, 
        search: !!window.location.search,
        code: new URLSearchParams(window.location.search).get('code'),
        hasSession: !!sessionCheck.data.session,
        sessionUser: sessionCheck.data.session?.user?.id
      });
      
      // Log search and hash params for debugging (sanitized)
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const searchKeys = Array.from(searchParams.keys());
      const hashKeys = Array.from(hashParams.keys());
      
      log.info("URL search params keys:", { keys: searchKeys });
      log.info("URL hash params keys:", { keys: hashKeys });
    };
    
    logInfo();
    
    return () => {
      log.info("Auth callback page unmounted");
    };
  }, [loading, error]);

  if (loading) {
    return <AuthCallbackLoading />;
  }

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  // Show loading anyway as we should redirect soon
  return <AuthCallbackLoading />;
};

export default AuthCallback;
