
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ReportEventFieldProps {
  value: string;
  events: { id: string; title: string }[];
  onValueChange: (value: string) => void;
}

export const ReportEventField = ({ value, events, onValueChange }: ReportEventFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="event_id">אירוע קשור (אופציונלי)</Label>
      <Select 
        value={value} 
        onValueChange={(value) => onValueChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="בחר אירוע" />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
