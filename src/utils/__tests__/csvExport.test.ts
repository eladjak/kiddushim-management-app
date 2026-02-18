import { describe, it, expect } from "vitest";
import {
  toCsvString,
  filterByDateRange,
  computeEventSummary,
  type CsvColumn,
} from "../csvExport";

// ---- toCsvString ----

describe("toCsvString", () => {
  it("produces a header row and a data row", () => {
    interface Row { name: string; count: number }
    const columns: CsvColumn<Row>[] = [
      { header: "Name", getValue: r => r.name },
      { header: "Count", getValue: r => r.count },
    ];
    const result = toCsvString([{ name: "Alice", count: 3 }], { columns, filename: "test" });
    const lines = result.split("\r\n");
    expect(lines[0]).toBe("Name,Count");
    expect(lines[1]).toBe("Alice,3");
  });

  it("returns only header row when rows array is empty", () => {
    interface Row { id: string }
    const columns: CsvColumn<Row>[] = [{ header: "ID", getValue: r => r.id }];
    const result = toCsvString([], { columns, filename: "empty" });
    expect(result).toBe("ID");
  });

  it("escapes commas inside cell values", () => {
    interface Row { value: string }
    const columns: CsvColumn<Row>[] = [{ header: "Val", getValue: r => r.value }];
    const result = toCsvString([{ value: "hello, world" }], { columns, filename: "test" });
    const lines = result.split("\r\n");
    expect(lines[1]).toBe('"hello, world"');
  });

  it("escapes double-quotes inside cell values", () => {
    interface Row { value: string }
    const columns: CsvColumn<Row>[] = [{ header: "Val", getValue: r => r.value }];
    const result = toCsvString([{ value: 'say "hi"' }], { columns, filename: "test" });
    const lines = result.split("\r\n");
    expect(lines[1]).toBe('"say ""hi"""');
  });

  it("handles null/undefined cell values as empty string", () => {
    interface Row { value: string | null | undefined }
    const columns: CsvColumn<Row>[] = [{ header: "Val", getValue: r => r.value }];
    const result = toCsvString(
      [{ value: null }, { value: undefined }],
      { columns, filename: "test" }
    );
    const lines = result.split("\r\n");
    expect(lines[1]).toBe("");
    expect(lines[2]).toBe("");
  });

  it("handles Hebrew text correctly", () => {
    interface Row { title: string }
    const columns: CsvColumn<Row>[] = [{ header: "כותרת", getValue: r => r.title }];
    const result = toCsvString([{ title: "שלום עולם" }], { columns, filename: "test" });
    const lines = result.split("\r\n");
    expect(lines[0]).toBe("כותרת");
    expect(lines[1]).toBe("שלום עולם");
  });
});

// ---- filterByDateRange ----

describe("filterByDateRange", () => {
  interface Row { date: string }
  const rows: Row[] = [
    { date: "2024-01-01" },
    { date: "2024-06-15" },
    { date: "2024-12-31" },
  ];
  const getDate = (r: Row) => r.date;

  it("returns all rows when both from and to are null", () => {
    const result = filterByDateRange(rows, getDate, null, null);
    expect(result).toHaveLength(3);
  });

  it("filters rows before 'from' date", () => {
    const from = new Date("2024-06-01");
    const result = filterByDateRange(rows, getDate, from, null);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2024-06-15");
  });

  it("filters rows after 'to' date (inclusive)", () => {
    const to = new Date("2024-06-15");
    const result = filterByDateRange(rows, getDate, null, to);
    expect(result).toHaveLength(2);
    expect(result[1].date).toBe("2024-06-15");
  });

  it("filters within a specific range", () => {
    const from = new Date("2024-06-01");
    const to = new Date("2024-11-30");
    const result = filterByDateRange(rows, getDate, from, to);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2024-06-15");
  });

  it("keeps rows with null dates (treats as in-range)", () => {
    const rowsWithNull = [{ date: null as unknown as string }, ...rows];
    const from = new Date("2024-06-01");
    const result = filterByDateRange(rowsWithNull, r => r.date ?? null, from, null);
    // null date row + rows after from date
    expect(result).toHaveLength(3);
  });
});

// ---- computeEventSummary ----

describe("computeEventSummary", () => {
  const events = [
    { status: "planned",   created_at: "2024-01-01T10:00:00Z" },
    { status: "planned",   created_at: "2024-02-01T10:00:00Z" },
    { status: "completed", created_at: "2024-03-01T10:00:00Z" },
    { status: "canceled",  created_at: "2024-04-01T10:00:00Z" },
    { status: "completed", created_at: "2024-05-01T10:00:00Z" },
    { status: "draft",     created_at: "2024-06-01T10:00:00Z" },
  ];

  it("counts total items", () => {
    const summary = computeEventSummary(events, 3);
    expect(summary.total).toBe(6);
  });

  it("groups items by status", () => {
    const summary = computeEventSummary(events, 3);
    expect(summary.byStatus["planned"]).toBe(2);
    expect(summary.byStatus["completed"]).toBe(2);
    expect(summary.byStatus["canceled"]).toBe(1);
    expect(summary.byStatus["draft"]).toBe(1);
  });

  it("returns correct number of recent items, most recent first", () => {
    const summary = computeEventSummary(events, 3);
    expect(summary.recent).toHaveLength(3);
    const recent = summary.recent as typeof events;
    expect(recent[0].created_at).toBe("2024-06-01T10:00:00Z");
  });

  it("returns empty summary for empty array", () => {
    const summary = computeEventSummary([], 5);
    expect(summary.total).toBe(0);
    expect(summary.byStatus).toEqual({});
    expect(summary.recent).toHaveLength(0);
  });

  it("falls back to 'unknown' for missing status", () => {
    const withMissing = [{ created_at: "2024-01-01T00:00:00Z" }];
    const summary = computeEventSummary(withMissing, 5);
    expect(summary.byStatus["unknown"]).toBe(1);
  });
});
