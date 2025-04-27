
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { getNormalizedDomain } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle OAuth redirects when an auth code or hash is present in the URL
 */
export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'useAuthRedirect' });
  const hashCheckedRef = useRef(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (hashCheckedRef.current || redirectedRef.current) return;
    hashCheckedRef.current = true;
    
    try {
      // IMPORTANT: First priority - If we have a hash with access_token, try to handle it immediately
      if (window.location.hash && window.location.hash.includes('access_token')) {
        log.info("Detected access_token in URL hash, redirecting to auth callback");
        
        redirectedRef.current = true;
        navigate("/auth/callback", { 
          replace: true,
          state: { 
            fullUrl: window.location.href,
            authSource: 'hash_fragment'
          }
        });
        
        return;
      }

      // Check for domain mismatch and redirect if needed
      const currentDomain = window.location.hostname;
      const normalizedDomain = getNormalizedDomain();
      
      // If we're on the wrong domain, redirect to the correct one
      if (currentDomain !== normalizedDomain && currentDomain === 'kidushishi-menegment-app.co.il') {
        // Check if we're already handling this to prevent loops
        const redirectCount = parseInt(sessionStorage.getItem('auth_redirect_count') || '0');
        if (redirectCount > 2) {
          log.error("Detected redirect loop in useAuthRedirect, breaking the cycle");
          sessionStorage.removeItem('auth_redirect_count');
          return;
        }
        
        // Need to redirect to www version for SSL certificate
        const protocol = window.location.protocol;
        const pathname = window.location.pathname;
        const search = window.location.search;
        const hash = window.location.hash;
        const port = window.location.port ? `:${window.location.port}` : '';
        
        redirectedRef.current = true;
        // Store redirect count in sessionStorage
        sessionStorage.setItem('auth_redirect_count', (redirectCount + 1).toString());
        
        const newUrl = `${protocol}//${normalizedDomain}${port}${pathname}${search}${hash}`;
        log.info("Redirecting to normalized domain for SSL certificate", {
          from: currentDomain,
          to: normalizedDomain,
          newUrl
        });
        
        window.location.href = newUrl;
        return;
      }
      
      // Check if there's an auth code in search parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        log.info("Detected auth code in URL, redirecting to callback page");
        redirectedRef.current = true;
        navigate("/auth/callback", { 
          replace: true,
          state: { 
            fullUrl: window.location.href,
            code,
            authSource: 'query'
          }
        });
        return;
      }
      
      // Check for error parameters
      if (urlParams.has('error') || urlParams.has('error_description')) {
        log.info("Detected auth error in URL, redirecting to callback page");
        redirectedRef.current = true;
        navigate("/auth/callback", { 
          replace: true,
          state: { fullUrl: window.location.href, hasError: true }
        });
        return;
      }

      // Check if we were previously redirected from auth
      const wasRedirected = localStorage.getItem('auth_redirect_initiated') === 'true' ||
                          sessionStorage.getItem('auth_redirect_initiated') === 'true';
      const redirectTime = localStorage.getItem('auth_redirect_time') || 
                         sessionStorage.getItem('auth_redirect_time');
      
      if (wasRedirected && redirectTime) {
        // Only consider redirects within the last 5 minutes
        const redirectTimeMs = new Date(redirectTime).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - redirectTimeMs) / (1000 * 60);
        
        if (diffMinutes < 5) {
          log.info("Detected return from auth without visible code, redirecting to callback page");
          
          // Clear the redirect flag
          localStorage.removeItem('auth_redirect_initiated');
          localStorage.removeItem('auth_redirect_time');
          sessionStorage.removeItem('auth_redirect_initiated');
          sessionStorage.removeItem('auth_redirect_time');
          
          redirectedRef.current = true;
          navigate("/auth/callback", { 
            replace: true,
            state: { 
              fullUrl: window.location.href,
              authSource: 'implicit',
              wasRedirected: true
            }
          });
          return;
        } else {
          // Clear stale redirect flags
          localStorage.removeItem('auth_redirect_initiated');
          localStorage.removeItem('auth_redirect_time');
          sessionStorage.removeItem('auth_redirect_initiated');
          sessionStorage.removeItem('auth_redirect_time');
        }
      }
    } catch (error) {
      log.error("Error checking for auth redirect:", { error });
    }
  }, [navigate]);
};
