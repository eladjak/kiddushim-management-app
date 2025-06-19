
import { ReportTitleField } from "../form-fields/ReportTitleField";
import { ReportDescriptionField } from "../form-fields/ReportDescriptionField";
import { ReportEventField } from "../form-fields/ReportEventField";
import { ReporterNameField } from "../form-fields/ReporterNameField";

interface ReportBasicInfoProps {
  events: any[];
  formData: {
    title: string;
    description: string;
    event_id: string;
    reporter_name: string;
  };
  onFieldChange: (field: string, value: any) => void;
}

export const ReportBasicInfo = ({ events, formData, onFieldChange }: ReportBasicInfoProps) => {
  console.log("ReportBasicInfo - Events received:", events);
  console.log("ReportBasicInfo - Form data received:", formData);
  
  const handleEventDetailsLoad = (eventDetails: any) => {
    console.log("ReportBasicInfo - Auto-filling from event details:", eventDetails);
    
    // מילוי אוטומטי של כותרת הדיווח
    if (eventDetails.title && !formData.title) {
      onFieldChange("title", `דיווח ${eventDetails.title}`);
    }
    
    // מילוי אוטומטי של תיאור בסיסי
    if (eventDetails.parasha && eventDetails.hebrewDate && !formData.description) {
      const basicDescription = `דיווח על אירוע קידושישי פרשת ${eventDetails.parasha} שהתקיים ב${eventDetails.hebrewDate}`;
      onFieldChange("description", basicDescription);
    }

    // מילוי אוטומטי של תבנית participants_gained
    if (eventDetails.parasha && !formData.participants_gained) {
      const template = `באירוע פרשת ${eventDetails.parasha} השתתפו משפחות ויחידים מהקהילה המקומית. הפעילות כללה קבלת שבת משותפת עם מוזיקה, פעילויות לילדים ולמידה משותפת. האירוע התקיים באווירה חמה ומכבדת שהתאימה לכל המשתתפים.`;
      onFieldChange("participants_gained", template);
    }
  };
  
  return (
    <div className="space-y-4">
      <ReportTitleField 
        value={formData.title}
        onChange={(e) => {
          console.log("Title field change:", e.target.value);
          onFieldChange("title", e.target.value);
        }}
      />
      
      <ReportDescriptionField 
        value={formData.description}
        onChange={(e) => {
          console.log("Description field change:", e.target.value);
          onFieldChange("description", e.target.value);
        }}
      />
      
      <ReportEventField 
        value={formData.event_id}
        events={events}
        onChange={(value) => {
          console.log("Event field change:", value);
          onFieldChange("event_id", value);
        }}
        onEventDetailsLoad={handleEventDetailsLoad}
      />
      
      <ReporterNameField 
        value={formData.reporter_name}
        onChange={(e) => {
          console.log("Reporter name field change:", e.target.value);
          onFieldChange("reporter_name", e.target.value);
        }}
      />
    </div>
  );
};
