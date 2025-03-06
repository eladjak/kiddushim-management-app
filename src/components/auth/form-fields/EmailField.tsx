
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface EmailFieldProps {
  form: UseFormReturn<any>;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const EmailField = ({ 
  form, 
  label = "אימייל", 
  placeholder = "your@email.com",
  autoFocus = false 
}: EmailFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-right block">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="email"
                placeholder={placeholder}
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                autoFocus={autoFocus}
                {...field}
              />
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </FormControl>
          <FormMessage className="text-right" />
        </FormItem>
      )}
    />
  );
};
