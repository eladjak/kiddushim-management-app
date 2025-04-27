import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Extracts and handles access token from URL hash
 */
export async function extractAccessToken(): Promise<boolean> {
  const log = logger.createLogger({ component: 'extractAccessToken' });

  if (!window.location.hash || !window.location.hash.includes('access_token')) {
    return false;
  }
  
  try {
    log.info("Processing access token from URL hash");
    
    // Extract the access token and all other parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const expiresIn = hashParams.get('expires_in');
    const expiresAt = hashParams.get('expires_at');
    const providerToken = hashParams.get('provider_token');
    const tokenType = hashParams.get('token_type');
    
    if (!accessToken) {
      log.error("No access token found in hash");
      return false;
    }
    
    log.info("Processing token data", {
      tokenLength: accessToken.length,
      hasRefreshToken: !!refreshToken,
      hasExpiresIn: !!expiresIn,
      hasProviderToken: !!providerToken,
      tokenType
    });

    // We'll try three different approaches to set the session

    // First approach: Try with full session data
    try {
      const sessionData = {
        access_token: accessToken,
        refresh_token: refreshToken || null,
        expires_in: expiresIn ? parseInt(expiresIn) : undefined,
        expires_at: expiresAt ? parseInt(expiresAt) : undefined,
        provider_token: providerToken || null,
        token_type: tokenType || 'bearer'
      };
      
      const { data, error } = await supabase.auth.setSession(sessionData);
      
      if (!error && data.session) {
        log.info("Successfully established session with full data", {
          userId: data.session.user.id,
        });
        clearUrlHash();
        return true;
      }
      
      log.warn("First attempt with full session data failed", { error });
    } catch (err) {
      log.error("Error in first approach:", { error: err });
    }
    
    // Second approach: Try with minimal session data
    try {
      const minimalData = {
        access_token: accessToken,
        refresh_token: refreshToken || null
      };
      
      const { data, error } = await supabase.auth.setSession(minimalData);
      
      if (!error && data.session) {
        log.info("Successfully established session with minimal data", {
          userId: data.session.user.id,
        });
        clearUrlHash();
        return true;
      }
      
      log.warn("Second attempt with minimal session data failed", { error });
    } catch (err) {
      log.error("Error in second approach:", { error: err });
    }
    
    // Third approach: Try setting auth token directly
    try {
      // Wait a moment before the third attempt (sometimes helps with timing issues)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Access local storage directly as a last resort
      const storageKey = localStorage.getItem('supabase.auth.token');
      if (storageKey) {
        try {
          // Try to parse existing token
          const existingData = JSON.parse(storageKey);
          // Modify it with our new token
          existingData.access_token = accessToken;
          if (refreshToken) existingData.refresh_token = refreshToken;
          // Save it back
          localStorage.setItem('supabase.auth.token', JSON.stringify(existingData));
          log.info("Modified existing auth token in storage");
        } catch (err) {
          log.error("Error updating existing token:", { error: err });
        }
      }
      
      // Force refresh the session
      const refreshResult = await supabase.auth.refreshSession();
      if (!refreshResult.error && refreshResult.data.session) {
        log.info("Successfully established session via refresh", {
          userId: refreshResult.data.session.user.id,
        });
        clearUrlHash();
        return true;
      }
    } catch (err) {
      log.error("Error in third approach:", { error: err });
    }
    
    log.error("All approaches to establish session failed");
    return false;
  } catch (err) {
    log.error("Unexpected error processing access token:", { error: err });
    return false;
  }
}

/**
 * Clears the URL hash for security
 */
function clearUrlHash() {
  if (window.history.replaceState) {
    window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }
}
