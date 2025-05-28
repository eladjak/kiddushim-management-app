
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { useAuthCallbackFlow } from "@/hooks/auth-callback/useAuthCallbackFlow";
import { useAuthCallbackState } from "@/hooks/auth-callback/useAuthCallbackState";

/**
 * דף זה מטפל בקולבק OAuth ובהקמת סשן
 * יש להגדיר אותו ככתובת הפניה בספקי אימות
 */
const AuthCallback = () => {
  const { loading, error } = useAuthCallbackState();
  
  // הפעלת פלואו הקולבק
  useAuthCallbackFlow();

  if (loading) {
    return <AuthCallbackLoading />;
  }

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
