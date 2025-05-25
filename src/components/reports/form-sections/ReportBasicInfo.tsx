
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
      />
      
      <ReporterNameField 
        value={formData.reporter_name}
        onChange={(e) => onFieldChange("reporter_name", e.target.value)}
      />
    </div>
  );
};
