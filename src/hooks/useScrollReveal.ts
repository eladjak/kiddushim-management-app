import { useEffect, useRef } from "react";

interface UseScrollRevealOptions {
  /**
   * Bidirectional: fade back out when the element leaves through the TOP.
   * Ignored entirely under reduced-motion. Default: false (reveal once).
   */
  bidirectional?: boolean;
  /** Margin around the viewport root. Default: "0px 0px -10% 0px". */
  rootMargin?: string;
}

/**
 * Scroll-reveal hook — wow-ui-standard principle 3 (Elad, 17.7.2026),
 * adapted for a React SPA. Sibling of the existing `useAnimateOnScroll`
 * (which the landing page uses); this variant follows the battle-tested
 * mobile-safe rules and is used across the authenticated app.
 *
 * Encoded rules:
 * - threshold: 0 + rootMargin — NEVER threshold: 0.15. A tall section on a
 *   small mobile viewport may never reach 15% visibility and would never
 *   reveal. threshold 0 + bottom rootMargin fires reliably.
 * - Base state = final VISIBLE state. The `.wow-reveal` (hidden) class is
 *   added at runtime by this hook, so no-JS users and reduced-motion users
 *   see the content immediately.
 * - The IntersectionObserver root is ALWAYS the viewport (null).
 * - Reduced-motion: nothing is armed at all (JS belt of the triple-belt).
 * - No IntersectionObserver support -> content simply stays visible.
 *
 * @example
 * const ref = useScrollReveal<HTMLDivElement>();
 * return <div ref={ref}>Content</div>;   // no static hidden class in markup
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {},
) {
  const { bidirectional = false, rootMargin = "0px 0px -10% 0px" } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // JS belt: bail before arming anything under reduced-motion / no support.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      return; // content stays in its visible base state
    }

    // Only NOW hide it — the markup shipped it visible (no-JS / RM safe).
    el.classList.add("wow-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target;
          if (entry.isIntersecting) {
            target.classList.add("in");
            target.classList.remove("out-up");
          } else if (bidirectional) {
            const rootTop = entry.rootBounds ? entry.rootBounds.top : 0;
            if (entry.boundingClientRect.top < rootTop) {
              // Left through the TOP -> fade upward.
              target.classList.remove("in");
              target.classList.add("out-up");
            } else {
              // Left through the BOTTOM -> reset to pre-entrance state.
              target.classList.remove("in", "out-up");
            }
          }
        }
      },
      { threshold: 0, rootMargin, root: null },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      // Restore visible base state on unmount so a re-mount never flashes hidden.
      el.classList.remove("wow-reveal", "in", "out-up");
    };
  }, [bidirectional, rootMargin]);

  return ref;
}
