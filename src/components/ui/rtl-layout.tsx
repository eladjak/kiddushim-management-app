import { ReactNode, ButtonHTMLAttributes, HTMLAttributes } from "react";
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

interface RTLButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

// Helper for consistent RTL button layouts
export const RTLButton = ({ children, className, ...props }: RTLButtonProps) => {
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

interface RTLFlexProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// Helper for RTL flex containers
export const RTLFlex = ({ children, className, ...props }: RTLFlexProps) => {
  return (
    <div
      {...props}
      className={cn("flex flex-row-reverse", className)}
    >
      {children}
    </div>
  );
};
