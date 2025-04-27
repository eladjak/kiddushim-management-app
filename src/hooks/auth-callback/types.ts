
// Import the useToast hook
import { useToast } from "@/hooks/use-toast";

// Define the ToastType to be the entire return object from useToast
export type ToastType = ReturnType<typeof useToast>;
