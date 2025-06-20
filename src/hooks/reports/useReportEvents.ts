
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUpcomingKidushishiEvents } from "@/data/events/predefinedEvents2025-2026";

export const useReportEvents = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      console.log("useReportEvents - Loading predefined events...");
      
      try {
        // טוען אירועים מוגדרים מראש במקום מהדאטהבייס
        const predefinedEvents = getUpcomingKidushishiEvents();
        console.log("useReportEvents - Predefined events loaded:", predefinedEvents);
        
        // ממיר לפורמט הנדרש עבור הקומפוננט
        const formattedEvents = predefinedEvents.map(event => ({
          id: event.id,
          title: `קידושישי - פרשת ${event.parasha} (${event.hebrewDate})`,
          date: event.date,
          parasha: event.parasha,
          hebrewDate: event.hebrewDate
        }));

        console.log("useReportEvents - Formatted events:", formattedEvents);
        setEvents(formattedEvents);
        
        // בנוסף, טוען גם אירועים מהדאטהבייס במקרה שיש כאלה
        const { data: dbEvents, error } = await supabase
          .from("events")
          .select("id, title, date, parasha")
          .order("date", { ascending: false });

        if (!error && dbEvents && dbEvents.length > 0) {
          console.log("useReportEvents - Database events found:", dbEvents);
          const combinedEvents = [...formattedEvents, ...dbEvents];
          setEvents(combinedEvents);
        }
        
      } catch (error) {
        console.error("useReportEvents - Error loading events:", error);
        // במקרה של שגיאה, נסה לטעון רק מהדאטהבייס
        const { data, error: dbError } = await supabase
          .from("events")
          .select("id, title, date")
          .order("date", { ascending: false });

        if (!dbError && data) {
          console.log("useReportEvents - Fallback to database events:", data);
          setEvents(data);
        }
      }
    };

    loadEvents();
  }, []);

  return { events };
};
