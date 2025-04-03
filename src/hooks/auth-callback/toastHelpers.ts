
import { ToastType } from "./types";

/**
 * Display a toast message
 */
export function showToast(toast: ToastType, description: string): void {
  toast.toast({ description });
}
