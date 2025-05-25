
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportEventFieldProps {
  value: string;
  events: any[];
  onChange: (value: string) => void;
}

export const ReportEventField = ({ value, events, onChange }: ReportEventFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>אירוע</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="בחר אירוע" />
        </SelectTrigger>
        <SelectContent>
          {events.length > 0 ? (
            events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title || 'אירוע ללא כותרת'}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-events">אין אירועים זמינים</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
