
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { EmailField } from "./form-fields/EmailField";
import { PasswordField } from "./form-fields/PasswordField";
import { RememberMeField } from "./form-fields/RememberMeField";
import { AuthButtons } from "./form-actions/AuthButtons";
import { logger } from "@/utils/logger";
import { useSignIn } from "@/services/query/hooks/auth/useSignIn";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Initialize the form with React Hook Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: localStorage.getItem("rememberedEmail") || "",
      password: "",
      rememberMe: localStorage.getItem("rememberedEmail") ? true : false,
    },
  });

  // בדיקה אם המשתמש כבר מחובר
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (data?.session) {
          log.info("User already has a session, redirecting to home");
          navigate("/", { replace: true });
        }
      } catch (err) {
        log.error("Error checking session:", err);
      }
    };
    
    checkSession();
  }, [navigate]);

  /**
   * Handle form submission for login
   */
  const onSubmit = async (values: LoginFormValues) => {
    if (isRedirecting) return;
    
    log.info('Attempting login with:', { email: values.email, rememberMe: values.rememberMe });
    
    try {
      setIsRedirecting(true);
      
      // Save email if remember me is checked
      if (values.rememberMe) {
        localStorage.setItem("rememberedEmail", values.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      const result = await signIn.mutateAsync({
        email: values.email,
        password: values.password,
        options: {
          // Use browser localStorage for persistent sessions if remember me is checked
          data: {
            persistent_session: values.rememberMe
          }
        }
      });
      
      log.info("Login successful, redirecting to home", { userId: result.user?.id });
      
      // אם ההתחברות הצליחה, נעבור לדף הבית
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
      
    } catch (error) {
      // הטיפול בשגיאות מתבצע בהוק useSignIn
      log.error("Login submission error:", { error });
      setIsRedirecting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <EmailField form={form} autoFocus={true} />
        <PasswordField form={form} />
        <RememberMeField form={form} />
        
        <AuthButtons 
          isLoading={signIn.isPending || isRedirecting}
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
