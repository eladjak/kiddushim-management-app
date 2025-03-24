/**
 * טיפוסים עבור ישות אירועים
 */

// סטטוס אירוע
export enum EventStatus {
  PLANNED = 'planned',    // מתוכנן
  ONGOING = 'ongoing',    // מתרחש
  COMPLETED = 'completed', // הושלם
  CANCELED = 'canceled',  // בוטל
}

// סוג אירוע
export enum EventType {
  KIDUSH = 'kidush',      // קידוש
  MELAVE_MALKA = 'melave_malka', // מלווה מלכה
  WORKSHOP = 'workshop',  // סדנה
  OTHER = 'other',        // אחר
}

// טיפוס בסיסי של אירוע
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time_start: string;
  time_end: string;
  status: EventStatus;
  type: EventType;
  max_participants: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// טיפוס עבור יצירת אירוע
export type EventCreate = Omit<Event, 'id' | 'created_at' | 'updated_at'>;

// טיפוס עבור עדכון אירוע
export type EventUpdate = Partial<EventCreate>;

// טיפוס מורחב עם נתונים נוספים
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