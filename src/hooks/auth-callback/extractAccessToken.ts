
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
    
    if (!accessToken) {
      log.error("No access token found in hash");
      return false;
    }
    
    log.info("Extracted access token from hash", {
      tokenLength: accessToken.length,
      hasRefreshToken: !!refreshToken
    });
    
    // Try to set the session with the token
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
    
    if (error) {
      log.error("Error setting session with access token:", { error });
      return false;
    }
    
    if (data.session) {
      log.info("Successfully established session from access token", {
        userId: data.session.user.id,
        provider: data.session.user.app_metadata?.provider
      });
      
      // Clear the hash from the URL
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
