
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUpcomingKidushishiEvents } from "@/data/events/predefinedEvents2025-2026";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'useReportEvents' });

export interface ReportEvent {
  id: string;
  title: string;
  date: string;
  parasha?: string;
  hebrewDate?: string;
}

export const useReportEvents = () => {
  const [events, setEvents] = useState<ReportEvent[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      log.debug("Loading predefined events...");

      try {
        // טוען אירועים מוגדרים מראש במקום מהדאטהבייס
        const predefinedEvents = getUpcomingKidushishiEvents();
        log.debug("Predefined events loaded:", { count: predefinedEvents.length });

        // ממיר לפורמט הנדרש עבור הקומפוננט
        const formattedEvents = predefinedEvents.map(event => ({
          id: event.id,
          title: `קידושישי - פרשת ${event.parasha} (${event.hebrewDate})`,
          date: event.date,
          parasha: event.parasha,
          hebrewDate: event.hebrewDate
        }));

        log.debug("Formatted events:", { count: formattedEvents.length });
        setEvents(formattedEvents);

        // בנוסף, טוען גם אירועים מהדאטהבייס במקרה שיש כאלה
        const { data: dbEvents, error } = await supabase
          .from("events")
          .select("id, title, date, parasha")
          .order("date", { ascending: false });

        if (!error && dbEvents && dbEvents.length > 0) {
          log.debug("Database events found:", { count: dbEvents.length });
          const combinedEvents = [...formattedEvents, ...dbEvents];
          setEvents(combinedEvents);
        }

      } catch (error) {
        log.error("Error loading events:", { error });
        // במקרה של שגיאה, נסה לטעון רק מהדאטהבייס
        const { data, error: dbError } = await supabase
          .from("events")
          .select("id, title, date")
          .order("date", { ascending: false });

        if (!dbError && data) {
          log.debug("Fallback to database events:", { count: data.length });
          setEvents(data);
        }
      }
    };

    loadEvents();
  }, []);

  return { events };
};
