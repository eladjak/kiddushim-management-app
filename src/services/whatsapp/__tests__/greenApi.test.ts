import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NotificationType } from "@/types/whatsapp";
import type { Event } from "@/types/events";

// Mock the logger
vi.mock("@/utils/logger", () => ({
  logger: {
    createLogger: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────

const TEST_CHAT_ID = "972501234567@c.us";

function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt-1",
    title: "קידוש שבת",
    date: "2026-02-20",
    setup_time: "2026-02-20T15:00:00",
    main_time: "2026-02-20T16:00:00",
    cleanup_time: "2026-02-20T17:30:00",
    location_name: "בית הכנסת המרכזי",
    location_address: "רחוב הרצל 10",
    status: "planned",
    parasha: "משפטים",
    created_by: "user-1",
    created_at: "2026-01-01T00:00:00",
    updated_at: "2026-01-01T00:00:00",
    ...overrides,
  };
}

function mockFetchSuccess(idMessage = "msg-abc-123") {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ idMessage }),
  });
}

function mockFetchFailure(status = 500, text = "Internal Server Error") {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: async () => text,
  });
}

function mockFetchNetworkError(message = "Network error") {
  return vi.fn().mockRejectedValue(new Error(message));
}

// ─── Tests ────────────────────────────────────────────────────────

describe("GreenAPI Service", () => {
  const ORIGINAL_ENV = { ...import.meta.env };

  beforeEach(() => {
    vi.stubEnv("VITE_GREEN_API_INSTANCE_ID", "1234567890");
    vi.stubEnv("VITE_GREEN_API_TOKEN", "test-api-token-xyz");
    vi.stubGlobal("fetch", mockFetchSuccess());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  // Dynamically import to pick up fresh env stubs per test
  async function importService() {
    const mod = await import("../greenApi");
    return mod.greenApiService;
  }

  // ──────────── sendMessage ────────────

  describe("sendMessage", () => {
    it("sends a text message and returns success with messageId", async () => {
      const service = await importService();
      const result = await service.sendMessage(TEST_CHAT_ID, "שלום עולם");

      expect(result).toEqual({ success: true, messageId: "msg-abc-123" });
      expect(fetch).toHaveBeenCalledOnce();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sendMessage/"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId: TEST_CHAT_ID, message: "שלום עולם" }),
        }),
      );
    });

    it("returns error when API responds with non-OK status", async () => {
      vi.stubGlobal("fetch", mockFetchFailure(403, "Forbidden"));
      const service = await importService();
      const result = await service.sendMessage(TEST_CHAT_ID, "test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("403");
      expect(result.error).toContain("Forbidden");
    });

    it("returns error when network request throws", async () => {
      vi.stubGlobal("fetch", mockFetchNetworkError("Connection refused"));
      const service = await importService();
      const result = await service.sendMessage(TEST_CHAT_ID, "test");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Connection refused");
    });

    it("returns error when GreenAPI credentials are missing", async () => {
      vi.stubEnv("VITE_GREEN_API_INSTANCE_ID", "");
      vi.stubEnv("VITE_GREEN_API_TOKEN", "");
      const service = await importService();
      const result = await service.sendMessage(TEST_CHAT_ID, "test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("GreenAPI");
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // ──────────── sendEventNotification ────────────

  describe("sendEventNotification", () => {
    it("sends a formatted event notification message", async () => {
      const service = await importService();
      const event = createMockEvent();
      const result = await service.sendEventNotification(TEST_CHAT_ID, event);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-abc-123");

      const sentBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(sentBody.chatId).toBe(TEST_CHAT_ID);
      expect(sentBody.message).toContain("אירוע חדש נוצר");
      expect(sentBody.message).toContain("קידוש שבת");
    });

    it("includes location and parasha in the message body", async () => {
      const service = await importService();
      const event = createMockEvent({
        location_name: "אולם השמחות",
        parasha: "תרומה",
      });
      await service.sendEventNotification(TEST_CHAT_ID, event);

      const sentBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(sentBody.message).toContain("אולם השמחות");
      expect(sentBody.message).toContain("תרומה");
    });
  });

  // ──────────── sendEventReminder ────────────

  describe("sendEventReminder", () => {
    it("sends a reminder with correct hours text for hoursUntil > 1", async () => {
      const service = await importService();
      const event = createMockEvent();
      await service.sendEventReminder(TEST_CHAT_ID, event, 3);

      const sentBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(sentBody.message).toContain("בעוד 3 שעות");
      expect(sentBody.message).toContain("קידוש שבת");
    });

    it("sends 'בעוד שעה' text when hoursUntil is 1", async () => {
      const service = await importService();
      const event = createMockEvent();
      await service.sendEventReminder(TEST_CHAT_ID, event, 1);

      const sentBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(sentBody.message).toContain("בעוד שעה");
    });

    it("sends 'בקרוב' text when hoursUntil is less than 1", async () => {
      const service = await importService();
      const event = createMockEvent();
      await service.sendEventReminder(TEST_CHAT_ID, event, 0.5);

      const sentBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(sentBody.message).toContain("בקרוב");
    });
  });

  // ──────────── sendNotificationByType ────────────

  describe("sendNotificationByType", () => {
    it("builds correct message for EVENT_CANCELED type", async () => {
      const service = await importService();
      const event = createMockEvent();
      await service.sendNotificationByType(
        TEST_CHAT_ID,
        NotificationType.EVENT_CANCELED,
        event,
      );

      const sentBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(sentBody.message).toContain("אירוע בוטל");
      expect(sentBody.message).toContain("קידוש שבת");
    });

    it("builds correct message for EVENT_UPDATED type", async () => {
      const service = await importService();
      const event = createMockEvent();
      await service.sendNotificationByType(
        TEST_CHAT_ID,
        NotificationType.EVENT_UPDATED,
        event,
      );

      const sentBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(sentBody.message).toContain("עדכון אירוע");
    });

    it("builds correct message for EVENT_ASSIGNMENT type", async () => {
      const service = await importService();
      const event = createMockEvent();
      await service.sendNotificationByType(
        TEST_CHAT_ID,
        NotificationType.EVENT_ASSIGNMENT,
        event,
      );

      const sentBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(sentBody.message).toContain("שויכת לאירוע");
    });
  });
});
