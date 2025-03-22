
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { useEffect, useRef } from "react";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const { error, isProcessing } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  const processedRef = useRef(false);
  
  useEffect(() => {
    // Only process once to avoid multiple calls
    if (processedRef.current) return;
    processedRef.current = true;
    
    const processAuthHash = async () => {
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
      
      // If we don't have a hash with access token but have an error query param,
      // it may be from the OAuth provider's error response
      if (!window.location.hash && url.searchParams.has('error')) {
        const errorDescription = url.searchParams.get('error_description') || 'Unknown error';
        log.error("OAuth error from provider:", { error: errorDescription });
      }
      
      // Check if we can get the session directly (in case the session was already established)
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          log.error("Error checking session in callback:", { error });
        } else if (data.session) {
          log.info("Session already established in callback");
        }
      } catch (err) {
        log.error("Unexpected error checking session:", { error: err });
      }
    };
    
    processAuthHash();
  }, [isProcessing, error]);

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
