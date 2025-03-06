
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface RememberMeFieldProps {
  form: UseFormReturn<any>;
}

export const RememberMeField = ({ form }: RememberMeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="rememberMe"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-2 space-x-reverse mb-2">
          <FormControl>
            <Checkbox 
              checked={field.value} 
              onCheckedChange={field.onChange} 
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
            />
          </FormControl>
          <FormLabel className="text-sm text-gray-600 font-normal cursor-pointer">זכור אותי</FormLabel>
        </FormItem>
      )}
    />
  );
};
