
import { useCallback } from "react";
import { ReportFormData } from "./useReportFormState";

export const useEventAutoFill = (
  formData: ReportFormData,
  onFieldChange: (field: keyof ReportFormData, value: any) => void
) => {
  
  const autoFillFromEvent = useCallback((eventDetails: any) => {
    console.log("useEventAutoFill - Auto-filling from event:", eventDetails);
    
    // Auto-fill title if empty
    if (eventDetails.title && !formData.title) {
      onFieldChange("title", `דיווח ${eventDetails.title}`);
    }
    
    // Auto-fill description if empty
    if (eventDetails.parasha && eventDetails.hebrewDate && !formData.description) {
      const basicDescription = `דיווח על אירוע קידושישי פרשת ${eventDetails.parasha} שהתקיים ב${eventDetails.hebrewDate}`;
      onFieldChange("description", basicDescription);
    }
    
    // Auto-fill participants gained template if empty
    if (eventDetails.parasha && !formData.participants_gained) {
      const template = `באירוע פרשת ${eventDetails.parasha} השתתפו משפחות ויחידים מהקהילה המקומית. הפעילות כללה קבלת שבת משותפת עם מוזיקה, פעילויות לילדים ולמידה משותפת. האירוע התקיים באווירה חמה ומכבדת שהתאימה לכל המשתתפים.`;
      onFieldChange("participants_gained", template);
    }
  }, [formData.title, formData.description, formData.participants_gained, onFieldChange]);

  return { autoFillFromEvent };
};
