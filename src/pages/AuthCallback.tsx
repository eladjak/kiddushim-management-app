
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { logger } from "@/utils/logger";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useEffect } from "react";

/**
 * This page handles OAuth callback and session establishment
 * It should be configured as the redirect URL in Auth providers
 */
const AuthCallback = () => {
  const { loading, error } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  
  useEffect(() => {
    log.info("Auth callback page loaded", { 
      loading, 
      hasError: !!error, 
      hash: !!window.location.hash, 
      search: !!window.location.search
    });
    
    // Log search and hash params for debugging (sanitized)
    const searchParams = new URLSearchParams(window.location.search);
    const searchKeys = Array.from(searchParams.keys());
    log.info("URL search params keys:", { keys: searchKeys });
    
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
