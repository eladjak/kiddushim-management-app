import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { EmailField } from "./form-fields/EmailField";
import { PasswordField } from "./form-fields/PasswordField";
import { RememberMeField } from "./form-fields/RememberMeField";
import { AuthButtons } from "./form-actions/AuthButtons";
import { logger } from "@/utils/logger";
import { useSignIn } from "@/services/query/hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * Schema for login form validation
 */
const loginFormSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

/**
 * Form component for user login
 */
export const LoginForm = ({
  setIsSignUp,
  setIsForgotPassword,
}: {
  setIsSignUp: (value: boolean) => void;
  setIsForgotPassword: (value: boolean) => void;
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'LoginForm' });
  const signIn = useSignIn();

  // Initialize form with React Hook Form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  /**
   * Handle form submission for login
   */
  const onSubmit = async (values: LoginFormValues) => {
    log.info('Attempting login with:', { email: values.email, rememberMe: values.rememberMe });
    
    try {
      await signIn.mutateAsync({
        email: values.email,
        password: values.password,
      });
      
      // אם ההתחברות הצליחה, נעבור לדף הבית
      navigate("/");
    } catch (error: any) {
      // הטיפול בשגיאות מתבצע בהוק useSignIn
      log.error("Login submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <EmailField form={form} autoFocus={true} />
        <PasswordField form={form} />
        <RememberMeField form={form} />
        
        <AuthButtons 
          isLoading={signIn.isPending}
          submitLabel="התחברות"
          onForgotPassword={() => setIsForgotPassword(true)}
          onToggleMode={() => setIsSignUp(true)}
          toggleModeLabel="אין לך חשבון? הירשם עכשיו"
          forgotPasswordLabel="שכחת סיסמה?"
        />
      </form>
    </Form>
  );
};
