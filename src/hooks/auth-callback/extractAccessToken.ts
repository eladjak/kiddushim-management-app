
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
    log.info("Attempting to extract access token from URL hash");
    
    // Extract the access token
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
    
    log.info("Extracted access token from hash", {
      tokenLength: accessToken.length,
      hasRefreshToken: !!refreshToken,
      hasExpiresIn: !!expiresIn,
      hasProviderToken: !!providerToken,
      tokenType
    });

    // Create a session object with comprehensive data from the hash
    const sessionData = {
      access_token: accessToken,
      refresh_token: refreshToken || '',
      expires_at: expiresAt ? parseInt(expiresAt) : 0,
      expires_in: expiresIn ? parseInt(expiresIn) : 3600,
      provider_token: providerToken || '',
      token_type: tokenType || 'bearer'
    };
    
    // First try to set session using setSession method
    const { data, error } = await supabase.auth.setSession(sessionData);
    
    if (error) {
      log.error("Error setting session with access token (first attempt):", { error });
      
      // Second fallback attempt - try again with just the tokens
      try {
        const simplifiedData = {
          access_token: accessToken,
          refresh_token: refreshToken || '',
        };
        
        const fallbackResult = await supabase.auth.setSession(simplifiedData);
        
        if (fallbackResult.error) {
          log.error("Error in fallback session setting:", { error: fallbackResult.error });
          return false;
        }
        
        if (fallbackResult.data.session) {
          log.info("Successfully established session using fallback method", {
            userId: fallbackResult.data.session.user.id,
            provider: fallbackResult.data.session.user.app_metadata?.provider
          });
          
          // Clear the hash from the URL for security
          if (window.history.replaceState) {
            window.history.replaceState(null, document.title, window.location.pathname);
          }
          
          return true;
        }
      } catch (innerErr) {
        log.error("Error in fallback processing:", { error: innerErr });
      }
      
      return false;
    }
    
    if (data.session) {
      log.info("Successfully established session from access token", {
        userId: data.session.user.id,
        provider: data.session.user.app_metadata?.provider
      });
      
      // Clear the hash from the URL for security
      if (window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
      
      return true;
    }
    
    return false;
  } catch (err) {
    log.error("Error processing access token:", { error: err });
    return false;
  }
}
