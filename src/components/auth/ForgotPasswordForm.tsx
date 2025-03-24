
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { EmailField } from "./form-fields/EmailField";
import { logger } from "@/utils/logger";
import { authService } from "@/services/supabase/auth";

/**
 * סכמה לבדיקת תקינות טופס שכחתי סיסמה
 */
const forgotPasswordSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/**
 * קומפוננט טופס לבקשת איפוס סיסמה
 */
export const ForgotPasswordForm = ({
  setIsForgotPassword,
  setIsSignUp,
}: {
  setIsForgotPassword: (value: boolean) => void;
  setIsSignUp: (value: boolean) => void;
}) => {
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'ForgotPasswordForm' });

  // אתחול הטופס עם React Hook Form ובדיקת תקינות של zod
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  /**
   * טיפול בשליחת טופס איפוס סיסמה
   */
  const onSubmit = async (values: ForgotPasswordValues) => {
    log.info('Attempting password reset for:', { email: values.email });
    
    try {
      await authService.resetPassword({ email: values.email });
      
      log.info('Password reset email sent');
      toast({
        description: "נשלח אימייל לאיפוס סיסמה. נא לבדוק את תיבת הדואר.",
      });
      setIsForgotPassword(false);
    } catch (error) {
      log.error("Password reset error:", error);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת שליחת בקשת איפוס הסיסמה",
      });
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
            disabled={form.formState.isSubmitting}
            className="w-full h-10"
          >
            {form.formState.isSubmitting ? "טוען..." : "שלח קישור לאיפוס סיסמה"}
          </Button>
          
          <div className="flex flex-col items-center gap-1 mt-4">
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
