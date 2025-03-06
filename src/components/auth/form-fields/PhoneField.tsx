
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface PhoneFieldProps {
  form: UseFormReturn<any>;
  label?: string;
  placeholder?: string;
}

export const PhoneField = ({ 
  form, 
  label = "טלפון", 
  placeholder = "050-0000000"
}: PhoneFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-right block">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="tel"
                placeholder={placeholder}
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                {...field}
              />
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </FormControl>
          <FormMessage className="text-right" />
        </FormItem>
      )}
    />
  );
};
