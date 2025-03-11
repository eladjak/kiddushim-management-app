
import { FormItem, FormLabel } from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Event {
  id: string; 
  title: string;
  main_time: string;
  location_name?: string;
  date?: string;
  parasha?: string;
  status?: string;
}

interface ReportEventFieldProps {
  value: string;
  events: Event[];
  onValueChange: (value: string) => void;
}

export const ReportEventField = ({ value, events, onValueChange }: ReportEventFieldProps) => {
  // Group events by month
  const eventsByMonth: Record<string, Event[]> = {};
  events.forEach(event => {
    if (!event.main_time) return;
    
    const date = new Date(event.main_time);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    eventsByMonth[monthKey].push(event);
  });

  // Sort months chronologically
  const sortedMonthKeys = Object.keys(eventsByMonth).sort();

  return (
    <FormItem className="space-y-2">
      <FormLabel className="text-right block">אירוע קשור (אופציונלי)</FormLabel>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        dir="rtl"
      >
        <SelectTrigger className="w-full text-right">
          <SelectValue placeholder="בחר אירוע" />
        </SelectTrigger>
        <SelectContent className="max-h-[350px]">
          <SelectItem value="" className="text-right">
            ללא אירוע קשור
          </SelectItem>
          
          {sortedMonthKeys.map(monthKey => {
            const monthEvents = eventsByMonth[monthKey];
            const firstEventDate = new Date(monthEvents[0].main_time);
            const monthLabel = format(firstEventDate, 'MMMM yyyy', { locale: he });
            
            return (
              <div key={monthKey} className="mb-2">
                <div className="px-2 py-1 text-sm font-semibold bg-secondary/20 rounded-sm text-right">
                  {monthLabel}
                </div>
                
                {monthEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id} className="text-right">
                    <div className="flex flex-col">
                      <span>{event.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {event.main_time && format(new Date(event.main_time), "EEEE, d בMMMM", { locale: he })}
                        {event.parasha && ` - ${event.parasha}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </FormItem>
  );
};
