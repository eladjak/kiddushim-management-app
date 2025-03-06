
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface RememberMeFieldProps {
  form: UseFormReturn<any>;
  label?: string;
}

export const RememberMeField = ({ 
  form, 
  label = "זכור אותי" 
}: RememberMeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="rememberMe"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center gap-2">
          <FormControl>
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-primary rounded focus:ring-2 focus:ring-primary"
              checked={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormLabel className="text-right">{label}</FormLabel>
        </FormItem>
      )}
    />
  );
};
