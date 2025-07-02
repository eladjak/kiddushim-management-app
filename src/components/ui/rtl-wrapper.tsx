import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RTLWrapperProps {
  children: ReactNode;
  className?: string;
}

export const RTLWrapper = ({ children, className }: RTLWrapperProps) => {
  return (
    <div dir="rtl" className={cn("text-right", className)}>
      {children}
    </div>
  );
};