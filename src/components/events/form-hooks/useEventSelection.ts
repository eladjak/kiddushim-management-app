
import { PredefinedEvent } from "@/data/types/predefinedEvents";

/**
 * הוק לטיפול בבחירת אירוע מתוך האירועים המוגדרים מראש
 */
export const useEventSelection = (
  setFormData: React.Dispatch<React.SetStateAction<any>>, 
  setEventNotes: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const handleEventSelect = (event: PredefinedEvent) => {
    const mainTimeParts = event.mainTime?.split(":").map(Number) || [0, 0];
    const mainTimeHour = mainTimeParts[0];
    const mainTimeMinute = mainTimeParts[1];
    
    let cleanupHour = mainTimeHour;
    let cleanupMinute = mainTimeMinute + 30;
    
    if (cleanupMinute >= 60) {
      cleanupHour += 1;
      cleanupMinute -= 60;
    }
    
    const cleanupTime = `${cleanupHour.toString().padStart(2, '0')}:${cleanupMinute.toString().padStart(2, '0')}`;
    
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
    
    if (event.notes && event.notes.length > 0) {
      setEventNotes(event.notes);
    } else {
      setEventNotes([]);
    }
  };

  return { handleEventSelect };
};
