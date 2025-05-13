
import { useToast as useShadcnToast } from "@/components/ui/use-toast";
import { toast as shadcnToast } from "@/components/ui/use-toast";

export const useToast = useShadcnToast;
export const toast = shadcnToast;

export type { Toast } from "@/components/ui/use-toast";
