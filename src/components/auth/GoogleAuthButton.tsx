
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

/**
 * Google authentication button component
 * Handles the Google OAuth sign-in flow
 */
export const GoogleAuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const authInProgressRef = useRef(false);
  const log = logger.createLogger({ component: 'GoogleAuthButton' });

  /**
   * Initiates Google Sign In flow
   */
  const signInWithGoogle = async () => {
    // Prevent multiple clicks
    if (authInProgressRef.current || isLoading) return;
    
    log.info('Initiating Google sign in');
    
    try {
      setIsLoading(true);
      authInProgressRef.current = true;
      
      // Create full app URL for redirect
      const origin = window.location.origin;
      const callbackPath = "/auth/callback";
      const redirectUrl = `${origin}${callbackPath}`;
      
      log.info('Using redirect URL:', { redirectUrl });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });
      
      if (error) {
        log.error("Google auth error:", { error });
        throw error;
      }
      
      log.info('Google auth initiated successfully');
      
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
      
      // Reset state
      setIsLoading(false);
      authInProgressRef.current = false;
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
