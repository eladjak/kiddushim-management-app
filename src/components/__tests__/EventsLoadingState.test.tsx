import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventsLoadingState } from "../events/EventsLoadingState";
import { ReportsLoading } from "../reports/ReportsLoading";

describe("EventsLoadingState", () => {
  it("renders with role=status for accessibility", () => {
    const { container } = render(<EventsLoadingState />);
    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toBeInTheDocument();
  });

  it("has screen-reader-only loading text", () => {
    render(<EventsLoadingState />);
    const srText = screen.getByText("טוען אירועים...");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass("sr-only");
  });

  it("renders skeleton placeholder elements", () => {
    const { container } = render(<EventsLoadingState />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("ReportsLoading", () => {
  it("renders with role=status for accessibility", () => {
    const { container } = render(<ReportsLoading />);
    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toBeInTheDocument();
  });

  it("has screen-reader-only loading text", () => {
    render(<ReportsLoading />);
    const srText = screen.getByText("טוען דיווחים...");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass("sr-only");
  });

  it("renders skeleton grid placeholder elements", () => {
    const { container } = render(<ReportsLoading />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
