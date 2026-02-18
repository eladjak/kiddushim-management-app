
import type { Event } from "@/types/events";

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
    date: predefined.date,
    setup_time: predefined.setupTime,
    main_time: predefined.mainTime,
    cleanup_time: predefined.mainTime,
    location_name: "מגדל העמק",
    location_address: "",
    created_at: now,
    updated_at: now,
    created_by: "system",
    status: "draft",
    parasha: predefined.parasha,
    // UI-only fields for display
    description: `קבלת שבת קהילתית - פרשת ${predefined.parasha}`,
    time: predefined.time,
    location: "מגדל העמק",
    hebrewDate: predefined.hebrewDate,
    dayOfWeek: predefined.dayOfWeek,
    serviceLadiesAvailable: predefined.serviceLadiesAvailable,
    notes: predefined.notes,
    setupTime: predefined.setupTime,
    type: "kidush",
  };
}
