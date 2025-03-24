
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { useEffect, useRef } from "react";
import { logger } from "@/utils/logger";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const { error, isProcessing } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  const hasLoggedRef = useRef(false);
  
  // Log once when the component mounts
  useEffect(() => {
    if (!hasLoggedRef.current) {
      hasLoggedRef.current = true;
      log.info("Auth callback page loaded", { error, isProcessing });
    }
  }, [error, isProcessing]);

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
