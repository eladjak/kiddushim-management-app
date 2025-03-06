
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReportTitleFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ReportTitleField = ({ value, onChange }: ReportTitleFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="title">כותרת</Label>
      <Input 
        id="title" 
        name="title" 
        value={value} 
        onChange={onChange} 
        required 
        placeholder="הזן כותרת לדיווח"
      />
    </div>
  );
};
