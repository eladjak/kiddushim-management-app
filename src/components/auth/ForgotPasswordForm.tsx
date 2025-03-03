
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

/**
 * Schema for forgot password form validation
 */
const forgotPasswordSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
});

/**
 * Form component for password reset requests
 */
export const ForgotPasswordForm = ({
  setIsForgotPassword,
  setIsSignUp,
}: {
  setIsForgotPassword: (value: boolean) => void;
  setIsSignUp: (value: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form with React Hook Form and zod validation
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  /**
   * Handle form submission for password reset
   */
  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    console.log('Attempting password reset for:', values.email);
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: window.location.origin + "/auth/reset-password",
      });
      
      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }
      
      console.log('Password reset email sent');
      toast({
        description: "נשלח אימייל לאיפוס סיסמה. נא לבדוק את תיבת הדואר.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-right block">אימייל</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                    {...field}
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage className="text-right" />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "טוען..." : "שלח קישור לאיפוס סיסמה"}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsForgotPassword(false)}
            className="w-full hover:bg-secondary/50 transition-all duration-200"
          >
            חזרה להתחברות
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsSignUp(true);
              setIsForgotPassword(false);
            }}
            className="w-full hover:bg-secondary/50 transition-all duration-200"
          >
            אין לך חשבון? הירשם עכשיו
          </Button>
        </div>
      </form>
    </Form>
  );
};
