import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  // ──────────── Rendering ────────────

  it("renders the title text", () => {
    render(<EmptyState title="אין אירועים" />);
    expect(screen.getByText("אין אירועים")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <EmptyState
        title="אין אירועים"
        description="צור אירוע חדש כדי להתחיל"
      />,
    );
    expect(screen.getByText("צור אירוע חדש כדי להתחיל")).toBeInTheDocument();
  });

  it("does not render description paragraph when not provided", () => {
    const { container } = render(<EmptyState title="אין אירועים" />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(0);
  });

  it("sets role='status' and aria-label with the title", () => {
    render(<EmptyState title="אין תוצאות" />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("aria-label", "אין תוצאות");
  });

  // ──────────── Illustrations ────────────

  it("renders the default 'general' illustration SVG", () => {
    const { container } = render(<EmptyState title="ריק" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the 'events' illustration", () => {
    const { container } = render(
      <EmptyState title="אין אירועים" illustration="events" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Events illustration has calendar rings (rect elements at specific positions)
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBeGreaterThan(0);
  });

  it("renders the 'reports' illustration", () => {
    const { container } = render(
      <EmptyState title="אין דוחות" illustration="reports" />,
    );
    // Reports illustration has a checkmark circle
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThan(0);
  });

  it("renders the 'users' illustration", () => {
    const { container } = render(
      <EmptyState title="אין משתמשים" illustration="users" />,
    );
    // Users illustration has 3 person circles
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThanOrEqual(3);
  });

  it("renders the 'search' illustration", () => {
    const { container } = render(
      <EmptyState title="אין תוצאות חיפוש" illustration="search" />,
    );
    // Search illustration has a magnifying glass circle and handle line
    const circles = container.querySelectorAll("circle");
    const lines = container.querySelectorAll("line");
    expect(circles.length).toBeGreaterThan(0);
    expect(lines.length).toBeGreaterThan(0);
  });

  // ──────────── Action Button ────────────

  it("renders the action button when actionLabel and onAction are provided", () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="אין אירועים"
        actionLabel="צור אירוע"
        onAction={handleAction}
      />,
    );

    const button = screen.getByText("צור אירוע");
    expect(button).toBeInTheDocument();
  });

  it("calls onAction when the action button is clicked", () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="אין אירועים"
        actionLabel="צור אירוע"
        onAction={handleAction}
      />,
    );

    fireEvent.click(screen.getByText("צור אירוע"));
    expect(handleAction).toHaveBeenCalledOnce();
  });

  it("does not render action button when only actionLabel is provided (no onAction)", () => {
    render(<EmptyState title="אין אירועים" actionLabel="צור אירוע" />);
    expect(screen.queryByText("צור אירוע")).not.toBeInTheDocument();
  });

  // ──────────── Children ────────────

  it("renders children below the description", () => {
    render(
      <EmptyState title="אין אירועים">
        <span data-testid="custom-child">תוכן נוסף</span>
      </EmptyState>,
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.getByText("תוכן נוסף")).toBeInTheDocument();
  });
});
