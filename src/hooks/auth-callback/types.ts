
import { useToast } from "@/hooks/use-toast";

// תיקון: שימוש בסוג החזרה של הפונקציה useToast
export type ToastType = ReturnType<typeof useToast>;
