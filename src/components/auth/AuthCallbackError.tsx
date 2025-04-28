
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { useEffect } from "react";
import { supabase, clearAuthStorage } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthCallbackErrorProps {
  error: string;
}

export const AuthCallbackError = ({ error }: AuthCallbackErrorProps) => {
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'AuthCallbackError' });
  
  useEffect(() => {
    // Log the error for debugging purposes
    log.error("Authentication callback failed with error:", { error });
    
    // Make sure to clean up sensitive URL params
    if ((window.location.search || window.location.hash) && window.history.replaceState) {
      window.history.replaceState(null, document.title, window.location.pathname);
    }
    
    // Clean up any redirect counters to avoid loops
    sessionStorage.removeItem('auth_redirect_count');
  }, [error]);
  
  // Format error message to be user-friendly
  const formatErrorMessage = (error: string) => {
    // Check if the error contains sensitive information like tokens
    if (error.includes('access_token') || error.includes('refresh_token')) {
      return "שגיאה בעיבוד פרטי ההתחברות. נא לנסות שוב.";
    }
    
    // Handle certificate domain issues
    if (error.includes("kidushishi-menegment-app.co.il") && error.includes("www.kidushishi-menegment-app.co.il")) {
      return "שגיאת אבטחת HTTPS: אנא השתמש בכתובת מלאה של האתר, עם קידומת www בהתחלה - www.kidushishi-menegment-app.co.il";
    }
    
    // Handle Hebrew character encoding issues
    if (error.includes("btoa") || error.includes("Invalid character")) {
      return "שגיאת קידוד תווים בעברית. המערכת מנסה לטפל בבעיה אוטומטית, נא לנסות שוב.";
    }
    
    // Handle PKCE-specific error
    if (error.includes("both auth code and code verifier") || error.includes("pkce")) {
      return "שגיאה בתהליך האימות (PKCE). נסה להתחבר מחדש או לנקות עוגיות הדפדפן.";
    }
    
    // Handle domain redirection issues
    if (error.includes("התחברות נכשלה בגלל בעיית תעודה")) {
      return error;
    }
    
    // Handle detected redirect loop
    if (error.includes("זוהתה לולאת הפניות")) {
      return error;
    }
        
    // Handle common error cases
    if (error.includes("No session found") || error.includes("session")) {
      return "לא נמצאה סשן משתמש. ייתכן כי פג תוקף הסשן או שהתהליך לא הושלם כראוי.";
    }
    
    if (error.includes("invalid_grant")) {
      return "הרשאת הגישה פגה או אינה תקפה. נא להתחבר מחדש.";
    }
    
    if (error.includes("code exchange")) {
      return "שגיאה בהחלפת קוד אימות. ייתכן שפג תוקף הקוד או שכבר נעשה בו שימוש. נא לנסות להתחבר מחדש.";
    }

    if (error.includes("לא נמצא קוד אימות") || error.includes("התחברות נכשלה")) {
      return error;
    }
    
    return `שגיאה בתהליך ההתחברות: ${error}`;
  };
  
  const handleTryAgain = async () => {
    try {
      log.info("User clicked try again, cleaning up auth state");
      
      // Sign out to clear auth state
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clean all auth data from local storage
      clearAuthStorage();
      
      const keysToRemove = [];
      
      // Find all auth-related items in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('supabase.auth.') || key.includes('-auth-token') || key.includes('code-verifier'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      log.info("Cleaned up auth data from localStorage", { count: keysToRemove.length });
      
      // Also clean sessionStorage
      sessionStorage.removeItem('auth_redirect_count');
      sessionStorage.removeItem('auth_redirect_initiated');
      sessionStorage.removeItem('auth_redirect_time');
      
      // Redirect to auth page
      navigate("/auth", { replace: true });
    } catch (err) {
      log.error("Error in try again handler:", { error: err });
      window.location.href = "/auth";
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-2xl font-medium text-red-600">שגיאה בהתחברות</h2>
        </div>
        
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-gray-700">
            {formatErrorMessage(error)}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Button 
            onClick={handleTryAgain}
            className="w-full"
          >
            נסה להתחבר מחדש
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate("/auth")}
            className="w-full"
          >
            חזרה לדף ההתחברות
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full"
          >
            חזרה לדף הראשי
          </Button>
        </div>
      </div>
    </div>
  );
};
