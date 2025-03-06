
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReporterNameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ReporterNameField = ({ value, onChange }: ReporterNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="reporter_name">שם המדווח</Label>
      <Input 
        id="reporter_name" 
        name="reporter_name" 
        value={value} 
        onChange={onChange} 
        required 
        placeholder="הזן את שמך"
      />
    </div>
  );
};
