
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
      <FormLabel className="text-right block">אירוע קשור (אופציונלי)</FormLabel>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        dir="rtl"
      >
        <SelectTrigger className="w-full text-right">
          <SelectValue placeholder="בחר אירוע" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="" className="text-right">
            ללא אירוע קשור
          </SelectItem>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id} className="text-right">
              {event.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  );
};
