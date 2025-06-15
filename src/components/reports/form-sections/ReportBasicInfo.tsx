
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
