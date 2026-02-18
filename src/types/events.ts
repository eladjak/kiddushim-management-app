
/**
 * טיפוסים עבור ישות אירועים
 *
 * Unified Event type - uses DB column names (snake_case) as the base,
 * with optional UI-only fields for predefined events and display purposes.
 */

// סטטוס אירוע
export enum EventStatus {
  PLANNED = 'planned',    // מתוכנן
  ONGOING = 'ongoing',    // מתרחש
  COMPLETED = 'completed', // הושלם
  CANCELED = 'canceled',  // בוטל
  DRAFT = 'draft',        // טיוטה
}

// סוג אירוע
export enum EventType {
  KIDUSH = 'kidush',      // קידוש
  MELAVE_MALKA = 'melave_malka', // מלווה מלכה
  WORKSHOP = 'workshop',  // סדנה
  OTHER = 'other',        // אחר
}

/**
 * Unified Event interface.
 * Core fields match the Supabase `events` table schema (snake_case).
 * Optional UI-only fields are used by predefined events and display components.
 */
export interface Event {
  // === Core DB fields ===
  id: string;
  title: string;
  date: string;
  setup_time: string;
  main_time: string;
  cleanup_time: string;
  location_name: string;
  location_address: string;
  location_coordinates?: { lat: number; lng: number };
  status?: string;
  parasha?: string;
  equipment?: string[];
  required_service_girls?: number;
  required_youth_volunteers?: number;
  created_by: string;
  created_at: string;
  updated_at: string;

  // === Optional UI-only fields (used by predefined events, exports, forms) ===
  /** Display description - not stored in DB */
  description?: string;
  /** Display time string (e.g. "16:00-17:30") - not stored in DB */
  time?: string;
  /** Location display alias - prefer location_name */
  location?: string;
  /** Hebrew date string (e.g. "כ\"ב שבט") - not stored in DB */
  hebrewDate?: string;
  /** Day of week in Hebrew (e.g. "יום שישי") - not stored in DB */
  dayOfWeek?: string;
  /** Whether event is completed - use status field instead */
  completed?: boolean;
  /** Whether service ladies are available for this event - not stored in DB */
  serviceLadiesAvailable?: boolean;
  /** Display notes array - not stored in DB */
  notes?: string[];
  /** Setup time alias - prefer setup_time */
  setupTime?: string;
  /** Event type (kidush, workshop, etc.) */
  type?: string;
  /** Max participants alias - prefer required_service_girls */
  max_participants?: number;
  /** Additional form fields that may come from create form */
  poster_url?: string | null;
  facilitator?: string | null;
  workshop_content?: string | null;
  event_content?: string | null;
}

/**
 * Backward compatibility alias - EventDB is now the same as Event.
 * All DB fields are present on Event directly.
 */
export type EventDB = Event;

// טיפוס עבור יצירת אירוע (omit auto-generated fields)
export type EventCreate = Omit<Event, 'id' | 'created_at' | 'updated_at'>;
export type EventCreateDB = EventCreate;

// טיפוס עבור עדכון אירוע
export type EventUpdate = Partial<EventCreate>;
export type EventUpdateDB = EventUpdate;

// טיפוס מורחב עם נתונים נוספים
export interface EventWithDetails extends Event {
  participants?: EventParticipant[];
  equipment_details?: EventEquipment[];
  assignments?: EventAssignment[];
}

/**
 * Backward compatibility alias.
 */
export type EventWithDetailsDB = EventWithDetails;

// משתתף באירוע
export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'canceled';
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

// ציוד לאירוע
export interface EventEquipment {
  id: string;
  event_id: string;
  equipment_id: string;
  quantity: number;
  notes?: string;
  created_at: string;
  equipment?: {
    id: string;
    name: string;
    category: string;
  };
}

// שיוך אחראי לאירוע
export interface EventAssignment {
  id: string;
  event_id: string;
  user_id: string;
  role: 'manager' | 'assistant' | 'volunteer';
  notes?: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

/**
 * Normalize raw DB data to Event.
 * Since Event now matches the DB schema, this is mostly a pass-through
 * that sets sensible defaults for optional fields.
 */
export function normalizeEvent(raw: Record<string, unknown>): Event {
  return {
    id: raw.id as string,
    title: raw.title as string,
    date: raw.date as string,
    setup_time: (raw.setup_time as string) || '',
    main_time: (raw.main_time as string) || '',
    cleanup_time: (raw.cleanup_time as string) || '',
    location_name: (raw.location_name as string) || '',
    location_address: (raw.location_address as string) || '',
    location_coordinates: raw.location_coordinates as { lat: number; lng: number } | undefined,
    status: (raw.status as string) || EventStatus.DRAFT,
    parasha: raw.parasha as string | undefined,
    equipment: raw.equipment as string[] | undefined,
    required_service_girls: raw.required_service_girls as number | undefined,
    required_youth_volunteers: raw.required_youth_volunteers as number | undefined,
    created_by: raw.created_by as string,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  };
}

/**
 * Normalize raw DB data with details (participants, equipment, assignments).
 */
export function normalizeEventWithDetails(raw: Record<string, unknown>): EventWithDetails {
  const base = normalizeEvent(raw);
  return {
    ...base,
    participants: raw.event_participants as EventParticipant[] | undefined,
    equipment_details: raw.event_equipment as EventEquipment[] | undefined,
    assignments: raw.event_assignments as EventAssignment[] | undefined,
  };
}

/**
 * Normalize an array of raw DB rows to Events.
 */
export function normalizeEvents(rows: Record<string, unknown>[]): Event[] {
  return rows.map(normalizeEvent);
}

// ===== Backward compatibility: converter function aliases =====
/** @deprecated Use normalizeEvent instead */
export const convertDBEventToEvent = normalizeEvent;
/** @deprecated Use normalizeEventWithDetails instead */
export const convertDBEventToEventWithDetails = normalizeEventWithDetails;
/** @deprecated Use normalizeEvents instead */
export const convertDBEventsToEvents = normalizeEvents;
