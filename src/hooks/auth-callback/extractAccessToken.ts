
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

    // Clear the URL hash immediately for security
    clearUrlHash();

    // First approach: Try to directly set the session
    try {
      log.info("Attempting to set session with access token");
      const sessionData = {
        access_token: accessToken,
        refresh_token: refreshToken || undefined,
        expires_in: expiresIn ? parseInt(expiresIn) : undefined,
        expires_at: expiresAt ? parseInt(expiresAt) : undefined,
        provider_token: providerToken || undefined,
        token_type: tokenType || 'bearer'
      };
      
      const { data, error } = await supabase.auth.setSession(sessionData);
      
      if (!error && data.session) {
        log.info("Successfully established session with full data", {
          userId: data.session.user.id,
        });
        return true;
      }
      
      log.warn("Session approach with full data failed", { error });
    } catch (err) {
      log.error("Error in session data approach:", { error: err });
    }
    
    // Second approach: Add small delay before trying again (helps with race conditions)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try with minimal session data
    try {
      const minimalData = {
        access_token: accessToken,
        refresh_token: refreshToken || undefined
      };
      
      const { data, error } = await supabase.auth.setSession(minimalData);
      
      if (!error && data.session) {
        log.info("Successfully established session with minimal data", {
          userId: data.session.user.id, 
        });
        return true;
      }
      
      log.warn("Session approach with minimal data failed", { error });
    } catch (err) {
      log.error("Error in minimal data approach:", { error: err });
    }

    // Third approach: Try OAuth signIn flow with Google
    try {
      if (providerToken) {
        log.info("Attempting Google signin flow with provider token");
        
        // Create a new provider session using signInWithIdToken
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: accessToken,
          access_token: providerToken,
        });
        
        if (!error && data.session) {
          log.info("Successfully established session via signInWithIdToken", {
            userId: data.session.user.id,
          });
          return true;
        }
        
        log.warn("signInWithIdToken flow failed", { error });
      } else {
        log.warn("No provider token available for OAuth flow");
      }
    } catch (err) {
      log.error("Error in OAuth signin flow approach:", { error: err });
    }
    
    // Fourth approach: Try setting auth token directly in storage
    try {
      // Wait a moment before the next attempt
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
      
      // Fifth approach: Try direct exchange with getUser
      try {
        log.info("Attempting direct user verification with token");
        
        // Use the ANON key from environment instead of accessing protected property
        const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        
        // Try to get the user directly with the access token
        const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
        
        if (!userError && userData?.user) {
          log.info("Successfully verified user with token", {
            userId: userData.user.id,
          });
          
          // Try once more with a direct session establishment
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || undefined
          });
          
          if (!sessionError && sessionData?.session) {
            log.info("Successfully established session after user verification", {
              userId: sessionData.session.user.id,
            });
            return true;
          }
          
          log.warn("Session establishment after user verification failed", { error: sessionError });
        } else {
          log.error("User verification failed", { error: userError });
        }
      } catch (err) {
        log.error("Error in direct user verification approach:", { error: err });
      }
      
      // Last attempt: Try exchanging provider token if available
      if (providerToken) {
        try {
          log.info("Attempting to use provider token directly");
          
          // Try a second OAuth approach with provider token
          const { data: oauthData, error: oauthError } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: providerToken,
          });
          
          if (!oauthError && oauthData.session) {
            log.info("Successfully established session using provider token", {
              userId: oauthData.session.user.id,
            });
            return true;
          }
          
          log.error("Provider token approach failed", { error: oauthError });
        } catch (err) {
          log.error("Error using provider token:", { error: err });
        }
      }
      
      // Final check: Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        log.info("Session already exists after all attempts", {
          userId: sessionData.session.user.id,
        });
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
