
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EventTitleFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export const EventTitleField = ({
  value,
  onChange,
  required = true,
}: EventTitleFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="title">כותרת האירוע</Label>
      <Input 
        id="title" 
        name="title" 
        value={value} 
        onChange={onChange} 
        required={required} 
        placeholder="הזן את כותרת האירוע"
      />
    </div>
  );
};
