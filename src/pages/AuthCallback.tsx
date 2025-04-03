
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { logger } from "@/utils/logger";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

/**
 * This page handles OAuth callback and session establishment
 * It should be configured as the redirect URL in Auth providers
 */
const AuthCallback = () => {
  const { loading, error } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  const location = useLocation();
  
  useEffect(() => {
    const logInfo = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          log.error("Error checking session in callback page:", { error: sessionError });
        }
        
        // Get more comprehensive information about the URL state
        const fullUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // Check if we have a code in hash or path
        let hashCode = null;
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashCode = hashParams.get("code");
        }
        
        // Check for code in path
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        const pathCode = lastPart !== 'callback' ? lastPart : null;
        
        // Check state data
        const stateData = location.state || {};
        
        log.info("Auth callback page loaded", { 
          loading, 
          hasError: !!error, 
          errorMessage: error,
          hasCode: !!code,
          codeLength: code?.length,
          hasHashCode: !!hashCode,
          hashCodeLength: hashCode?.length,
          pathCode: pathCode,
          errorParam,
          errorDescription,
          hasSession: !!session,
          sessionUser: session?.user?.id,
          locationStateData: stateData,
          fullUrl
        });
      } catch (err) {
        log.error("Error logging auth callback info:", { error: err });
      }
    };
    
    logInfo();
    
    return () => {
      log.info("Auth callback page unmounted");
    };
  }, [loading, error, location]);

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
