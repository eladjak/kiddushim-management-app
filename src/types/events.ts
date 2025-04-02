
/**
 * טיפוסים עבור ישות אירועים
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

// טיפוס בסיסי של אירוע מהדאטהבייס
export interface EventDB {
  id: string;
  title: string;
  date: string;
  setup_time: string;
  main_time: string;
  cleanup_time: string;
  location_name: string;
  location_address: string;
  location_coordinates?: any;
  status?: string;
  parasha?: string;
  equipment?: string[];
  required_service_girls?: number;
  required_youth_volunteers?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// טיפוס עבור יצירת אירוע
export type EventCreateDB = Omit<EventDB, 'id' | 'created_at' | 'updated_at'>;

// טיפוס עבור עדכון אירוע
export type EventUpdateDB = Partial<EventCreateDB>;

// טיפוס מורחב עם נתונים נוספים מהדאטהבייס
export interface EventWithDetailsDB extends EventDB {
  event_participants?: EventParticipant[];
  event_equipment?: EventEquipment[];
  event_assignments?: EventAssignment[];
}

// טיפוסים ישנים לתאימות אחורית
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time_start: string;
  time_end: string;
  status: EventStatus | string;
  type: EventType | string;
  max_participants: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  // Adding properties used by Dashboard and Events components
  main_time: string;
  location_name: string;
  parasha?: string;
}

export type EventCreate = Omit<Event, 'id' | 'created_at' | 'updated_at'>;
export type EventUpdate = Partial<EventCreate>;
export interface EventWithDetails extends Event {
  participants?: EventParticipant[];
  equipment?: EventEquipment[];
  assignments?: EventAssignment[];
}

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

// פונקציית עזר להמרה מטיפוס DB לטיפוס הישן
export function convertDBEventToEvent(dbEvent: EventDB): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.title, // Using title as fallback for description
    location: dbEvent.location_name,
    date: dbEvent.date,
    time_start: dbEvent.main_time,
    time_end: dbEvent.cleanup_time,
    status: (dbEvent.status as EventStatus) || EventStatus.PLANNED,
    type: EventType.KIDUSH, // Default type
    max_participants: dbEvent.required_service_girls || 0,
    created_at: dbEvent.created_at,
    updated_at: dbEvent.updated_at,
    created_by: dbEvent.created_by
  };
}

// פונקציית עזר להמרה מטיפוס DB המורחב לטיפוס הישן המורחב
export function convertDBEventToEventWithDetails(dbEvent: EventWithDetailsDB): EventWithDetails {
  const baseEvent = convertDBEventToEvent(dbEvent);
  
  return {
    ...baseEvent,
    participants: dbEvent.event_participants,
    equipment: dbEvent.event_equipment,
    assignments: dbEvent.event_assignments
  };
}

// פונקציית עזר להמרה של מערך אירועים
export function convertDBEventsToEvents(dbEvents: EventDB[]): Event[] {
  return dbEvents.map(convertDBEventToEvent);
}
