import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  /** Final value to count toward. This is the source of truth. */
  value: number;
  /** Animation duration in ms. Default: 1200. */
  duration?: number;
  /** Only start once the element has entered the viewport. Default: true. */
  startOnView?: boolean;
}

/**
 * Count-up hook — animates a number from 0 up to `value` (ease-out cubic),
 * then settles on the EXACT `value` passed in (never a rounded intermediate).
 *
 * wow-ui-standard principle 13 (Elad, 17.7.2026), adapted for a React SPA:
 * - The prop `value` is the single source of truth. The displayed number ends
 *   byte-identical to `Math.round(value)` (integers) — no reformatting drift.
 * - Reduced-motion: skipped entirely, the final value shows immediately.
 * - Plays once per mount, on first entry to the viewport (threshold 0 +
 *   rootMargin — the mobile-safe IntersectionObserver settings).
 * - If `value` changes after the first animation (live-refresh), the hook
 *   yields immediately to the new value without re-animating from 0.
 * - No IntersectionObserver support -> the value simply shows at once.
 *
 * @example
 * const { ref, display } = useCountUp<HTMLSpanElement>({ value: 42 });
 * return <span ref={ref} className="num tabular-nums">{display}</span>;
 */
export function useCountUp<T extends HTMLElement = HTMLSpanElement>({
  value,
  duration = 1200,
  startOnView = true,
}: UseCountUpOptions) {
  const ref = useRef<T>(null);
  const [display, setDisplay] = useState<number>(value);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    // Live-refresh: once played, snap straight to any new value (no re-count).
    if (hasPlayedRef.current) {
      setDisplay(value);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced-motion / no-IO / nothing to animate: show the final value now.
    if (prefersReducedMotion || value === 0) {
      hasPlayedRef.current = true;
      setDisplay(value);
      return;
    }

    let rafId = 0;
    let cancelled = false;

    const run = () => {
      hasPlayedRef.current = true;
      const start = performance.now();
      const from = 0;

      const frame = (now: number) => {
        if (cancelled) return;
        const k = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - k, 3); // ease-out cubic
        if (k < 1) {
          setDisplay(Math.round(from + (value - from) * eased));
          rafId = requestAnimationFrame(frame);
        } else {
          setDisplay(value); // settle on the exact source-of-truth value
        }
      };
      rafId = requestAnimationFrame(frame);
    };

    if (!startOnView || typeof IntersectionObserver === "undefined") {
      run();
      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId);
      };
    }

    const el = ref.current;
    if (!el) {
      run();
      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId);
      };
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            obs.unobserve(entry.target);
            run();
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [value, duration, startOnView]);

  return { ref, display };
}
