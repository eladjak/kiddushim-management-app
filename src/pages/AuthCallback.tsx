
import { useAuthCallback } from "@/hooks/useAuthCallback";
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
    const logInfo = async () => {
      try {
        // Additional direct access token processing for improved reliability
        if (window.location.hash && window.location.hash.includes('access_token')) {
          log.info("AuthCallback page attempting direct access token extraction");
          const success = await extractAccessToken();
          
          if (success) {
            log.info("Successfully extracted and used access token directly in callback page");
            
            toast({
              description: "התחברת בהצלחה",
            });
            
            // Navigate to home page after successful login
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 500);
            
            return;
          } else {
            log.error("Direct access token extraction failed in callback page");
          }
        }
        
        // Check if we were redirected from auth
        const wasRedirected = localStorage.getItem('auth_redirect_initiated') === 'true' || 
                             sessionStorage.getItem('auth_redirect_initiated') === 'true';
        const redirectTime = localStorage.getItem('auth_redirect_time') || 
                           sessionStorage.getItem('auth_redirect_time');
        
        // Clear the redirect flag
        localStorage.removeItem('auth_redirect_initiated');
        localStorage.removeItem('auth_redirect_time');
        sessionStorage.removeItem('auth_redirect_initiated');
        sessionStorage.removeItem('auth_redirect_time');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          log.error("Error checking session in callback page:", { error: sessionError });
        }
        
        // Detailed URL state information
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
          wasRedirected,
          redirectTime,
          hasCode: !!code,
          codeLength: code?.length,
          hasHashCode: !!hashCode,
          hashCodeLength: hashCode?.length,
          hasHashAccessToken: !!hashAccessToken,
          hashAccessTokenLength: hashAccessToken?.length,
          pathCode: !!pathCode,
          errorParam,
          errorDescription,
          hasSession: !!session,
          sessionUser: session?.user?.id,
          locationStateData: stateData,
          hostname: window.location.hostname,
          fullUrl: fullUrl.substring(0, 100) + (fullUrl.length > 100 ? '...' : '')
        });
        
        // If we already have a session at this point, go to home
        if (session) {
          log.info("Session already exists, redirecting to home");
          toast({
            description: "התחברת בהצלחה",
          });
          navigate("/", { replace: true });
        }
        
      } catch (err) {
        log.error("Error logging auth callback info:", { error: err });
      }
    };
    
    logInfo();
    
    return () => {
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
