import { describe, it, expect, vi } from "vitest";
import {
  safeEncode,
  safeDecode,
  containsNonLatinChars,
  generateSafePKCEString,
  storeCodeVerifier,
  retrieveCodeVerifier,
} from "../encoding";

// Mock the logger to avoid side effects
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

describe("safeEncode", () => {
  it("returns empty string for empty input", () => {
    expect(safeEncode("")).toBe("");
  });

  it("encodes ASCII strings correctly", () => {
    const encoded = safeEncode("hello world");
    expect(encoded).toBeTruthy();
    // Verify round-trip
    expect(safeDecode(encoded)).toBe("hello world");
  });

  it("encodes Hebrew characters without throwing", () => {
    const encoded = safeEncode("שלום עולם");
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe("string");
  });

  it("round-trips Hebrew text correctly", () => {
    const original = "שלום עולם";
    const encoded = safeEncode(original);
    const decoded = safeDecode(encoded);
    expect(decoded).toBe(original);
  });
});

describe("safeDecode", () => {
  it("returns empty string for empty input", () => {
    expect(safeDecode("")).toBe("");
  });

  it("decodes base64 ASCII correctly", () => {
    const base64 = btoa("hello");
    expect(safeDecode(base64)).toBe("hello");
  });
});

describe("containsNonLatinChars", () => {
  it("returns false for empty string", () => {
    expect(containsNonLatinChars("")).toBe(false);
  });

  it("returns false for ASCII-only strings", () => {
    expect(containsNonLatinChars("hello world 123")).toBe(false);
  });

  it("returns false for Latin-1 characters (charCode <= 255)", () => {
    expect(containsNonLatinChars("cafe")).toBe(false);
  });

  it("returns true for Hebrew characters", () => {
    expect(containsNonLatinChars("שלום")).toBe(true);
  });

  it("returns true for mixed Hebrew and English", () => {
    expect(containsNonLatinChars("hello שלום")).toBe(true);
  });

  it("returns false for null/undefined input", () => {
    expect(containsNonLatinChars(null as unknown as string)).toBe(false);
    expect(containsNonLatinChars(undefined as unknown as string)).toBe(false);
  });
});

describe("generateSafePKCEString", () => {
  it("generates string of specified length", () => {
    const result = generateSafePKCEString(32);
    expect(result).toHaveLength(32);
  });

  it("generates only URL-safe characters", () => {
    const result = generateSafePKCEString(100);
    // Characters should be from: A-Z, a-z, 0-9, -, ., _, ~
    expect(result).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it("generates different strings each time", () => {
    const a = generateSafePKCEString(32);
    const b = generateSafePKCEString(32);
    // Extremely unlikely to be equal
    expect(a).not.toBe(b);
  });
});

describe("storeCodeVerifier / retrieveCodeVerifier", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores and retrieves code verifier from localStorage", () => {
    storeCodeVerifier("test-verifier-123");
    const retrieved = retrieveCodeVerifier();
    expect(retrieved).toBe("test-verifier-123");
  });

  it("returns null when no verifier is stored", () => {
    expect(retrieveCodeVerifier()).toBeNull();
  });

  it("stores verifier in both localStorage and sessionStorage", () => {
    storeCodeVerifier("dual-storage-test");
    expect(localStorage.getItem("pkce_code_verifier")).toBe("dual-storage-test");
    expect(sessionStorage.getItem("pkce_code_verifier")).toBe("dual-storage-test");
  });
});
