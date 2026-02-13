
import { ReportTitleField } from "../form-fields/ReportTitleField";
import { ReportDescriptionField } from "../form-fields/ReportDescriptionField";
import { ReportEventField } from "../form-fields/ReportEventField";
import { ReporterNameField } from "../form-fields/ReporterNameField";
import { ReportFormData } from "@/hooks/reports/useReportFormState";

interface ReportBasicInfoProps {
  events: any[];
  formData: ReportFormData;
  reportType: string;
  onFieldChange: (field: keyof ReportFormData, value: any) => void;
}

export const ReportBasicInfo = ({ events, formData, onFieldChange }: ReportBasicInfoProps) => {
  const handleEventDetailsLoad = (eventDetails: any) => {

    // מילוי אוטומטי של כותרת הדיווח
    if (eventDetails.title && !formData.title) {
      onFieldChange("title", `דיווח ${eventDetails.title}`);
    }
    
    // מילוי אוטומטי של תיאור בסיסי
    if (eventDetails.parasha && eventDetails.hebrewDate && !formData.description) {
      const basicDescription = `דיווח על אירוע קידושישי פרשת ${eventDetails.parasha} שהתקיים ב${eventDetails.hebrewDate}`;
      onFieldChange("description", basicDescription);
    }
  };
  
  return (
    <div className="space-y-4">
      <ReportTitleField 
        value={formData.title || ""}
        onChange={(e) => {
          onFieldChange("title", e.target.value);
        }}
      />
      
      <ReportDescriptionField 
        value={formData.description || ""}
        onChange={(e) => {
          onFieldChange("description", e.target.value);
        }}
      />
      
      <ReportEventField 
        value={formData.event_id || ""}
        events={events}
        onChange={(value) => {
          onFieldChange("event_id", value);
        }}
        onEventDetailsLoad={handleEventDetailsLoad}
      />
      
      <ReporterNameField 
        value={formData.reporter_name || ""}
        onChange={(e) => {
          onFieldChange("reporter_name", e.target.value);
        }}
      />
    </div>
  );
};
