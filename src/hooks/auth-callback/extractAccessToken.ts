
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

    // Direct approach: Try to directly set the session with the token
    try {
      log.info("Attempting to set session with access token");
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
      
      log.warn("Session approach with full data failed", { error });
    } catch (err) {
      log.error("Error in session data approach:", { error: err });
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
      
      log.warn("Session approach with minimal data failed", { error });
    } catch (err) {
      log.error("Error in minimal data approach:", { error: err });
    }

    // Third approach: Try OAuth signInWithOAuth flow
    try {
      log.info("Attempting OAuth signin flow with token");
      
      // Create a new OAuth provider session
      if (providerToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: accessToken,
          access_token: providerToken,
        });
        
        if (!error && data.session) {
          log.info("Successfully established session via signInWithIdToken", {
            userId: data.session.user.id,
          });
          clearUrlHash();
          return true;
        }
        
        log.warn("OAuth signin flow failed", { error });
      }
    } catch (err) {
      log.error("Error in OAuth signin flow approach:", { error: err });
    }
    
    // Fourth approach: Try setting auth token directly
    try {
      // Wait a moment before the third attempt (sometimes helps with timing issues)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force the token to be updated in local storage
      const localStorageKey = getSupabaseStorageKey();
      if (localStorageKey && accessToken) {
        try {
          // Try to directly update the token in storage
          const storage = getSupabaseStorage();
          if (storage) {
            const rawData = storage.getItem(localStorageKey);
            if (rawData) {
              // Try to parse existing token
              const existingData = JSON.parse(rawData);
              // Modify it with our new token
              existingData.access_token = accessToken;
              if (refreshToken) existingData.refresh_token = refreshToken;
              // Save it back
              storage.setItem(localStorageKey, JSON.stringify(existingData));
              log.info("Modified existing auth token in storage");
            } else {
              // Create new data
              const newData = {
                access_token: accessToken,
                refresh_token: refreshToken || null,
                expires_at: expiresAt ? parseInt(expiresAt) : Math.floor(Date.now() / 1000) + 3600,
                expires_in: expiresIn ? parseInt(expiresIn) : 3600,
                token_type: tokenType || 'bearer',
                provider_token: providerToken || null,
              };
              storage.setItem(localStorageKey, JSON.stringify(newData));
              log.info("Created new auth token in storage");
            }
            
            // Force refresh the session
            const refreshResult = await supabase.auth.refreshSession();
            if (!refreshResult.error && refreshResult.data.session) {
              log.info("Successfully established session via storage modification + refresh", {
                userId: refreshResult.data.session.user.id,
              });
              clearUrlHash();
              return true;
            } else {
              log.warn("Session refresh after storage modification failed", { 
                error: refreshResult.error 
              });
            }
          }
        } catch (err) {
          log.error("Error updating token in storage:", { error: err });
        }
      }
      
      // Last-ditch attempt: Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        log.info("Session already exists after all attempts", {
          userId: sessionData.session.user.id,
        });
        clearUrlHash();
        return true;
      }
    } catch (err) {
      log.error("Error in final approach:", { error: err });
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

/**
 * Attempt to get the Supabase storage key
 */
function getSupabaseStorageKey(): string | null {
  try {
    // Try to find it in localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('supabase.auth.token') || 
        key.includes('kidushishi-auth-token')
      )) {
        return key;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Get the storage method used by Supabase
 */
function getSupabaseStorage(): Storage | null {
  try {
    // Try localStorage first
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
    return null;
  } catch (e) {
    return null;
  }
}
