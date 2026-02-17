import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOnClickOutside } from "../use-click-outside";
import { createRef } from "react";

describe("useOnClickOutside", () => {
  it("calls handler when clicking outside the ref element", () => {
    const handler = vi.fn();
    const ref = createRef<HTMLDivElement>();

    // Create a container element and the "inside" element
    const container = document.createElement("div");
    const inside = document.createElement("div");
    container.appendChild(inside);
    document.body.appendChild(container);

    // Set ref to the inside element
    Object.defineProperty(ref, "current", { value: inside, writable: true });

    renderHook(() => useOnClickOutside(ref, handler));

    // Click outside (on the body, not inside the ref)
    const outsideEvent = new MouseEvent("mousedown", { bubbles: true });
    document.body.dispatchEvent(outsideEvent);

    expect(handler).toHaveBeenCalledTimes(1);

    // Cleanup
    document.body.removeChild(container);
  });

  it("does NOT call handler when clicking inside the ref element", () => {
    const handler = vi.fn();
    const ref = createRef<HTMLDivElement>();

    const element = document.createElement("div");
    document.body.appendChild(element);
    Object.defineProperty(ref, "current", { value: element, writable: true });

    renderHook(() => useOnClickOutside(ref, handler));

    // Click inside the ref element
    const insideEvent = new MouseEvent("mousedown", { bubbles: true });
    element.dispatchEvent(insideEvent);

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it("does not call handler when ref.current is null", () => {
    const handler = vi.fn();
    const ref = createRef<HTMLDivElement>();
    // ref.current is null by default

    renderHook(() => useOnClickOutside(ref, handler));

    const event = new MouseEvent("mousedown", { bubbles: true });
    document.body.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it("removes event listeners on unmount", () => {
    const handler = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const element = document.createElement("div");
    document.body.appendChild(element);
    Object.defineProperty(ref, "current", { value: element, writable: true });

    const removeSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useOnClickOutside(ref, handler));
    unmount();

    // Should have called removeEventListener for both mousedown and touchstart
    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchstart", expect.any(Function));

    removeSpy.mockRestore();
    document.body.removeChild(element);
  });
});
