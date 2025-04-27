
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
  const toastHelper = useToast();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        log.info("Processing callback URL", {
          hasHash: !!window.location.hash,
          hashLength: window.location.hash ? window.location.hash.length : 0,
          hashStarts: window.location.hash ? window.location.hash.substring(0, 20) : ""
        });
        
        // Check if there's an access token in the hash - HIGHEST PRIORITY
        if (window.location.hash && window.location.hash.includes('access_token')) {
          log.info("Found access_token in hash, processing directly");
          
          // Wait a moment to ensure the DOM is fully loaded
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Process the token directly
          const success = await extractAccessToken();
          
          if (success) {
            log.info("Successfully processed access token");
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            // Navigate home with small delay to ensure state is updated
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 300);
            
            return;
          } else {
            log.error("Failed to process access token");
          }
        }
        
        // Log URL data for debugging
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        
        log.info("Auth callback page loaded", { 
          loading, 
          hasError: !!error, 
          errorMessage: error,
          hasCode: !!code,
          codeLength: code?.length,
          hasHash: !!window.location.hash,
          error: errorParam
        });
        
        // Final attempt: check for existing session
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            log.error("Error checking session:", { error: sessionError });
          }
          
          if (session) {
            log.info("Session already exists, redirecting to home", {
              userId: session.user.id
            });
            
            toastHelper.toast({
              description: "התחברת בהצלחה",
            });
            
            navigate("/", { replace: true });
          }
        } catch (err) {
          log.error("Error in final session check:", { error: err });
        }
      } catch (err) {
        log.error("Unexpected error in callback handler:", { error: err });
      }
    };
    
    // Handle the callback once
    handleCallback();
    
  }, [loading, error, location, navigate, toastHelper]);

  // Display loading or error UI
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
