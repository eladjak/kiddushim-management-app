
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EventCapacityFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EventCapacityField = ({ value, onChange }: EventCapacityFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="capacity">תגית בולטת עד 4 מילים</Label>
      <p className="text-sm text-gray-500">למשל: אירוע לציון X, מיועד לנשים בלבד וכו'</p>
      <Input
        id="capacity"
        name="capacity"
        value={value}
        onChange={onChange}
        placeholder=""
        maxLength={50}
      />
    </div>
  );
};
