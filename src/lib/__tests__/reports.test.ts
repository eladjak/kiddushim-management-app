import { describe, it, expect, vi } from "vitest";
import { encodeContentForStorage, decodeContentFromStorage } from "../reports";

// Mock logger
vi.mock("@/utils/logger", () => ({
  logger: {
    createLogger: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("encodeContentForStorage", () => {
  it("preserves string values", () => {
    const content = { title: "Test Report", summary: "All good" };
    const result = encodeContentForStorage(content);
    expect(result.title).toBe("Test Report");
    expect(result.summary).toBe("All good");
  });

  it("preserves null and undefined values", () => {
    const content = { a: null, b: undefined, c: "value" };
    const result = encodeContentForStorage(content);
    expect(result.a).toBeNull();
    expect(result.b).toBeUndefined();
    expect(result.c).toBe("value");
  });

  it("preserves numbers and booleans", () => {
    const content = { count: 42, active: true, ratio: 3.14 };
    const result = encodeContentForStorage(content);
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
    expect(result.ratio).toBe(3.14);
  });

  it("processes nested objects recursively", () => {
    const content = {
      metadata: { author: "Admin", version: 2 },
      data: { nested: { deep: "value" } },
    };
    const result = encodeContentForStorage(content);
    const metadata = result.metadata as Record<string, unknown>;
    const data = result.data as Record<string, unknown>;
    const nested = data.nested as Record<string, unknown>;
    expect(metadata.author).toBe("Admin");
    expect(metadata.version).toBe(2);
    expect(nested.deep).toBe("value");
  });

  it("handles Hebrew content", () => {
    const content = { title: "דיווח שבועי", description: "הכל בסדר" };
    const result = encodeContentForStorage(content);
    expect(result.title).toBe("דיווח שבועי");
    expect(result.description).toBe("הכל בסדר");
  });
});

describe("decodeContentFromStorage", () => {
  it("returns object content as processed object", () => {
    const content = { title: "Report", count: 5 };
    const result = decodeContentFromStorage(content);
    expect(typeof result).toBe("object");
    const obj = result as Record<string, unknown>;
    expect(obj.title).toBe("Report");
    expect(obj.count).toBe(5);
  });

  it("parses JSON string content", () => {
    const content = JSON.stringify({ key: "value", num: 42 });
    const result = decodeContentFromStorage(content) as Record<string, unknown>;
    expect(result.key).toBe("value");
    expect(result.num).toBe(42);
  });

  it("decodes URL-encoded string values within objects", () => {
    const content = { name: "%D7%A9%D7%9C%D7%95%D7%9D" }; // "שלום" URL-encoded
    const result = decodeContentFromStorage(content) as Record<string, unknown>;
    expect(result.name).toBe("שלום");
  });

  it("handles nested objects recursively", () => {
    const content = {
      level1: { level2: { value: "deep" } },
    };
    const result = decodeContentFromStorage(content) as Record<string, unknown>;
    const level1 = result.level1 as Record<string, unknown>;
    const level2 = level1.level2 as Record<string, unknown>;
    expect(level2.value).toBe("deep");
  });

  it("returns error object for invalid JSON string", () => {
    const result = decodeContentFromStorage("not-valid-json") as Record<string, unknown>;
    expect(result.error).toBe("Invalid content format");
  });

  it("returns error object for null/undefined content", () => {
    const result = decodeContentFromStorage(null) as Record<string, unknown>;
    expect(result.error).toBe("Empty content");
  });

  it("round-trips encode-then-decode correctly", () => {
    const original = {
      title: "דיווח חודשי",
      score: 8,
      details: { notes: "הערות", items: "פריטים" },
    };
    const encoded = encodeContentForStorage(original);
    const decoded = decodeContentFromStorage(encoded) as Record<string, unknown>;
    expect(decoded.title).toBe("דיווח חודשי");
    expect(decoded.score).toBe(8);
    const details = decoded.details as Record<string, unknown>;
    expect(details.notes).toBe("הערות");
    expect(details.items).toBe("פריטים");
  });
});
