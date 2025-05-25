
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReportTitleFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReportTitleField = ({ value, onChange }: ReportTitleFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="report-title">כותרת הדיווח *</Label>
      <Input
        id="report-title"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="הזן כותרת לדיווח..."
        required
      />
    </div>
  );
};
