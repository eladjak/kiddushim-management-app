
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { useEffect, useRef, useState } from "react";
import { logger } from "@/utils/logger";
import { useNavigate } from "react-router-dom";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const { error, isProcessing } = useAuthCallback();
  const log = logger.createLogger({ component: 'AuthCallback' });
  const hasLoggedRef = useRef(false);
  const [processingTooLong, setProcessingTooLong] = useState(false);
  const navigate = useNavigate();
  
  // Log once when the component mounts
  useEffect(() => {
    if (!hasLoggedRef.current) {
      hasLoggedRef.current = true;
      log.info("Auth callback page loaded", { error, isProcessing });
    }
  }, [error, isProcessing]);

  // Add a timeout for when processing takes too long
  useEffect(() => {
    if (isProcessing) {
      const timeoutId = setTimeout(() => {
        setProcessingTooLong(true);
      }, 8000); // 8 seconds threshold
      
      return () => clearTimeout(timeoutId);
    }
  }, [isProcessing]);

  if (error) {
    return <AuthCallbackError error={error} />;
  }
  
  if (processingTooLong) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-primary mb-4">תהליך ההתחברות נמשך זמן רב</div>
          <p className="mb-6 text-gray-600">התהליך נמשך זמן רב מהצפוי. ייתכן שיש בעיה ביצירת הפרופיל.</p>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors mb-4 w-full"
          >
            חזור לדף הבית
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors w-full"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
