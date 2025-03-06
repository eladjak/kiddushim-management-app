
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReportDescriptionFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ReportDescriptionField = ({ value, onChange }: ReportDescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">תיאור</Label>
      <Textarea 
        id="description" 
        name="description" 
        value={value} 
        onChange={onChange} 
        required 
        placeholder="תאר את הדיווח בהרחבה"
        className="min-h-[100px]"
      />
    </div>
  );
};
