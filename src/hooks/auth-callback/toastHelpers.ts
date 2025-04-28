
import { ToastType } from "./types";

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
    console.error("Error showing toast:", err);
  }
}
