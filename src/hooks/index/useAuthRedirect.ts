
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
      // Check if there's an auth code (PKCE flow)
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthCode = urlParams.has('code');
      
      if (hasAuthCode) {
        log.info("Detected auth code in URL, redirecting to callback page");
        navigate("/auth/callback", { replace: true });
        return;
      }
      
      // Check if there are error parameters
      if (urlParams.has('error') || urlParams.has('error_description')) {
        log.info("Detected auth error in URL, redirecting to callback page");
        navigate("/auth/callback", { replace: true });
        return;
      }
      
      log.info("No auth code, hash or params detected, proceeding with normal page load");
    } catch (error) {
      log.error("Error checking for auth redirect:", { error });
    }
  }, [navigate]);
};
