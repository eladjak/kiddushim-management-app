
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "@/components/ui/image";
import { Footer } from "@/components/layout/Footer";
import { logger } from "@/utils/logger";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'AuthPage' });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      setIsLoading(true);
      log.info("Auth page: Checking if user is already logged in");
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error checking session:", { error });
          setIsLoading(false);
          return;
        }
        
        log.info("Auth page session check:", { hasSession: !!data.session });
        
        if (data.session) {
          // User is logged in, redirect to home
          navigate("/", { replace: true });
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        log.error("Unexpected error checking user:", { error: err });
        setIsLoading(false);
      }
    };
    
    // Only run checkUser once on mount
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      log.info("Auth page auth state changed:", { event });
      
      if (session && (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED")) {
        log.info("User signed in, redirecting to home");
        // Use replace to avoid adding to history stack
        navigate("/", { replace: true });
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md shadow-md border border-gray-100 animate-fade-in">
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
