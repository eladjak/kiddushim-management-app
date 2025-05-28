
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateTimeFieldsProps {
  formData: {
    date: string;
    setupTime: string;
    mainTime: string;
    cleanupTime: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DateTimeFields = ({ formData, onChange }: DateTimeFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">תאריך ושעת התחלה *</Label>
        <Input 
          id="date" 
          name="date" 
          type="datetime-local" 
          value={formData.date} 
          onChange={onChange} 
          required 
        />
      </div>
    </div>
  );
};
