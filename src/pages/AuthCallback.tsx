
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { useEffect, useRef, useState } from "react";
import { logger } from "@/utils/logger";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const { error, isProcessing } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  const hasLoggedRef = useRef(false);
  const [processingTooLong, setProcessingTooLong] = useState(false);
  const [veryLongProcessing, setVeryLongProcessing] = useState(false);
  const navigate = useNavigate();
  
  // Log once when the component mounts
  useEffect(() => {
    if (!hasLoggedRef.current) {
      hasLoggedRef.current = true;
      log.info("Auth callback page loaded", { error, isProcessing });
    }
  }, [error, isProcessing]);

  // Add timeouts for when processing takes too long
  useEffect(() => {
    if (isProcessing) {
      // First timeout - show "processing is taking longer than expected"
      const timeoutId = setTimeout(() => {
        setProcessingTooLong(true);
      }, 8000); // 8 seconds threshold
      
      // Second timeout - show option to force navigate or retry
      const longTimeoutId = setTimeout(() => {
        setVeryLongProcessing(true);
      }, 15000); // 15 seconds for very long processing
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(longTimeoutId);
      };
    }
  }, [isProcessing]);

  if (error) {
    return <AuthCallbackError error={error} />;
  }
  
  if (veryLongProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-xl mb-4">תהליך ההתחברות לא הושלם</div>
          <p className="mb-6 text-gray-600">תהליך ההתחברות נמשך זמן רב מדי ולא הושלם כראוי. הדבר עשוי לקרות בגלל בעיות רשת או עומס על השרת.</p>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={() => navigate("/")}
              className="w-full"
            >
              חזור לדף הבית
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              נסה להתחבר שוב
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (processingTooLong) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-primary mb-4">תהליך ההתחברות נמשך זמן רב</div>
          <p className="mb-6 text-gray-600">התהליך נמשך זמן רב מהצפוי. אנו ממשיכים לעבד את בקשת ההתחברות...</p>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">ניתן להמתין או לחזור לדף הבית ולנסות שוב</p>
          <Button 
            onClick={() => navigate("/")}
            variant="ghost"
            className="mt-4"
          >
            חזור לדף הבית
          </Button>
        </div>
      </div>
    );
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
