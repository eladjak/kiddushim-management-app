import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { EmailField } from "./form-fields/EmailField";
import { PasswordField } from "./form-fields/PasswordField";
import { NameField } from "./form-fields/NameField";
import { PhoneField } from "./form-fields/PhoneField";
import { AuthButtons } from "./form-actions/AuthButtons";
import { useSignUp } from "@/services/query/hooks/useAuth";
import { logger } from "@/utils/logger";

const ISRAELI_PHONE_REGEX = /^(?:\+972|0)(?:[23489]|5[0-689]|7[246789])\d{7}$/;

/**
 * Schema for sign up form validation
 */
const signUpFormSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  password: z
    .string()
    .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים")
    .max(100, "הסיסמה ארוכה מדי"),
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים"),
  phone: z
    .string()
    .regex(ISRAELI_PHONE_REGEX, "נא להזין מספר טלפון ישראלי תקין"),
});

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

/**
 * Form component for user registration
 */
export const SignUpForm = ({
  setIsSignUp,
}: {
  setIsSignUp: (value: boolean) => void;
}) => {
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'SignUpForm' });
  const signUp = useSignUp();

  // Initialize form with React Hook Form and zod validation
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
  });

  /**
   * Handle form submission for sign up
   */
  const onSubmit = async (values: SignUpFormValues) => {
    log.info('Attempting sign up with:', { email: values.email, name: values.name });
    
    try {
      await signUp.mutateAsync({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            phone: values.phone,
          },
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });
      
      log.info('Sign up successful');
      
      toast({
        description: "נשלח אימייל אימות. נא לאשר את ההרשמה.",
      });
    } catch (error) {
      log.error("Sign up submission error:", error);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת ביצוע ההרשמה. נא לנסות מאוחר יותר.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <NameField form={form} />
        <PhoneField form={form} />
        <EmailField form={form} />
        <PasswordField form={form} />
        
        <AuthButtons 
          isLoading={signUp.isPending}
          submitLabel="הרשמה"
          onToggleMode={() => setIsSignUp(false)}
          toggleModeLabel="כבר יש לך חשבון? התחבר"
        />
      </form>
    </Form>
  );
};
