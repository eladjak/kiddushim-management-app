
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { useEffect } from "react";
import { logger } from "@/utils/logger";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const { error, isProcessing } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  
  useEffect(() => {
    log.info("Auth callback page mounted", { 
      hasHash: !!window.location.hash,
      hashLength: window.location.hash?.length || 0,
      processing: isProcessing,
      error: !!error
    });
    
    // Log the current URL for debugging (without exposing sensitive tokens)
    const url = new URL(window.location.href);
    log.info("Current URL in AuthCallback", { 
      pathname: url.pathname,
      hasHash: !!url.hash,
      hashLength: url.hash?.length || 0,
      search: url.search
    });
  }, [isProcessing, error]);

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
