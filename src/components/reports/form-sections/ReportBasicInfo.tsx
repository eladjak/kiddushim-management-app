
import { useFormContext } from "react-hook-form";
import { ReportTitleField } from "../form-fields/ReportTitleField";
import { ReportDescriptionField } from "../form-fields/ReportDescriptionField";
import { ReportEventField } from "../form-fields/ReportEventField";
import { ReporterNameField } from "../form-fields/ReporterNameField";

interface ReportBasicInfoProps {
  events: any[];
}

export const ReportBasicInfo = ({ events }: ReportBasicInfoProps) => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <ReportTitleField 
        value={form.watch("title")}
        onChange={(e) => form.setValue("title", e.target.value)}
      />
      
      <ReportDescriptionField 
        value={form.watch("description")}
        onChange={(e) => form.setValue("description", e.target.value)}
      />
      
      <ReportEventField events={events} />
      
      <ReporterNameField 
        value={form.watch("reporter_name")}
        onChange={(e) => form.setValue("reporter_name", e.target.value)}
      />
    </div>
  );
};
