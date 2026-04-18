import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Footer } from "@/components/layout/Footer";
import { logger } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";

/**
 * דף אימות (התחברות/הרשמה) של המשתמש
 */
const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'AuthPage' });

  useEffect(() => {
    // אם המשתמש כבר מחובר, הפנה אותו לדף הבית
    if (isAuthenticated) {
      log.info("User already authenticated, redirecting to home");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary font-medium">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background">
      <main className="flex-grow flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md shadow-md border border-gray-100 dark:border-border animate-fade-in">
          <div className="flex justify-center pt-6 pb-2">
            <Image 
              src="/lovable-uploads/95344b3f-5084-447f-8d10-aa4f56fbb8f1.png" 
              alt="קידושישי" 
              className="h-16 md:h-20 max-w-[85%] w-auto" 
              fallback="/placeholder.svg"
            />
          </div>
          <AuthHeader
            isSignUp={isSignUp}
            isForgotPassword={isForgotPassword}
            onBackClick={() => setIsForgotPassword(false)}
          />
          <CardContent className="pb-6">
            <AuthForm
              isSignUp={isSignUp}
              isForgotPassword={isForgotPassword}
              setIsForgotPassword={setIsForgotPassword}
              setIsSignUp={setIsSignUp}
            />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
