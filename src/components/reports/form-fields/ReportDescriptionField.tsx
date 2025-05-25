
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReportDescriptionFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ReportDescriptionField = ({ value, onChange }: ReportDescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="report-description">תיאור הדיווח *</Label>
      <Textarea
        id="report-description"
        value={value}
        onChange={onChange}
        rows={4}
        placeholder="תאר את הדיווח בפירוט..."
        required
      />
    </div>
  );
};
