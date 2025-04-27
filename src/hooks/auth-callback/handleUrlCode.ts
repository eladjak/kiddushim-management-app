
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { handleAuthCode } from "./handleAuthCode";

/**
 * Handle authentication code from URL parameters
 */
export async function handleUrlCode(
  navigate: NavigateFunction,
  toast: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleUrlCode' });
  
  // Check for an auth code in URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get("code");
  
  if (authCode && authCode.length > 10) {
    log.info("Found auth code in URL parameters", { codeLength: authCode.length });
    
    try {
      const result = await handleAuthCode(authCode, "url_parameters", navigate, toast);
      return result;
    } catch (err) {
      log.error("Error processing URL auth code:", { error: err });
      throw err;
    }
  }
  
  return false;
}
