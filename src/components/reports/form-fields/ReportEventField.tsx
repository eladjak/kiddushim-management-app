
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

interface ReportEventFieldProps {
  events: any[];
}

export const ReportEventField = ({ events }: ReportEventFieldProps) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="event_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>אירוע</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר אירוע" />
              </SelectTrigger>
            </FormControl>
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
        </FormItem>
      )}
    />
  );
};
