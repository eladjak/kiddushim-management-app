import { useEffect, useRef, useCallback } from "react";

interface UseAnimateOnScrollOptions {
  /** Percentage of element visible before triggering (0-1). Default: 0.1 */
  threshold?: number;
  /** Margin around root element. Default: "0px 0px -50px 0px" */
  rootMargin?: string;
  /** Only animate the first time element enters viewport. Default: true */
  once?: boolean;
}

/**
 * Hook that adds the `.visible` class to an element when it enters the viewport.
 * Pair with the `.animate-on-scroll` CSS class for scroll-triggered animations.
 *
 * @example
 * ```tsx
 * const ref = useAnimateOnScroll<HTMLDivElement>();
 * return <div ref={ref} className="animate-on-scroll">Content</div>;
 * ```
 */
export function useAnimateOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseAnimateOnScrollOptions = {},
) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", once = true } = options;
  const elementRef = useRef<T>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          entry.target.classList.remove("visible");
        }
      }
    },
    [once],
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      element.classList.add("visible");
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, handleIntersection]);

  return elementRef;
}
