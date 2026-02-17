import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipToContent } from "../navigation/SkipToContent";

describe("SkipToContent", () => {
  it("renders a skip link", () => {
    render(<SkipToContent />);
    const link = screen.getByText("דלג לתוכן הראשי");
    expect(link).toBeInTheDocument();
  });

  it("links to #main-content", () => {
    render(<SkipToContent />);
    const link = screen.getByText("דלג לתוכן הראשי");
    expect(link.getAttribute("href")).toBe("#main-content");
  });

  it("has sr-only class for screen reader accessibility", () => {
    render(<SkipToContent />);
    const link = screen.getByText("דלג לתוכן הראשי");
    expect(link.className).toContain("sr-only");
  });

  it("is a link element (a tag)", () => {
    render(<SkipToContent />);
    const link = screen.getByText("דלג לתוכן הראשי");
    expect(link.tagName).toBe("A");
  });
});
