
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EventDurationFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EventDurationField = ({ value, onChange }: EventDurationFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="duration">משך האירוע בשעות *</Label>
      <p className="text-sm text-gray-500">למשל, עבור אירוע של שעה וחצי יש להזין 1.5</p>
      <Input
        id="duration"
        name="duration"
        type="number"
        step="0.5"
        min="0.5"
        max="12"
        value={value}
        onChange={onChange}
        placeholder=""
        required
      />
    </div>
  );
};
