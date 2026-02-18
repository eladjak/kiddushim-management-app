import { describe, it, expect } from "vitest";
import { getNotificationTypeIcon } from "../notificationUtils";

describe("getNotificationTypeIcon", () => {
  it("returns 'Calendar' for event type", () => {
    expect(getNotificationTypeIcon("event")).toBe("Calendar");
  });

  it("returns 'Users' for assignment type", () => {
    expect(getNotificationTypeIcon("assignment")).toBe("Users");
  });

  it("returns 'FileText' for report type", () => {
    expect(getNotificationTypeIcon("report")).toBe("FileText");
  });

  it("returns 'AlertTriangle' for alert type", () => {
    expect(getNotificationTypeIcon("alert")).toBe("AlertTriangle");
  });

  it("returns 'Bell' for system type", () => {
    expect(getNotificationTypeIcon("system")).toBe("Bell");
  });

  it("returns 'Bell' for unknown type (default)", () => {
    expect(getNotificationTypeIcon("unknown_type")).toBe("Bell");
  });
});
