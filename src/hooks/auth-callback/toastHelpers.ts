
import { ToastType } from "./types";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'toastHelpers' });

/**
 * הצגת הודעה למשתמש
 */
export function showToast(toastHelper: ToastType, message: string, isError: boolean = false) {
  try {
    if (isError) {
      toastHelper.toast({
        variant: "destructive",
        description: message,
      });
    } else {
      toastHelper.toast({
        description: message,
      });
    }
  } catch (err) {
    log.error("Error showing toast:", { error: err });
  }
}
