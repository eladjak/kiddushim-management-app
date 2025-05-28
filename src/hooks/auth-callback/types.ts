
import { useToast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";

// תיקון: שימוש בסוג החזרה של הפונקציה useToast
export type ToastType = ReturnType<typeof useToast>;

export interface AuthCallbackContext {
  navigate: NavigateFunction;
  toastHelper: ToastType;
}

export interface AuthProcessResult {
  success: boolean;
  source?: string;
}
