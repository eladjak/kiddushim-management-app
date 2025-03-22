
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { useEffect } from "react";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const { error, isProcessing } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  
  useEffect(() => {
    const processAuthHash = async () => {
      log.info("Auth callback page mounted", { 
        hasHash: !!window.location.hash,
        hashLength: window.location.hash?.length || 0,
        processing: isProcessing,
        error: !!error
      });
      
      // Try to directly set the session from the hash if present
      if (window.location.hash && window.location.hash.includes('access_token')) {
        try {
          // This will attempt to set the auth session from the URL
          await supabase.auth.getSession();
          log.info("Successfully processed auth hash from URL");
        } catch (err) {
          log.error("Error processing auth hash:", { error: err });
        }
      }
      
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
    };
    
    processAuthHash();
  }, [isProcessing, error]);

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
