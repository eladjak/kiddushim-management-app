
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";

/**
 * Hook to handle OAuth redirects when an auth hash is present in the URL
 */
export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'useAuthRedirect' });
  const hashCheckedRef = useRef(false);

  useEffect(() => {
    if (hashCheckedRef.current) return;
    hashCheckedRef.current = true;
    
    try {
      // Check if there's an auth code (PKCE flow)
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthCode = urlParams.has('code');
      
      if (hasAuthCode) {
        log.info("Detected auth code in URL, redirecting to callback page");
        navigate("/auth/callback", { replace: true, state: { fromRedirect: true } });
        return;
      }
      
      // Check if there's an auth hash (OAuth callback)
      const hasAuthHash = window.location.hash && (
        window.location.hash.includes('access_token') || 
        window.location.hash.includes('error') ||
        window.location.hash.includes('type=recovery') ||
        window.location.hash.includes('provider=')
      );
      
      if (hasAuthHash) {
        log.info("Detected auth hash, redirecting to callback page:", { 
          hashLength: window.location.hash.length 
        });
        
        // Redirect to the auth callback page to handle the login properly
        // Use replace: true to avoid back button issues
        navigate("/auth/callback", { replace: true, state: { fromRedirect: true } });
        return;
      }
      
      // Check URL search params as well (some providers use query params instead of hash)
      if (urlParams.has('access_token') || urlParams.has('error')) {
        log.info("Detected auth params in URL, redirecting to callback page");
        navigate("/auth/callback", { replace: true, state: { fromRedirect: true } });
        return;
      }
      
      log.info("No auth hash, code or params detected, proceeding with normal page load");
    } catch (error) {
      log.error("Error checking for auth redirect:", error);
    }
  }, [navigate]);
};
