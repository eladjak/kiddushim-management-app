
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Extract access token from URL hash for implicit flow
 * Improved for better compatibility and error handling
 */
export async function extractAccessToken(): Promise<boolean> {
  const log = logger.createLogger({ component: 'extractAccessToken' });
  
  try {
    log.info("Attempting to extract access token from URL hash");
    
    // Verify we have a hash in the URL
    if (!window.location.hash || !window.location.hash.includes('access_token')) {
      log.info("No access token found in URL hash");
      return false;
    }
    
    // Try to extract the hash params
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1) // Remove the leading '#'
    );
    
    // Get the tokens
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (!accessToken) {
      log.error("Hash exists but no valid access token found");
      return false;
    }
    
    log.info("Access token found in hash, attempting to set session");
    
    // Set the session using the tokens
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });
      
      if (error) {
        log.error("Error setting session:", error);
        return false;
      }
      
      if (data.session) {
        log.info("Successfully set session from access token", {
          userId: data.session.user.id,
          expiresAt: data.session.expires_at
        });
        
        return true;
      }
    } catch (setSessionError) {
      log.error("Exception setting session:", setSessionError);
      
      // Plan B: Try using the getUser API as an alternative
      try {
        const { data, error } = await supabase.auth.getUser(accessToken);
        if (error) {
          log.error("Error getting user with access token:", error);
          return false;
        }
        
        if (data.user) {
          log.info("Successfully fetched user with access token", {
            userId: data.user.id
          });
          
          // Try to manually re-apply the session approach
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            log.info("Successfully set session on second attempt");
            return true;
          } catch (secondError) {
            log.error("Second attempt to set session failed:", secondError);
          }
        }
      } catch (getUserError) {
        log.error("Error in getUser fallback:", getUserError);
      }
    }
    
    log.error("Failed to process access token after all attempts");
    return false;
  } catch (err) {
    log.error("Unexpected error extracting access token:", err);
    return false;
  }
}
