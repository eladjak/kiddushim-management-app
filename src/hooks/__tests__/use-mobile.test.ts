import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../use-mobile";

describe("useIsMobile", () => {
  let addEventListenerSpy: ReturnType<typeof vi.fn>;
  let removeEventListenerSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addEventListenerSpy = vi.fn();
    removeEventListenerSpy = vi.fn();

    // Mock window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("returns false for desktop-width windows", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true for mobile-width windows (below 768px)", () => {
    Object.defineProperty(window, "innerWidth", { value: 500, writable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("registers matchMedia change listener", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    renderHook(() => useIsMobile());
    expect(addEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("cleans up matchMedia listener on unmount", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("responds to window resize via matchMedia change", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    const { result } = renderHook(() => useIsMobile());

    // Initially desktop
    expect(result.current).toBe(false);

    // Simulate resize to mobile by calling the change handler
    const changeHandler = addEventListenerSpy.mock.calls[0][1];
    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 500, writable: true });
      changeHandler();
    });

    expect(result.current).toBe(true);
  });
});
