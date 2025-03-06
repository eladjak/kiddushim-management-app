
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface NameFieldProps {
  form: UseFormReturn<any>;
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
        <FormItem>
          <FormLabel className="text-right block">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder={placeholder}
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                {...field}
              />
              <UserPlus className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </FormControl>
          <FormMessage className="text-right" />
        </FormItem>
      )}
    />
  );
};
