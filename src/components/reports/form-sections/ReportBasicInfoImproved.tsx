
import { ReportTitleField } from "../form-fields/ReportTitleField";
import { ReportDescriptionField } from "../form-fields/ReportDescriptionField";
import { ReportEventField } from "../form-fields/ReportEventField";
import { ReporterNameField } from "../form-fields/ReporterNameField";
import { useEventAutoFill } from "@/hooks/reports/useEventAutoFill";
import { ReportFormData } from "@/hooks/reports/useReportFormState";

interface ReportBasicInfoImprovedProps {
  events: any[];
  formData: {
    title: string;
    description: string;
    event_id: string;
    reporter_name: string;
  };
  onFieldChange: (field: keyof ReportFormData, value: any) => void;
}

export const ReportBasicInfoImproved = ({ events, formData, onFieldChange }: ReportBasicInfoImprovedProps) => {
  const { autoFillFromEvent } = useEventAutoFill(formData as ReportFormData, onFieldChange);
  
  const handleEventDetailsLoad = (eventDetails: any) => {
    console.log("ReportBasicInfoImproved - Auto-filling from event details:", eventDetails);
    autoFillFromEvent(eventDetails);
  };
  
  return (
    <div className="space-y-4">
      <ReportTitleField 
        value={formData.title}
        onChange={(e) => onFieldChange("title", e.target.value)}
      />
      
      <ReportDescriptionField 
        value={formData.description}
        onChange={(e) => onFieldChange("description", e.target.value)}
      />
      
      <ReportEventField 
        value={formData.event_id}
        events={events}
        onChange={(value) => onFieldChange("event_id", value)}
        onEventDetailsLoad={handleEventDetailsLoad}
      />
      
      <ReporterNameField 
        value={formData.reporter_name}
        onChange={(e) => onFieldChange("reporter_name", e.target.value)}
      />
    </div>
  );
};
