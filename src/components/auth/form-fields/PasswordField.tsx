
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface PasswordFieldProps {
  form: UseFormReturn<any>;
  label?: string;
}

export const PasswordField = ({ 
  form, 
  label = "סיסמה" 
}: PasswordFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-right block">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="password"
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                {...field}
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </FormControl>
          <FormMessage className="text-right" />
        </FormItem>
      )}
    />
  );
};
