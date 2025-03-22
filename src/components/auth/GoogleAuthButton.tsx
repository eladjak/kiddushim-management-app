
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

/**
 * Google authentication button component
 * Handles the Google OAuth sign-in flow
 */
export const GoogleAuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'GoogleAuthButton' });

  /**
   * Initiates Google Sign In flow
   */
  const signInWithGoogle = async () => {
    log.info('Attempting Google sign in');
    
    try {
      setIsLoading(true);
      
      // Create full app URL for redirect
      const origin = window.location.origin;
      const callbackPath = "/auth/callback";
      const redirectUrl = `${origin}${callbackPath}`;
      
      log.info('Redirect URL:', { redirectUrl });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        log.error("Google auth error:", { error });
        throw error;
      }
      
      log.info('Google auth initiated successfully:', { data });
      toast({
        description: "מועבר להתחברות עם Google...",
      });
    } catch (error: any) {
      log.error("Google auth error:", { error });
      
      let errorMessage = `שגיאה בהתחברות עם Google: ${error.message}`;
      
      if (error.message && error.message.includes("redirect_uri_mismatch")) {
        errorMessage = `שגיאה: אי התאמה בכתובת ההפניה. יש לוודא שהכתובת ${window.location.origin}/auth/callback מוגדרת ב-Google Cloud Console`;
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
      className="w-full h-10 border border-gray-200 hover:bg-secondary/50 transition-all duration-200 flex items-center justify-center gap-2"
    >
      <img
        src="https://www.google.com/favicon.ico"
        alt="Google"
        className="w-4 h-4"
      />
      {isLoading ? "טוען..." : "התחבר עם Google"}
    </Button>
  );
};
