
import { useToast as useShadcnToast, toast as shadcnToast, type ToastProps } from "@/components/ui/toast";

export const useToast = useShadcnToast;
export const toast = shadcnToast;

export type Toast = ToastProps;
