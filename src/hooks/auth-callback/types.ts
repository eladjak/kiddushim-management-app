
// Import the toast function itself instead of a type that doesn't exist
import { useToast } from "@/hooks/use-toast";

export type ToastType = ReturnType<typeof useToast>;
