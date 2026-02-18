import { describe, it, expect } from "vitest";
import { isDateInBreakPeriod, getHebrewMonthName } from "../calendarUtils";

describe("isDateInBreakPeriod", () => {
  it("returns true for a date within a break period", () => {
    // "תשעת הימים" is 2025-07-23 to 2025-08-01
    expect(isDateInBreakPeriod("2025-07-25")).toBe(true);
  });

  it("returns true for the start date of a break period", () => {
    expect(isDateInBreakPeriod("2025-07-23")).toBe(true);
  });

  it("returns true for the end date of a break period", () => {
    expect(isDateInBreakPeriod("2025-08-01")).toBe(true);
  });

  it("returns false for a date outside all break periods", () => {
    expect(isDateInBreakPeriod("2025-06-15")).toBe(false);
  });

  it("returns false for a date between two break periods", () => {
    // Between "תשעת הימים" end (2025-08-01) and "חגי תשרי" start (2025-09-22)
    expect(isDateInBreakPeriod("2025-08-15")).toBe(false);
  });
});

describe("getHebrewMonthName", () => {
  it("returns correct Hebrew month for January (index 0)", () => {
    expect(getHebrewMonthName("2025-01-15")).toBe("טבת/שבט");
  });

  it("returns correct Hebrew month for July (index 6)", () => {
    expect(getHebrewMonthName("2025-07-10")).toBe("תמוז/אב");
  });

  it("returns correct Hebrew month for December (index 11)", () => {
    expect(getHebrewMonthName("2025-12-25")).toBe("כסלו/טבת");
  });
});
