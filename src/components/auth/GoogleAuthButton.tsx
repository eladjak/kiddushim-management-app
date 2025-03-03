
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Google authentication button component
 * Handles the Google OAuth sign-in flow
 */
export const GoogleAuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Initiates Google Sign In flow
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

  return (
    <Button
      type="button"
      variant="outline"
      onClick={signInWithGoogle}
      disabled={isLoading}
      className="w-full hover:bg-secondary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      <img
        src="https://www.google.com/favicon.ico"
        alt="Google"
        className="w-4 h-4 ml-2"
      />
      {isLoading ? "טוען..." : "התחבר עם Google"}
    </Button>
  );
};
