
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { Slider } from "@/components/ui/slider";

interface EventRatingFieldProps {
  form: UseFormReturn<FieldValues>;
  name: string;
  label: string;
}

export const EventRatingField = ({ form, name, label }: EventRatingFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{label} ({field.value})</FormLabel>
          <FormControl>
            <Slider 
              min={1} 
              max={10} 
              step={1}
              value={[field.value]} 
              onValueChange={(values) => field.onChange(values[0])}
              className="pt-2" 
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
