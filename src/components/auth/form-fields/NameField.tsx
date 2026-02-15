
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { FieldValues, UseFormReturn } from "react-hook-form";

interface NameFieldProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  label?: string;
  placeholder?: string;
}

export const NameField = ({ 
  form, 
  label = "שם מלא", 
  placeholder = "ישראל ישראלי"
}: NameFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem className="mb-3">
          <FormLabel className="text-right block mb-1.5 text-gray-700 text-sm font-medium">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder={placeholder}
                className="pe-10 h-10 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 text-sm"
                {...field}
              />
              <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </FormControl>
          <FormMessage className="text-right mt-1 text-xs" />
        </FormItem>
      )}
    />
  );
};
