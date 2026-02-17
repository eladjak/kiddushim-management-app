
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportEvent } from "@/hooks/reports/useReportEvents";

interface ReportEventFieldProps {
  value: string;
  events: ReportEvent[];
  onChange: (value: string) => void;
  onEventDetailsLoad?: (eventDetails: ReportEvent) => void;
}

export const ReportEventField = ({ value, events, onChange, onEventDetailsLoad }: ReportEventFieldProps) => {
  const handleEventChange = (eventId: string) => {
    onChange(eventId);

    // מחפש את פרטי האירוע ומעביר אותם להורה
    const selectedEvent = events.find(event => event.id === eventId);
    if (selectedEvent && onEventDetailsLoad) {
      onEventDetailsLoad(selectedEvent);
    }
  };

  return (
    <div className="space-y-2">
      <Label>אירוע</Label>
      <Select 
        value={value} 
        onValueChange={handleEventChange}
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
