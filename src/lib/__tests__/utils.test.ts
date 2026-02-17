import { describe, it, expect } from "vitest";
import { cn, sanitizeHebrew, sanitizeObjectForAPI, objectToUrlParams, sanitizeFilename } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("merges conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("sanitizeHebrew", () => {
  it("returns English strings unchanged", () => {
    expect(sanitizeHebrew("hello world")).toBe("hello world");
  });

  it("encodes Hebrew strings", () => {
    const result = sanitizeHebrew("שלום");
    expect(result).toBe(encodeURIComponent("שלום"));
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeHebrew("")).toBe("");
  });

  it("encodes mixed Hebrew and English", () => {
    const result = sanitizeHebrew("hello שלום");
    expect(result).toBe(encodeURIComponent("hello שלום"));
  });
});

describe("sanitizeObjectForAPI", () => {
  it("returns null/undefined as is", () => {
    expect(sanitizeObjectForAPI(null)).toBeNull();
    expect(sanitizeObjectForAPI(undefined)).toBeUndefined();
  });

  it("sanitizes string values with Hebrew chars", () => {
    const result = sanitizeObjectForAPI("שלום");
    expect(result).toBe(encodeURIComponent("שלום"));
  });

  it("leaves English strings unchanged", () => {
    expect(sanitizeObjectForAPI("hello")).toBe("hello");
  });

  it("processes nested objects", () => {
    const obj = { name: "test", nested: { value: "hello" } };
    const result = sanitizeObjectForAPI(obj) as Record<string, unknown>;
    expect(result.name).toBe("test");
    expect((result.nested as Record<string, unknown>).value).toBe("hello");
  });

  it("processes arrays", () => {
    const arr = ["hello", "world"];
    const result = sanitizeObjectForAPI(arr);
    expect(result).toEqual(["hello", "world"]);
  });

  it("leaves numbers and booleans unchanged", () => {
    expect(sanitizeObjectForAPI(42)).toBe(42);
    expect(sanitizeObjectForAPI(true)).toBe(true);
  });
});

describe("objectToUrlParams", () => {
  it("converts object to URL params string", () => {
    const result = objectToUrlParams({ page: 1, limit: 10 });
    expect(result).toBe("page=1&limit=10");
  });

  it("skips null and undefined values", () => {
    const result = objectToUrlParams({ a: "1", b: null, c: undefined } as Record<string, unknown>);
    expect(result).toBe("a=1");
  });

  it("handles empty object", () => {
    expect(objectToUrlParams({})).toBe("");
  });
});

describe("sanitizeFilename", () => {
  it("replaces invalid characters with underscore", () => {
    expect(sanitizeFilename("file/name")).toBe("file_name");
    expect(sanitizeFilename("file:name")).toBe("file_name");
    expect(sanitizeFilename('file"name')).toBe("file_name");
  });

  it("keeps valid filenames unchanged", () => {
    expect(sanitizeFilename("my-file_v2.pdf")).toBe("my-file_v2.pdf");
  });

  it("handles multiple invalid characters", () => {
    expect(sanitizeFilename("a/b\\c?d")).toBe("a_b_c_d");
  });
});
