
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthForm } from "@/components/auth/AuthForm";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <AuthHeader
          isSignUp={isSignUp}
          isForgotPassword={isForgotPassword}
          onBackClick={() => setIsForgotPassword(false)}
        />
        <CardContent>
          <AuthForm
            isSignUp={isSignUp}
            isForgotPassword={isForgotPassword}
            setIsForgotPassword={setIsForgotPassword}
            setIsSignUp={setIsSignUp}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
