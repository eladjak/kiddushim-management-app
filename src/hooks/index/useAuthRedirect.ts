
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
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (hashCheckedRef.current || redirectedRef.current) return;
    hashCheckedRef.current = true;
    
    try {
      // If we have a hash with access_token, redirect to auth callback
      if (window.location.hash && window.location.hash.includes('access_token')) {
        log.info("Detected access_token in URL hash, redirecting to auth callback");
        
        // Set redirect flag
        redirectedRef.current = true;
        
        // Send to auth callback page
        navigate("/auth/callback", { 
          replace: true,
          state: { 
            fullUrl: window.location.href,
            authSource: 'hash_fragment'
          }
        });
        
        return;
      }

      // Check if we need to redirect to www subdomain
      const currentDomain = window.location.hostname;
      const normalizedDomain = getNormalizedDomain();
      
      if (currentDomain !== normalizedDomain && currentDomain === 'kidushishi-menegment-app.co.il') {
        // Check for redirect loops
        const redirectCount = parseInt(sessionStorage.getItem('auth_redirect_count') || '0');
        if (redirectCount > 2) {
          log.error("Detected redirect loop in useAuthRedirect, breaking the cycle");
          sessionStorage.removeItem('auth_redirect_count');
          return;
        }
        
        // Redirect to www version for SSL certificate
        const protocol = window.location.protocol;
        const pathname = window.location.pathname;
        const search = window.location.search;
        const hash = window.location.hash;
        
        // Set redirect flag to prevent further redirects
        redirectedRef.current = true;
        sessionStorage.setItem('auth_redirect_count', (redirectCount + 1).toString());
        
        // Build the normalized URL
        const newUrl = `${protocol}//${normalizedDomain}${pathname}${search}${hash}`;
        log.info("Redirecting to normalized domain for SSL certificate", {
          from: currentDomain,
          to: normalizedDomain,
          newUrl
        });
        
        window.location.href = newUrl;
        return;
      }
      
      // Check for auth code in search parameters
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

      // Check for implicit auth redirects from OAuth providers
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
          log.info("Detected recent OAuth redirect, redirecting to callback");
          
          // Clear the redirect flag
          localStorage.removeItem('auth_redirect_initiated');
          localStorage.removeItem('auth_redirect_time');
          sessionStorage.removeItem('auth_redirect_initiated');
          sessionStorage.removeItem('auth_redirect_time');
          
          // Force redirect to callback page
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
