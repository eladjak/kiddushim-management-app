
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TzoharRepresentativeFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const TzoharRepresentativeField = ({ value, onChange }: TzoharRepresentativeFieldProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">האם אתם נציגים אישיים דרך הפורטל של צהר? *</Label>
      
      <RadioGroup 
        value={value ? "yes" : "no"} 
        onValueChange={(val) => onChange(val === "yes")}
        className="flex gap-6"
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RadioGroupItem value="yes" id="tzohar-yes" />
          <Label htmlFor="tzohar-yes">כן</Label>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RadioGroupItem value="no" id="tzohar-no" />
          <Label htmlFor="tzohar-no">לא</Label>
        </div>
      </RadioGroup>
      
      {value && (
        <div className="bg-blue-50 p-3 rounded text-sm">
          <p>כ. הם הגיעו וחיוו חלק מההצעלה מלוא.</p>
        </div>
      )}
    </div>
  );
};
