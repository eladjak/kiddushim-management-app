
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { logger } from "@/utils/logger";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * This page handles OAuth callback and session establishment
 * It should be configured as the redirect URL in Auth providers
 */
const AuthCallback = () => {
  const { loading, error } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  
  useEffect(() => {
    const logInfo = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          log.error("Error checking session in callback page:", { error: sessionError });
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        log.info("Auth callback page loaded", { 
          loading, 
          hasError: !!error, 
          errorMessage: error,
          hasCode: !!code,
          codeLength: code?.length,
          errorParam,
          errorDescription,
          hasSession: !!session,
          sessionUser: session?.user?.id,
          fullUrl: window.location.href
        });
      } catch (err) {
        log.error("Error logging auth callback info:", { error: err });
      }
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
