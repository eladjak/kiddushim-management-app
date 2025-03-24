
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
    
    // Check if there's an auth hash (OAuth callback)
    const hasAuthHash = window.location.hash && (
      window.location.hash.includes('access_token') || 
      window.location.hash.includes('error') ||
      window.location.hash.includes('type=recovery') ||
      window.location.hash.includes('provider=')
    );
    
    if (hasAuthHash) {
      log.info("Detected auth hash, redirecting to callback page:", { hash: window.location.hash });
      
      // Redirect to the auth callback page to handle the login properly
      // Use replace: true to avoid back button issues
      navigate("/auth/callback", { replace: true });
      return;
    }
    
    log.info("No auth hash detected, proceeding with normal page load");
  }, [navigate]);
};
