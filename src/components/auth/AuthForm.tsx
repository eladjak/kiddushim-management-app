
import { useState } from "react";
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
      />
    );
  }

  return (
    <LoginForm 
      setIsSignUp={setIsSignUp}
      setIsForgotPassword={setIsForgotPassword}
    />
  );
};
