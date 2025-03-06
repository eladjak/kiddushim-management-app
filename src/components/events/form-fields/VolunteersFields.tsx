
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormItem } from "@/components/ui/form";

interface VolunteersFieldsProps {
  formData: {
    requiredServiceGirls: number;
    requiredYouthVolunteers: number;
    cleanupTime: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const VolunteersFields = ({ formData, onChange }: VolunteersFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormItem className="space-y-2">
        <Label htmlFor="cleanupTime">שעת סיום</Label>
        <Input 
          id="cleanupTime" 
          name="cleanupTime" 
          type="time" 
          value={formData.cleanupTime} 
          onChange={onChange} 
          required 
        />
      </FormItem>
      
      <FormItem className="space-y-2">
        <Label htmlFor="requiredServiceGirls">בנות שירות נדרשות</Label>
        <Input 
          id="requiredServiceGirls" 
          name="requiredServiceGirls" 
          type="number" 
          min="0"
          value={formData.requiredServiceGirls} 
          onChange={onChange} 
        />
      </FormItem>
      
      <FormItem className="space-y-2">
        <Label htmlFor="requiredYouthVolunteers">מתנדבי נוער נדרשים</Label>
        <Input 
          id="requiredYouthVolunteers" 
          name="requiredYouthVolunteers" 
          type="number" 
          min="0"
          value={formData.requiredYouthVolunteers} 
          onChange={onChange} 
        />
      </FormItem>
    </div>
  );
};
