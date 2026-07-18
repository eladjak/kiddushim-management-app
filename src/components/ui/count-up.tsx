import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface CountUpProps {
  /** The final number to count toward — the source of truth. */
  value: number;
  /** Animation duration in ms. Default: 1200. */
  duration?: number;
  className?: string;
}

/**
 * Displays a number with a one-shot count-up animation on first view.
 * Additive, drop-in replacement for a bare `{value}` in a stat card.
 *
 * Uses tabular-nums so counting digits don't shift the layout (wow-ui-standard
 * principle 11 + 13). Reduced-motion is handled inside useCountUp — the value
 * shows immediately with zero animation.
 */
export const CountUp = ({ value, duration, className }: CountUpProps) => {
  const { ref, display } = useCountUp<HTMLSpanElement>({ value, duration });
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  );
};
