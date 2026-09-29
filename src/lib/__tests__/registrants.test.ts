import { describe, it, expect } from "vitest";
import { canViewRegistrants, csvCell, registrantsToCsv, statusLabel, csvFileName } from "../registrants";

describe("canViewRegistrants", () => {
  it("allows admin and coordinator only", () => {
    expect(canViewRegistrants("admin")).toBe(true);
    expect(canViewRegistrants("coordinator")).toBe(true);
    for (const r of ["youth_volunteer", "service_girl", "volunteer", null, undefined] as const) {
      expect(canViewRegistrants(r)).toBe(false);
    }
  });
});

describe("registrants CSV", () => {
  it("starts with a UTF-8 BOM, has header and CRLF rows", () => {
    const csv = registrantsToCsv([
      { id: "1", name: "דנה", phone: "0501234567", status: "confirmed", consent_at: null },
    ]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const lines = csv.slice(1).split("\r\n");
    expect(lines[0]).toBe('"שם","טלפון","מועד הסכמה","סטטוס"');
    expect(lines[1]).toBe('"דנה","0501234567","לא נרשמה הסכמה","אושר"');
  });

  it("neutralises spreadsheet formula injection and escapes quotes", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+1")).toBe("\"'+1\"");
    expect(csvCell("@a")).toBe("\"'@a\"");
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell(null)).toBe('""');
  });

  it("labels statuses and builds a safe filename", () => {
    expect(statusLabel("pending")).toBe("ממתין לאישור");
    expect(statusLabel(null)).toBe("לא ידוע");
    expect(csvFileName("קידושישי / 9.10")).toBe("registrants-קידושישי-9-10.csv");
  });
});
