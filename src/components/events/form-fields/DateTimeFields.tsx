
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">תאריך</Label>
        <Input 
          id="date" 
          name="date" 
          type="date" 
          value={formData.date} 
          onChange={onChange} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="setupTime">שעת הכנות</Label>
        <Input 
          id="setupTime" 
          name="setupTime" 
          type="time" 
          value={formData.setupTime} 
          onChange={onChange} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mainTime">שעת התחלה</Label>
        <Input 
          id="mainTime" 
          name="mainTime" 
          type="time" 
          value={formData.mainTime} 
          onChange={onChange} 
          required 
        />
      </div>
    </div>
  );
};
