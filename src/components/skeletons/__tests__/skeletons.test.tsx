import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCardSkeleton, EventsListSkeleton } from "../EventCardSkeleton";
import { ReportCardSkeleton, ReportsGridSkeleton, ReportsTableSkeleton } from "../ReportCardSkeleton";
import { QuickActionSkeleton, UpcomingEventSkeleton, DashboardSkeleton } from "../DashboardSkeleton";
import { UsersTableSkeleton } from "../UsersTableSkeleton";

describe("Skeleton Components", () => {
  it("renders EventCardSkeleton without errors", () => {
    const { container } = render(<EventCardSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders EventsListSkeleton with multiple cards", () => {
    const { container } = render(<EventsListSkeleton />);
    // Should render 2 month groups with 4 cards each = 8 cards
    const skeletonCards = container.querySelectorAll(".border.rounded-xl");
    expect(skeletonCards.length).toBe(8);
  });

  it("renders ReportCardSkeleton without errors", () => {
    const { container } = render(<ReportCardSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders ReportsGridSkeleton with 6 cards", () => {
    const { container } = render(<ReportsGridSkeleton />);
    const cards = container.querySelectorAll(".border.rounded-lg");
    expect(cards.length).toBe(6);
  });

  it("renders ReportsTableSkeleton with header and rows", () => {
    const { container } = render(<ReportsTableSkeleton />);
    const rows = container.querySelectorAll(".border-t");
    expect(rows.length).toBe(5);
  });

  it("renders QuickActionSkeleton without errors", () => {
    const { container } = render(<QuickActionSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders UpcomingEventSkeleton without errors", () => {
    const { container } = render(<UpcomingEventSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders DashboardSkeleton with quick actions and events", () => {
    const { container } = render(<DashboardSkeleton />);
    // 3 quick actions + 4 upcoming events = 7 skeleton cards
    const cards = container.querySelectorAll(".border.rounded-lg");
    expect(cards.length).toBe(7);
  });

  it("renders UsersTableSkeleton with search and rows", () => {
    const { container } = render(<UsersTableSkeleton />);
    // 8 data rows separated by border-t
    const dataRows = container.querySelectorAll(".border-t");
    expect(dataRows.length).toBe(8);
  });
});
