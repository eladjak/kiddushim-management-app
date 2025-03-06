
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { EmailField } from "./form-fields/EmailField";
import { PasswordField } from "./form-fields/PasswordField";
import { RememberMeField } from "./form-fields/RememberMeField";
import { AuthButtons } from "./form-actions/AuthButtons";

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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    console.log('Attempting login with:', { email: values.email, rememberMe: values.rememberMe });
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log('Login successful, navigating to home');
      navigate("/");
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
        <EmailField form={form} autoFocus={true} />
        <PasswordField form={form} />
        <RememberMeField form={form} />
        
        <AuthButtons 
          isLoading={isLoading}
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
