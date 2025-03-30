
import { useToast } from "@/hooks/use-toast";
import { supabase, getAuthStorageKey } from "@/services/supabase/client";
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
   * Clear all auth data from localStorage to avoid stale state
   */
  const clearAuthData = () => {
    log.info('Clearing auth data from localStorage');
    // Get the current storage key
    const storageKey = getAuthStorageKey();
    
    // Remove all auth related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('supabase.auth.') || key.includes(storageKey))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    log.info('Cleared auth data, keys removed:', keysToRemove.length);
  };

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
      
      // Clear any existing auth data
      clearAuthData();
      
      // Perform explicit signOut before starting a new sign in flow
      // This helps to clear any stale session state
      await supabase.auth.signOut({ scope: 'global' });
      
      // Wait a moment to ensure signOut is processed
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
      
      log.info('Google auth initiated successfully', { 
        url: data?.url,
        provider: data?.provider
      });
      
      toast({
        description: "מועבר להתחברות עם Google...",
      });
      
      // If supabase didn't redirect automatically, do it manually after a short delay
      setTimeout(() => {
        if (data?.url && authInProgressRef.current) {
          window.location.href = data.url;
        }
      }, 500);
      
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
