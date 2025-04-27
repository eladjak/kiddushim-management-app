
// Import the useToast hook
import { useToast } from "@/hooks/use-toast";

// Define the ToastType to be the entire return object from useToast
export type ToastType = ReturnType<typeof useToast>;

// Define a more specific type for showing toasts
export type ToastFunction = (props: { description: string }) => void;
