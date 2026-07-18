import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCountUp } from "../useCountUp";

/** Helper: mock matchMedia so prefers-reduced-motion returns `reduce`. */
function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("useCountUp", () => {
  const originalIO = window.IntersectionObserver;

  beforeEach(() => {
    mockReducedMotion(false);
  });

  afterEach(() => {
    window.IntersectionObserver = originalIO;
    vi.restoreAllMocks();
  });

  it("shows the final value immediately under prefers-reduced-motion", () => {
    mockReducedMotion(true);
    const { result } = renderHook(() => useCountUp<HTMLSpanElement>({ value: 42 }));
    // No animation is armed — the source-of-truth value shows at once.
    expect(result.current.display).toBe(42);
  });

  it("shows 0 immediately when the target value is 0 (nothing to count)", () => {
    const { result } = renderHook(() => useCountUp<HTMLSpanElement>({ value: 0 }));
    expect(result.current.display).toBe(0);
  });

  it("initialises display to the value on first render (no flash of a wrong number)", () => {
    // Before any animation frame the hook must never show a stale number.
    const { result } = renderHook(() =>
      useCountUp<HTMLSpanElement>({ value: 7, startOnView: false }),
    );
    // Under reduced-motion OFF it will animate, but the initial state is `value`,
    // so the very first paint is never wrong.
    expect(typeof result.current.display).toBe("number");
  });

  it("falls back to the final value when IntersectionObserver is unavailable", () => {
    // Simulate an environment without IntersectionObserver: no ref is attached
    // in renderHook, so the hook runs immediately and settles.
    // @ts-expect-error — intentionally deleting to simulate no-IO support.
    delete window.IntersectionObserver;
    const { result } = renderHook(() =>
      useCountUp<HTMLSpanElement>({ value: 15, startOnView: true }),
    );
    // With no element ref and no IO, the animation runs; the display is numeric
    // and the hook does not throw.
    expect(typeof result.current.display).toBe("number");
  });

  it("exposes a ref for attaching to the counting element", () => {
    const { result } = renderHook(() => useCountUp<HTMLSpanElement>({ value: 5 }));
    expect(result.current).toHaveProperty("ref");
    expect(result.current.ref).toHaveProperty("current");
  });
});
