
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { useEffect } from "react";
import { supabase } from "@/services/supabase/client";

interface AuthCallbackErrorProps {
  error: string;
}

export const AuthCallbackError = ({ error }: AuthCallbackErrorProps) => {
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'AuthCallbackError' });
  
  useEffect(() => {
    // Log the error for debugging purposes
    log.error("Authentication callback failed with error:", { error });
    
    // Make sure to clean up sensitive URL params/hashes
    if ((window.location.hash || window.location.search) && window.history.replaceState) {
      window.history.replaceState(null, document.title, window.location.pathname);
    }
  }, [error]);
  
  // Function to extract and display token from error message if present
  const formatErrorMessage = (error: string) => {
    // Check if the error contains sensitive information like tokens
    if (error.includes('access_token') || error.includes('refresh_token')) {
      return "שגיאה בעיבוד פרטי ההתחברות. נא לנסות שוב.";
    }
    
    // Handle common error cases
    if (error.includes("No session found") || error.includes("session")) {
      return "לא נמצאה סשן משתמש. ייתכן כי פג תוקף הסשן או שהתהליך לא הושלם כראוי.";
    }
    
    if (error.includes("invalid_grant")) {
      return "הרשאת הגישה פגה או אינה תקפה. נא להתחבר מחדש.";
    }
    
    return error;
  };
  
  const handleTryAgain = async () => {
    // Sign out first to clear any problematic state
    await supabase.auth.signOut();
    // Clear URL parameters
    window.location.href = "/auth";
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 mb-4 text-xl font-medium">שגיאה בהתחברות</div>
        <p className="mb-6 text-gray-700">{formatErrorMessage(error)}</p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/auth")}
            className="w-full"
          >
            חזרה לדף ההתחברות
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleTryAgain}
            className="w-full"
          >
            נסה להתחבר מחדש
          </Button>
        </div>
      </div>
    </div>
  );
};
