
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventDurationFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EventDurationField = ({ value, onChange }: EventDurationFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="duration">משך האירוע בשעות</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="לחץ, אורך ציין X למשל" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">שעה אחת</SelectItem>
          <SelectItem value="1.5">שעה וחצי</SelectItem>
          <SelectItem value="2">שעתיים</SelectItem>
          <SelectItem value="2.5">שעתיים וחצי</SelectItem>
          <SelectItem value="3">3 שעות</SelectItem>
          <SelectItem value="3.5">3.5 שעות</SelectItem>
          <SelectItem value="4">4 שעות</SelectItem>
          <SelectItem value="4.5">4.5 שעות</SelectItem>
          <SelectItem value="5">5 שעות</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
