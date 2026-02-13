
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
        <FormItem className="mb-3">
          <FormLabel className="text-right block mb-1.5 text-gray-700 text-sm font-medium">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="password"
                className="ps-10 h-10 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 text-sm"
                dir="ltr"
                {...field}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </FormControl>
          <FormMessage className="text-right mt-1 text-xs" />
        </FormItem>
      )}
    />
  );
};
