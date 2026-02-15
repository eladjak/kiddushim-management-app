
import { useToast } from "@/hooks/use-toast";
import { supabase, configureAuthProvider, getNormalizedDomain, clearAuthStorage } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { FcGoogle } from "react-icons/fc";
import { generateSafePKCEString, storeCodeVerifier } from "@/utils/encoding";

/**
 * Google authentication button component
 * Handles the Google OAuth sign-in flow with improved Hebrew support
 */
export const GoogleAuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const authInProgressRef = useRef(false);
  const log = logger.createLogger({ component: 'GoogleAuthButton' });

  /**
   * Gets a normalized redirect URL with www subdomain if needed
   */
  const getRedirectUrl = () => {
    const normalizedDomain = getNormalizedDomain();
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    const baseUrl = `${protocol}//${normalizedDomain}${port}`;
    const redirectPath = "/auth/callback";
    const fullRedirectUrl = `${baseUrl}${redirectPath}`;
    
    log.info('Generated redirect URL:', { redirectUrl: fullRedirectUrl });
    return fullRedirectUrl;
  };

  /**
   * Initiates Google Sign In flow with improved PKCE handling
   */
  const handleGoogleSignIn = async () => {
    // מניעת לחיצות מרובות
    if (authInProgressRef.current || isLoading) return;
    
    log.info('מתחיל תהליך התחברות עם Google');
    
    try {
      setIsLoading(true);
      authInProgressRef.current = true;
      
      // ניקוי נתוני אימות קודמים לפני תחילת תהליך חדש
      try {
        clearAuthStorage();
        log.info('ניקוי מצב אימות קודם הסתיים בהצלחה');
      } catch (signOutError) {
        log.warn('שגיאה בניקוי מצב אימות:', { error: signOutError });
      }
      
      // השהייה קצרה לפני התחלת תהליך חדש
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // קבלת כתובת הפניה מתאימה עם קידומת www אם נדרש
      const redirectTo = getRedirectUrl();
      
      // יצירת code verifier עבור PKCE - שימוש בפונקציה הבטוחה שתומכת בעברית
      // הגדלנו מ-96 ל-128 לאנטרופיה חזקה יותר
      const codeVerifier = generateSafePKCEString(128);
      
      try {
        // שמירת מפתח ה-code verifier בכל דרך אפשרית לשרידות
        storeCodeVerifier(codeVerifier);
        
        log.info('נוצר ונשמר code verifier עבור PKCE', { 
          verifierLength: codeVerifier.length,
          verifierStart: codeVerifier.substring(0, 5) + '...'
        });
      } catch (storageError) {
        log.error('שגיאה בשמירת code verifier:', { error: storageError });
      }
      
      // קביעת ספק האימות עם הפרמטרים המתאימים
      configureAuthProvider('google');
      
      // סופבייס דורש מאיתנו לקבוע את סוג הזרימה
      const options = {
        redirectTo,
        skipBrowserRedirect: false,
        scopes: 'email profile',
        queryParams: {
          access_type: 'offline', 
          prompt: 'select_account',
          hd: '*', // לאפשר כל דומיין
          hl: 'he', // הגדרת שפה לעברית
        }
      };
      
      // התחלת תהליך האימות עם אפשרויות מפורטות
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.url) {
        throw new Error("לא התקבלה כתובת התחברות מתאימה");
      }
      
      log.info('התחברות Google יצאה לדרך, מעביר אל:', { 
        provider: data.provider,
        urlLength: data.url.length
      });
      
      toast({
        description: "מועבר להתחברות עם Google...",
      });
      
      // שמירת מידע על מצב האימות לאמינות
      try {
        const timestamp = new Date().toISOString();
        localStorage.setItem('auth_redirect_initiated', 'true');
        localStorage.setItem('auth_redirect_time', timestamp);
        localStorage.setItem('auth_provider', 'google');
        
        // העברת ה-code verifier גם לפרמטר בשם אחר למקרה של בעיות
        localStorage.setItem('pkce_code_verifier', codeVerifier);
        sessionStorage.setItem('pkce_code_verifier', codeVerifier);
      } catch (e) {
        log.error('לא ניתן לשמור מצב אימות לאחסון', { error: e });
      }
      
      // מעבר לכתובת האימות של Google
      window.location.href = data.url;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "שגיאה לא ידועה";
      log.error("שגיאה באימות Google:", { error: errorMsg });

      let errorMessage = `שגיאה בהתחברות עם Google: ${errorMsg}`;

      if (errorMsg.includes("redirect_uri_mismatch")) {
        errorMessage = `שגיאה: אי התאמה בכתובת ההפניה. יש לוודא שהכתובת ${getRedirectUrl()} מוגדרת ב-Google Cloud Console`;
      }

      toast({
        variant: "destructive",
        description: errorMessage,
      });

      // איפוס המצב
      setIsLoading(false);
      authInProgressRef.current = false;
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full h-10 border border-gray-200 hover:bg-secondary/50 transition-all duration-200 flex items-center justify-center gap-2"
      data-testid="google-auth-button"
    >
      <FcGoogle className="w-4 h-4" />
      {isLoading ? "טוען..." : "התחבר עם Google"}
    </Button>
  );
};
