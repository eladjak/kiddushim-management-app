
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useAuthCallbackFlow } from "@/hooks/auth-callback/useAuthCallbackFlow";
import { useAuthCallbackState } from "@/hooks/auth-callback/useAuthCallbackState";
import { useEffect } from "react";
import { logger } from "@/utils/logger";

/**
 * דף זה מטפל בקולבק OAuth ובהקמת סשן
 * יש להגדיר אותו ככתובת הפניה בספקי אימות
 */
const AuthCallback = () => {
  const log = logger.createLogger({ component: 'AuthCallback' });
  const { loading, error } = useAuthCallbackState();
  
  // הפעלת פלואו הקולבק
  const { isProcessing } = useAuthCallbackFlow();

  useEffect(() => {
    log.info("AuthCallback page loaded", {
      loading,
      error,
      isProcessing,
      hasHash: !!window.location.hash,
      hasSearch: !!window.location.search
    });
  }, [loading, error, isProcessing]);

  if (loading || isProcessing) {
    return <AuthCallbackLoading />;
  }

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
