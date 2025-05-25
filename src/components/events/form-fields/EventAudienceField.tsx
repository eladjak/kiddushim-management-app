
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EventAudienceFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EventAudienceField = ({ value, onChange }: EventAudienceFieldProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">האם האירוע פתוח לציבור הרחב? *</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RadioGroupItem value="yes" id="audience-yes" />
          <Label htmlFor="audience-yes">כן</Label>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RadioGroupItem value="no" id="audience-no" />
          <Label htmlFor="audience-no">לא</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
