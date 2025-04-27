
import { useAuthCallback } from "@/hooks/auth-callback/useAuthCallback";
import { logger } from "@/utils/logger";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { extractAccessToken } from "@/hooks/auth-callback/extractAccessToken";
import { useToast } from "@/hooks/use-toast";

/**
 * This page handles OAuth callback and session establishment
 * It should be configured as the redirect URL in Auth providers
 */
const AuthCallback = () => {
  const { loading, error } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First attempt: Use parseFragmentHash directly if hash is present
        if (window.location.hash && window.location.hash.includes('access_token')) {
          log.info("Attempting direct hash parsing in AuthCallback component");
          try {
            const { data, error } = await supabase.auth.parseFragmentHash(window.location.hash);
            if (!error && data?.session) {
              log.info("Successfully authenticated via parseFragmentHash in component", {
                userId: data.session.user.id
              });
              
              toast({
                description: "התחברת בהצלחה",
              });
              
              // Navigate to home page after successful login
              setTimeout(() => {
                navigate("/", { replace: true });
              }, 300);
              
              return;
            } else {
              log.warn("parseFragmentHash in component returned error or no session", { error });
            }
          } catch (parseError) {
            log.error("Error using parseFragmentHash in component:", { error: parseError });
          }
        }
        
        // Second attempt: Fall back to manual token extraction
        if (window.location.hash && window.location.hash.includes('access_token')) {
          log.info("AuthCallback component attempting manual access token extraction");
          const success = await extractAccessToken();
          
          if (success) {
            log.info("Successfully extracted and used access token in callback component");
            
            toast({
              description: "התחברת בהצלחה",
            });
            
            // Navigate to home page after successful login
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 300);
            
            return;
          } else {
            log.error("Direct access token extraction failed in callback component");
          }
        }
        
        // Detailed URL state information for debugging
        const fullUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // Check for code in hash or path
        let hashCode = null;
        let hashAccessToken = null;
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashCode = hashParams.get("code");
          hashAccessToken = hashParams.get("access_token");
        }
        
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
          hasHashAccessToken: !!hashAccessToken,
          hashAccessTokenLength: hashAccessToken?.length,
          errorParam,
          errorDescription,
          locationStateData: stateData,
          fullUrl: fullUrl.substring(0, 100) + (fullUrl.length > 100 ? '...' : '')
        });
        
        // Check current session as a last resort
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            log.error("Error checking session in callback page:", { error: sessionError });
          }
          
          // If we already have a session at this point, go to home
          if (session) {
            log.info("Session already exists, redirecting to home");
            toast({
              description: "התחברת בהצלחה",
            });
            navigate("/", { replace: true });
          }
        } catch (err) {
          log.error("Error checking final session state:", { error: err });
        }
      } catch (err) {
        log.error("Error in auth callback handler:", { error: err });
      }
    };
    
    // Only run this effect once when the component mounts
    handleCallback();
    
    // Monitor hash changes on this page
    const handleHashChange = () => {
      log.info("Hash changed in auth callback page, reprocessing");
      handleCallback();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      log.info("Auth callback page unmounted");
    };
  }, [loading, error, location, navigate, toast]);

  // If we are still loading and haven't redirected yet
  if (loading) {
    return <AuthCallbackLoading />;
  }

  // If we have an error
  if (error) {
    return <AuthCallbackError error={error} />;
  }

  // Show loading anyway as we should redirect soon
  return <AuthCallbackLoading />;
};

export default AuthCallback;
