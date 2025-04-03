
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { getNormalizedDomain } from "@/integrations/supabase/client";

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
      // Check for domain mismatch
      const currentDomain = window.location.hostname;
      const normalizedDomain = getNormalizedDomain();
      
      // If we're on the wrong domain, redirect to the correct one
      if (currentDomain !== normalizedDomain && currentDomain === 'kidushishi-menegment-app.co.il') {
        // Need to redirect to www version for SSL certificate
        const protocol = window.location.protocol;
        const pathname = window.location.pathname;
        const search = window.location.search;
        const hash = window.location.hash;
        const port = window.location.port ? `:${window.location.port}` : '';
        
        const newUrl = `${protocol}//${normalizedDomain}${port}${pathname}${search}${hash}`;
        log.info("Redirecting to normalized domain for SSL certificate", {
          from: currentDomain,
          to: normalizedDomain,
          newUrl
        });
        
        window.location.href = newUrl;
        return;
      }
      
      // Capture raw URL for debugging
      const fullUrl = window.location.href;
      
      // Check if there's an auth code in search parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        log.info("Detected auth code in URL, redirecting to callback page", { url: fullUrl });
        navigate("/auth/callback", { 
          replace: true,
          state: { 
            fullUrl,
            code,
            authSource: 'query'
          }
        });
        return;
      }
      
      // Check if there's auth code in hash fragment
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashCode = hashParams.get("code");
        
        if (hashCode) {
          log.info("Detected auth code in URL hash, redirecting to callback page", { url: fullUrl });
          navigate("/auth/callback", { 
            replace: true,
            state: { 
              fullUrl,
              code: hashCode,
              authSource: 'hash' 
            }
          });
          return;
        }
      }
      
      // Check for code in path
      if (window.location.pathname.includes('/code=')) {
        const pathCode = window.location.pathname.split('code=')[1];
        if (pathCode) {
          log.info("Detected auth code in path, redirecting to callback page", { url: fullUrl });
          navigate("/auth/callback", { 
            replace: true,
            state: { 
              fullUrl,
              code: pathCode,
              authSource: 'path' 
            }
          });
          return;
        }
      }
      
      // Check if there are error parameters
      if (urlParams.has('error') || urlParams.has('error_description')) {
        log.info("Detected auth error in URL, redirecting to callback page", { url: fullUrl });
        navigate("/auth/callback", { 
          replace: true,
          state: { fullUrl, hasError: true }
        });
        return;
      }
      
      // Check for special path formats (some OAuth providers add the code to the path)
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 2 && 
          pathParts[1] === 'auth' && 
          pathParts[2] !== 'callback' && 
          pathParts[2].length > 20) { // Auth codes are usually long
        log.info("Detected potential auth code in path, redirecting to callback page", { url: fullUrl });
        navigate("/auth/callback", { 
          replace: true,
          state: { 
            fullUrl,
            code: pathParts[2],
            authSource: 'pathComponent' 
          }
        });
        return;
      }

      // Check if we were previously redirected from auth
      const wasRedirected = localStorage.getItem('auth_redirect_initiated') === 'true';
      const redirectTime = localStorage.getItem('auth_redirect_time');
      
      if (wasRedirected && redirectTime) {
        // Only consider redirects within the last 5 minutes
        const redirectTimeMs = new Date(redirectTime).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - redirectTimeMs) / (1000 * 60);
        
        if (diffMinutes < 5) {
          log.info("Detected return from auth without visible code, redirecting to callback page", { 
            redirectTime, 
            diffMinutes 
          });
          
          // Clear the redirect flag
          localStorage.removeItem('auth_redirect_initiated');
          localStorage.removeItem('auth_redirect_time');
          
          navigate("/auth/callback", { 
            replace: true,
            state: { 
              fullUrl,
              authSource: 'implicit',
              wasRedirected: true
            }
          });
          return;
        } else {
          // Clear stale redirect flags
          localStorage.removeItem('auth_redirect_initiated');
          localStorage.removeItem('auth_redirect_time');
        }
      }

      log.info("No auth code, hash or params detected, proceeding with normal page load");
    } catch (error) {
      log.error("Error checking for auth redirect:", { error });
    }
  }, [navigate]);
};
