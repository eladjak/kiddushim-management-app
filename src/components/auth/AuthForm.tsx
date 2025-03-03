
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

/**
 * Authentication form component that handles login, signup, and forgot password flows
 */
export type AuthFormProps = {
  isSignUp: boolean;
  isForgotPassword: boolean;
  setIsForgotPassword: (value: boolean) => void;
  setIsSignUp: (value: boolean) => void;
};

export const AuthForm = ({
  isSignUp,
  isForgotPassword,
  setIsForgotPassword,
  setIsSignUp,
}: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Handle Google Sign In
   */
  const signInWithGoogle = async () => {
    console.log('Attempting Google sign in');
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error("Google auth error:", error);
        throw error;
      }
      
      console.log('Google auth initiated');
      toast({
        description: "מועבר להתחברות עם Google...",
      });
    } catch (error: any) {
      console.error("Google auth error:", error);
      
      let errorMessage = `שגיאה בהתחברות עם Google: ${error.message}`;
      
      if (error.message && error.message.includes("redirect_uri_mismatch")) {
        errorMessage = `שגיאה: אי התאמה בכתובת ההפניה. יש לוודא שהכתובת הבאה מוגדרת ב-Google Cloud Console: https://uqumzjmyejlhoyliyesu.supabase.co/auth/v1/callback`;
      }
      
      toast({
        variant: "destructive",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render the appropriate form based on the current state
  if (isForgotPassword) {
    return (
      <ForgotPasswordForm 
        setIsForgotPassword={setIsForgotPassword} 
        setIsSignUp={setIsSignUp}
      />
    );
  }

  if (isSignUp) {
    return (
      <SignUpForm 
        setIsSignUp={setIsSignUp}
        onGoogleSignIn={signInWithGoogle}
      />
    );
  }

  return (
    <LoginForm 
      setIsSignUp={setIsSignUp}
      setIsForgotPassword={setIsForgotPassword}
      onGoogleSignIn={signInWithGoogle}
    />
  );
};
