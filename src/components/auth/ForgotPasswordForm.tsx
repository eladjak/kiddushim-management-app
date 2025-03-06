
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { EmailField } from "./form-fields/EmailField";

/**
 * Schema for forgot password form validation
 */
const forgotPasswordSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

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
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  /**
   * Handle form submission for password reset
   */
  const onSubmit = async (values: ForgotPasswordValues) => {
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
        <EmailField 
          form={form} 
          label="אימייל" 
          autoFocus={true}
        />
        
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-10"
          >
            {isLoading ? "טוען..." : "שלח קישור לאיפוס סיסמה"}
          </Button>
          
          <div className="flex flex-col gap-1 mt-1">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsForgotPassword(false)}
              className="text-sm text-gray-500 hover:text-primary hover:underline h-8 font-normal"
            >
              חזרה להתחברות
            </Button>
            
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsSignUp(true);
                setIsForgotPassword(false);
              }}
              className="text-sm text-gray-500 hover:text-primary hover:underline h-8 font-normal"
            >
              אין לך חשבון? הירשם עכשיו
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
