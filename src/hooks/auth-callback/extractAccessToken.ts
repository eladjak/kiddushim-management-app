
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Extracts the access token from the URL hash and processes it
 * @returns boolean indicating success or failure
 */
export const extractAccessToken = async (): Promise<boolean> => {
  const log = logger.createLogger({ component: 'extractAccessToken' });
  let isSuccess = false;
  
  try {
    // Check if there's a hash in the URL
    if (!window.location.hash) {
      log.info("No hash found in URL");
      return false;
    }
    
    // Extract token information from hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const expiresIn = hashParams.get("expires_in");
    const expiresAt = hashParams.get("expires_at");
    const tokenType = hashParams.get("token_type") || "bearer";
    const providerToken = hashParams.get("provider_token");
    
    // Validate essential parameters
    if (!accessToken) {
      log.error("No access_token found in hash");
      return false;
    }
    
    log.info("Found access_token in hash, processing...", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasExpiresIn: !!expiresIn,
      hasExpiresAt: !!expiresAt,
    });
    
    // Build session object
    const session = {
      access_token: accessToken,
      refresh_token: refreshToken || null,
      expires_in: expiresIn ? parseInt(expiresIn, 10) : undefined,
      expires_at: expiresAt ? parseInt(expiresAt, 10) : undefined,
      token_type: tokenType,
      provider_token: providerToken || null,
    };
    
    log.info("Setting session from hash", { sessionProperties: Object.keys(session) });
    
    // Set the session in Supabase auth
    const { data, error } = await supabase.auth.setSession(session);
    
    if (error) {
      log.error("Error setting session from hash", { error });
      return false;
    }
    
    if (data?.session) {
      log.info("Successfully set session from hash", { 
        user: data.session.user.id,
        expires: new Date(data.session.expires_at * 1000).toISOString()
      });
      isSuccess = true;
    } else {
      log.error("No session returned after setting from hash");
    }
    
  } catch (err) {
    log.error("Error extracting access token from hash", { error: err });
  }
  
  return isSuccess;
};
