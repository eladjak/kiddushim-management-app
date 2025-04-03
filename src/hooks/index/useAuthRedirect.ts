
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";

/**
 * Hook to handle OAuth redirects when an auth code or hash is present in the URL
 */
export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'useAuthRedirect' });
  const hashCheckedRef = useRef(false);

  useEffect(() => {
    if (hashCheckedRef.current) return;
    hashCheckedRef.current = true;
    
    try {
      // Capture raw URL for debugging
      const fullUrl = window.location.href;
      
      // Check if there's an auth code in search parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthCode = urlParams.has('code');
      
      if (hasAuthCode) {
        log.info("Detected auth code in URL, redirecting to callback page", { url: fullUrl });
        navigate("/auth/callback", { replace: true });
        return;
      }
      
      // Check if there's an auth code in hash fragment
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.has('code')) {
          log.info("Detected auth code in URL hash, redirecting to callback page", { url: fullUrl });
          navigate("/auth/callback", { replace: true });
          return;
        }
      }
      
      // Check if there are error parameters
      if (urlParams.has('error') || urlParams.has('error_description')) {
        log.info("Detected auth error in URL, redirecting to callback page", { url: fullUrl });
        navigate("/auth/callback", { replace: true });
        return;
      }
      
      // Check for special path formats (some OAuth providers add the code to the path)
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 2 && 
          pathParts[1] === 'auth' && 
          pathParts[2] !== 'callback' && 
          pathParts[2].length > 20) { // Auth codes are usually long
        log.info("Detected potential auth code in path, redirecting to callback page", { url: fullUrl });
        navigate("/auth/callback", { replace: true });
        return;
      }
      
      log.info("No auth code, hash or params detected, proceeding with normal page load");
    } catch (error) {
      log.error("Error checking for auth redirect:", { error });
    }
  }, [navigate]);
};
