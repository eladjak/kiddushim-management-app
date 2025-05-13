
import { Event } from "@/types/events";

// טיפוס עבור אירועים מוגדרים מראש לתכנון
export interface PredefinedEvent {
  id: string;
  date: string;
  hebrewDate: string;
  parasha: string;
  dayOfWeek: string;
  time: string;
  setupTime: string;
  mainTime: string;
  serviceLadiesAvailable: boolean;
  notes: string[];
  shabatEntrance?: string;
}

// המרה מאירוע מוגדר מראש לאירוע רגיל
export function convertPredefinedToEvent(predefined: PredefinedEvent): Event {
  const now = new Date().toISOString();
  
  return {
    id: predefined.id,
    title: `קידושישי - ${predefined.parasha}`,
    description: `קבלת שבת קהילתית - פרשת ${predefined.parasha}`,
    date: predefined.date,
    time: predefined.time,
    main_time: predefined.mainTime,
    setupTime: predefined.setupTime,
    location: "מגדל העמק",
    location_name: "מגדל העמק",
    hebrewDate: predefined.hebrewDate,
    parasha: predefined.parasha,
    dayOfWeek: predefined.dayOfWeek,
    serviceLadiesAvailable: predefined.serviceLadiesAvailable,
    notes: predefined.notes,
    created_at: now,
    updated_at: now,
    created_by: "system",
    status: "draft",
    time_start: predefined.mainTime,
    time_end: predefined.mainTime,
    type: "kidush"
  };
}
