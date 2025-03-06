
import { FormItem, FormLabel } from "@/components/ui/form";
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
    <FormItem className="space-y-2">
      <FormLabel>אירוע קשור (אופציונלי)</FormLabel>
      <Select 
        value={value} 
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full">
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
    </FormItem>
  );
};
