import { describe, it, expect } from "vitest";
import {
  EventStatus,
  EventType,
  convertDBEventToEvent,
  convertDBEventsToEvents,
  convertDBEventToEventWithDetails,
} from "../events";
import type { EventDB, EventWithDetailsDB } from "../events";

describe("Event Types and Converters", () => {
  const mockDBEvent: EventDB = {
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

  describe("convertDBEventToEvent", () => {
    it("converts a DB event to the legacy Event type", () => {
      const event = convertDBEventToEvent(mockDBEvent);

      expect(event.id).toBe("event-1");
      expect(event.title).toBe("קידושישי פרשת בראשית");
      expect(event.date).toBe("2026-02-20");
      expect(event.main_time).toBe("16:00");
      expect(event.location_name).toBe("פארק רבין");
      expect(event.created_by).toBe("user-1");
      expect(event.parasha).toBe("בראשית");
    });

    it("sets default status when not provided", () => {
      const noStatusEvent = { ...mockDBEvent, status: undefined };
      const event = convertDBEventToEvent(noStatusEvent);
      expect(event.status).toBe(EventStatus.PLANNED);
    });

    it("preserves the original status when provided", () => {
      const completedEvent = { ...mockDBEvent, status: "completed" };
      const event = convertDBEventToEvent(completedEvent);
      expect(event.status).toBe("completed");
    });

    it("maps location_name to location field", () => {
      const event = convertDBEventToEvent(mockDBEvent);
      expect(event.location).toBe("פארק רבין");
    });

    it("maps time fields correctly", () => {
      const event = convertDBEventToEvent(mockDBEvent);
      expect(event.time_start).toBe("16:00");
      expect(event.time_end).toBe("18:00");
    });
  });

  describe("convertDBEventsToEvents", () => {
    it("converts an array of DB events", () => {
      const dbEvents = [
        mockDBEvent,
        { ...mockDBEvent, id: "event-2", title: "אירוע שני" },
      ];

      const events = convertDBEventsToEvents(dbEvents);
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
      expect(events[1].title).toBe("אירוע שני");
    });

    it("returns empty array for empty input", () => {
      const events = convertDBEventsToEvents([]);
      expect(events).toEqual([]);
    });
  });

  describe("convertDBEventToEventWithDetails", () => {
    it("includes participant, equipment, and assignment details", () => {
      const dbEventWithDetails: EventWithDetailsDB = {
        ...mockDBEvent,
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

      const event = convertDBEventToEventWithDetails(dbEventWithDetails);
      expect(event.participants).toHaveLength(1);
      expect(event.participants?.[0].status).toBe("registered");
      expect(event.equipment).toHaveLength(1);
      expect(event.equipment?.[0].quantity).toBe(10);
      expect(event.assignments).toHaveLength(1);
      expect(event.assignments?.[0].role).toBe("manager");
    });
  });
});
