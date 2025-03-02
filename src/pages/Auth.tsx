
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        navigate("/");
      }
      
      setIsLoading(false);
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        navigate("/");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary font-medium">טוען...</div>
      </div>
    );
  }

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
