import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with a fade-in-up entrance animation.
 * Respects `prefers-reduced-motion` via the Tailwind animation which
 * is disabled in animations.css under that media query.
 */
export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <div className={`animate-fade-in-up ${className}`}>
      {children}
    </div>
  );
};
