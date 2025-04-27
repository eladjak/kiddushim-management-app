
import { ToastType } from "./types";

/**
 * Display a toast message
 */
export function showToast(toastHelper: ToastType, description: string): void {
  toastHelper.toast({ description });
}
