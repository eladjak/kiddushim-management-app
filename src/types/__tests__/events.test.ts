import { describe, it, expect } from "vitest";
import {
  EventStatus,
  EventType,
  normalizeEvent,
  normalizeEvents,
  normalizeEventWithDetails,
} from "../events";
import type { Event } from "../events";

describe("Event Types and Normalize Functions", () => {
  const mockDBRow: Record<string, unknown> = {
    id: "event-1",
    title: "קידושישי פרשת בראשית",
    date: "2026-02-20",
    setup_time: "15:00",
    main_time: "16:00",
    cleanup_time: "18:00",
    location_name: "פארק רבין",
    location_address: "רחוב הפלמח 15, מגדל העמק",
    location_coordinates: { lat: 32.68, lng: 35.24 },
    status: "planned",
    parasha: "בראשית",
    equipment: ["שולחנות", "כיסאות"],
    required_service_girls: 3,
    required_youth_volunteers: 5,
    created_by: "user-1",
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-10T15:00:00Z",
  };

  describe("EventStatus enum", () => {
    it("has correct values", () => {
      expect(EventStatus.PLANNED).toBe("planned");
      expect(EventStatus.ONGOING).toBe("ongoing");
      expect(EventStatus.COMPLETED).toBe("completed");
      expect(EventStatus.CANCELED).toBe("canceled");
      expect(EventStatus.DRAFT).toBe("draft");
    });
  });

  describe("EventType enum", () => {
    it("has correct values", () => {
      expect(EventType.KIDUSH).toBe("kidush");
      expect(EventType.MELAVE_MALKA).toBe("melave_malka");
      expect(EventType.WORKSHOP).toBe("workshop");
      expect(EventType.OTHER).toBe("other");
    });
  });

  describe("normalizeEvent", () => {
    it("normalizes a raw DB row to the Event type", () => {
      const event = normalizeEvent(mockDBRow);

      expect(event.id).toBe("event-1");
      expect(event.title).toBe("קידושישי פרשת בראשית");
      expect(event.date).toBe("2026-02-20");
      expect(event.main_time).toBe("16:00");
      expect(event.setup_time).toBe("15:00");
      expect(event.cleanup_time).toBe("18:00");
      expect(event.location_name).toBe("פארק רבין");
      expect(event.location_address).toBe("רחוב הפלמח 15, מגדל העמק");
      expect(event.created_by).toBe("user-1");
      expect(event.parasha).toBe("בראשית");
      expect(event.required_service_girls).toBe(3);
      expect(event.required_youth_volunteers).toBe(5);
      expect(event.equipment).toEqual(["שולחנות", "כיסאות"]);
    });

    it("sets default status when not provided", () => {
      const noStatusRow = { ...mockDBRow, status: undefined };
      const event = normalizeEvent(noStatusRow);
      expect(event.status).toBe(EventStatus.DRAFT);
    });

    it("preserves the original status when provided", () => {
      const completedRow = { ...mockDBRow, status: "completed" };
      const event = normalizeEvent(completedRow);
      expect(event.status).toBe("completed");
    });

    it("handles missing optional fields gracefully", () => {
      const minimalRow: Record<string, unknown> = {
        id: "event-min",
        title: "אירוע מינימלי",
        date: "2026-03-01",
        created_by: "user-1",
        created_at: "2026-02-01T10:00:00Z",
        updated_at: "2026-02-01T10:00:00Z",
      };
      const event = normalizeEvent(minimalRow);
      expect(event.setup_time).toBe("");
      expect(event.main_time).toBe("");
      expect(event.cleanup_time).toBe("");
      expect(event.location_name).toBe("");
      expect(event.location_address).toBe("");
      expect(event.status).toBe(EventStatus.DRAFT);
    });
  });

  describe("normalizeEvents", () => {
    it("normalizes an array of raw DB rows", () => {
      const rows = [
        mockDBRow,
        { ...mockDBRow, id: "event-2", title: "אירוע שני" },
      ];

      const events = normalizeEvents(rows);
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
      expect(events[1].title).toBe("אירוע שני");
    });

    it("returns empty array for empty input", () => {
      const events = normalizeEvents([]);
      expect(events).toEqual([]);
    });
  });

  describe("normalizeEventWithDetails", () => {
    it("includes participant, equipment, and assignment details", () => {
      const rowWithDetails: Record<string, unknown> = {
        ...mockDBRow,
        event_participants: [
          {
            id: "p1",
            event_id: "event-1",
            user_id: "user-2",
            status: "registered",
            created_at: "2026-02-15T10:00:00Z",
          },
        ],
        event_equipment: [
          {
            id: "eq1",
            event_id: "event-1",
            equipment_id: "equip-1",
            quantity: 10,
            created_at: "2026-02-15T10:00:00Z",
          },
        ],
        event_assignments: [
          {
            id: "a1",
            event_id: "event-1",
            user_id: "user-3",
            role: "manager",
            created_at: "2026-02-15T10:00:00Z",
          },
        ],
      };

      const event = normalizeEventWithDetails(rowWithDetails);
      expect(event.participants).toHaveLength(1);
      expect(event.participants?.[0].status).toBe("registered");
      expect(event.equipment_details).toHaveLength(1);
      expect(event.equipment_details?.[0].quantity).toBe(10);
      expect(event.assignments).toHaveLength(1);
      expect(event.assignments?.[0].role).toBe("manager");
    });
  });

  describe("Unified Event type", () => {
    it("supports both DB fields and UI-only fields", () => {
      const event: Event = {
        id: "event-1",
        title: "test",
        date: "2026-01-01",
        setup_time: "15:00",
        main_time: "16:00",
        cleanup_time: "18:00",
        location_name: "test location",
        location_address: "test address",
        created_by: "user-1",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        // UI-only fields
        description: "test description",
        hebrewDate: "א׳ בטבת",
        dayOfWeek: "יום שישי",
        serviceLadiesAvailable: true,
        notes: ["note 1"],
        type: "kidush",
      };

      expect(event.setup_time).toBe("15:00");
      expect(event.description).toBe("test description");
      expect(event.hebrewDate).toBe("א׳ בטבת");
      expect(event.serviceLadiesAvailable).toBe(true);
    });
  });
});
