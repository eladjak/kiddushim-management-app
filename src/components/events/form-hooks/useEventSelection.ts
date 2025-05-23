
import { PredefinedEvent } from "@/data/types/eventTypes";
import { logger } from "@/utils/logger";

/**
 * הוק לטיפול בבחירת אירוע מתוך האירועים המוגדרים מראש
 */
export const useEventSelection = (
  setFormData: React.Dispatch<React.SetStateAction<any>>, 
  setEventNotes: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const log = logger.createLogger({ component: 'useEventSelection' });
  
  const handleEventSelect = (event: PredefinedEvent) => {
    log.info('Selected predefined event', { eventId: event.id, parasha: event.parasha });
    
    // Parse the main time to calculate cleanup time
    const mainTimeParts = event.mainTime?.split(":").map(Number) || [0, 0];
    const mainTimeHour = mainTimeParts[0];
    const mainTimeMinute = mainTimeParts[1];
    
    // Set cleanup time to be 1 hour after main time
    let cleanupHour = mainTimeHour + 1;
    let cleanupMinute = mainTimeMinute;
    
    if (cleanupHour >= 24) {
      cleanupHour -= 24;
    }
    
    const cleanupTime = `${cleanupHour.toString().padStart(2, '0')}:${cleanupMinute.toString().padStart(2, '0')}`;
    
    // Set form data with event details
    setFormData(prevFormData => ({
      ...prevFormData,
      title: `קידושישי - פרשת ${event.parasha}`,
      date: event.date,
      setupTime: event.setupTime || "",
      mainTime: event.mainTime || "",
      cleanupTime: cleanupTime,
      parasha: event.parasha,
      requiredServiceGirls: event.serviceLadiesAvailable ? 2 : 0,
      requiredYouthVolunteers: 3,
    }));
    
    // Set event notes if available
    if (event.notes && event.notes.length > 0) {
      setEventNotes(event.notes);
    } else {
      setEventNotes([]);
    }
    
    log.info('Event data set successfully', { title: `קידושישי - פרשת ${event.parasha}`, date: event.date });
  };

  return { handleEventSelect };
};
