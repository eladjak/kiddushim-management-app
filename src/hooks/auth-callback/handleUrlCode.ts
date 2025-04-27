
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { ToastType } from "./types";
import { handleAuthCode } from "./handleAuthCode";

/**
 * Try to extract auth code from URL params
 */
export async function handleUrlCode(
  navigate: NavigateFunction,
  toastHelper: ToastType
): Promise<boolean> {
  const log = logger.createLogger({ component: 'handleUrlCode' });
  
  try {
    log.info("Checking for auth code in URL params");
    
    // Check for code in URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const urlCode = searchParams.get('code');
    
    if (urlCode && urlCode.length > 10) {
      log.info("Found code in URL params", { 
        codeLength: urlCode.length 
      });
      
      try {
        return await handleAuthCode(urlCode, 'url_params', navigate, toastHelper);
      } catch (error) {
        log.error("Error handling URL code:", { error });
        // ממשיך לבדוק אפשרויות אחרות אם נכשל
      }
    }
    
    // בדיקה האם יש קוד בפרגמנט (שמתחיל ב-#)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashCode = hashParams.get('code');
      
      if (hashCode && hashCode.length > 10) {
        log.info("Found code in URL hash", { 
          codeLength: hashCode.length 
        });
        
        try {
          return await handleAuthCode(hashCode, 'url_hash', navigate, toastHelper);
        } catch (error) {
          log.error("Error handling hash code:", { error });
        }
      }
    }
    
    // No code found in URL
    log.info("No auth code found in URL");
    return false;
  } catch (err) {
    log.error("Error in handleUrlCode:", { error: err });
    throw err;
  }
}
