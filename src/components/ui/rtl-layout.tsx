import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RTLLayoutProps {
  children: ReactNode;
  className?: string;
  enableRTL?: boolean;
}

export const RTLLayout = ({ children, className, enableRTL = true }: RTLLayoutProps) => {
  return (
    <div 
      dir={enableRTL ? "rtl" : "ltr"} 
      className={cn(
        enableRTL && "text-right [&_.flex]:flex-row-reverse [&_.space-x-*]:space-x-reverse",
        className
      )}
    >
      {children}
    </div>
  );
};

// Helper for consistent RTL button layouts
export const RTLButton = ({ children, className, ...props }: any) => {
  return (
    <button 
      {...props}
      className={cn(
        "[&>svg]:ml-2 [&>svg]:mr-0 [&>span+svg]:mr-2 [&>span+svg]:ml-0",
        className
      )}
    >
      {children}
    </button>
  );
};

// Helper for RTL flex containers
export const RTLFlex = ({ children, className, ...props }: any) => {
  return (
    <div 
      {...props}
      className={cn("flex flex-row-reverse", className)}
    >
      {children}
    </div>
  );
};