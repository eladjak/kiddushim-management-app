import { describe, it, expect } from "vitest";
import {
  isValidRegistrationPhone,
  parseFamilySize,
  validateRegistration,
  extractRegistrationError,
  GENERIC_REGISTRATION_ERROR,
} from "../registration";

describe("isValidRegistrationPhone", () => {
  it.each(["0501234567", "050-123-4567", "050 123 4567", "+972501234567"])("accepts %s", (p) => {
    expect(isValidRegistrationPhone(p)).toBe(true);
  });
  it.each(["", "12345", "0401234567", "05012345", "050123456789", "abc", "+97250123"])("rejects %s", (p) => {
    expect(isValidRegistrationPhone(p)).toBe(false);
  });
});

describe("parseFamilySize", () => {
  it("defaults to 1 for empty / invalid / <1", () => {
    expect(parseFamilySize("")).toBe(1);
    expect(parseFamilySize("abc")).toBe(1);
    expect(parseFamilySize("0")).toBe(1);
    expect(parseFamilySize("-3")).toBe(1);
  });
  it("caps at 20 like the server", () => {
    expect(parseFamilySize("4")).toBe(4);
    expect(parseFamilySize("999")).toBe(20);
  });
});

describe("validateRegistration", () => {
  const ok = { name: "דנה לוי", phone: "050-1234567", consent: true };
  it("passes valid input", () => expect(validateRegistration(ok)).toBeNull());
  it("requires a name", () => expect(validateRegistration({ ...ok, name: " a " })).toMatch(/שם/));
  it("requires a valid phone", () => expect(validateRegistration({ ...ok, phone: "123" })).toMatch(/טלפון/));
  it("requires consent (fails closed)", () => expect(validateRegistration({ ...ok, consent: false })).toMatch(/פרטיות/));
});

describe("extractRegistrationError", () => {
  it("surfaces the server's Hebrew message from a non-2xx response", async () => {
    const res = new Response(JSON.stringify({ error: "כבר נרשמת לאירוע זה" }), { status: 409 });
    expect(await extractRegistrationError({ context: res })).toBe("כבר נרשמת לאירוע זה");
  });
  it("falls back to the generic message for opaque errors", async () => {
    expect(await extractRegistrationError(new Error("Failed to fetch"))).toBe(GENERIC_REGISTRATION_ERROR);
    expect(await extractRegistrationError(null)).toBe(GENERIC_REGISTRATION_ERROR);
  });
  it("falls back when the body is not JSON", async () => {
    expect(await extractRegistrationError({ context: new Response("boom", { status: 500 }) })).toBe(GENERIC_REGISTRATION_ERROR);
  });
});
