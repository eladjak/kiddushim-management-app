
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { AuthCallbackError } from "@/components/auth/AuthCallbackError";
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const { error, isProcessing } = useAuthCallback();

  if (error) {
    return <AuthCallbackError error={error} />;
  }

  return <AuthCallbackLoading />;
};

export default AuthCallback;
