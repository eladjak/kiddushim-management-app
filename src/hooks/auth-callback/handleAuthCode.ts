
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { showToast } from "./toastHelpers";

/**
 * Handle authentication with an auth code
 */
export async function handleAuthCode(
  code: string,
  source: string,
  navigate: NavigateFunction,
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleAuthCode' });
  
  try {
    log.info("Exchanging auth code for session", { 
      codeSource: source, 
      codeLength: code.length 
    });
    
    // Fix code if it has spaces instead of + signs
    const fixedCode = code.replace(/ /g, '+');
    
    // Get code verifier from localStorage instead of sessionStorage
    const codeVerifier = localStorage.getItem('supabase-code-verifier');
    
    // Check when the code verifier was created (to prevent using old ones)
    const verifierTimestamp = localStorage.getItem('code-verifier-timestamp');
    const isVerifierRecent = verifierTimestamp && 
      (Date.now() - parseInt(verifierTimestamp, 10)) < 5 * 60 * 1000; // 5 minutes
    
    log.info("Code verifier status:", { 
      hasCodeVerifier: !!codeVerifier,
      verifierLength: codeVerifier?.length,
      isVerifierRecent
    });
    
    // Try with PKCE if we have a recent verifier
    if (codeVerifier && isVerifierRecent) {
      log.info("Attempting PKCE code exchange with verifier");
      
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
        
        if (error) {
          log.error("Error exchanging code for session with PKCE:", { error, source });
          // Continue to non-PKCE attempt
        } else if (data.session) {
          log.info("Successfully exchanged code for session with PKCE", { 
            userId: data.session.user.id, 
            source 
          });
          
          // Success! Show message and clean up
          showToast(toastHelper, "התחברת בהצלחה");
          clearAuthStorageItems();
          
          // Navigate home
          setTimeout(() => {
            log.info("Redirecting to home after successful PKCE code exchange");
            navigate("/", { replace: true });
          }, 300);
          
          return true;
        }
      } catch (pkceError) {
        log.error("Exception during PKCE code exchange:", { error: pkceError });
      }
    }
    
    // If PKCE failed or wasn't available, try non-PKCE exchange
    log.info("Attempting non-PKCE code exchange as fallback");
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(fixedCode);
      
      if (error) {
        log.error("Error in non-PKCE code exchange:", { error });
        return false;
      }
      
      if (data.session) {
        log.info("Successfully exchanged code with non-PKCE method", { 
          userId: data.session.user.id, 
          source 
        });
        
        // Success! Show message and clean up
        showToast(toastHelper, "התחברת בהצלחה");
        clearAuthStorageItems();
        
        // Navigate home
        setTimeout(() => {
          log.info("Redirecting to home after successful non-PKCE code exchange");
          navigate("/", { replace: true });
        }, 300);
        
        return true;
      }
    } catch (nonPkceError) {
      log.error("Exception in non-PKCE code exchange:", { error: nonPkceError });
    }
    
    // If we got here, both methods failed
    log.error("All code exchange methods failed", { source });
    return false;
  } catch (err) {
    log.error("Error in handleAuthCode:", { error: err, source });
    throw err;
  }
}

// Helper to clean up all auth-related storage items
function clearAuthStorageItems() {
  try {
    localStorage.removeItem('supabase-code-verifier');
    localStorage.removeItem('code-verifier-timestamp');
    localStorage.removeItem('auth_redirect_initiated');
    localStorage.removeItem('auth_redirect_time');
    localStorage.removeItem('auth_redirect_count');
    localStorage.removeItem('auth_provider');
  } catch (e) {
    console.warn("Error clearing auth storage items:", e);
  }
}
