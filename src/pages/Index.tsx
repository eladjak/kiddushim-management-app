
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LoadingScreen } from "@/components/dashboard/LoadingScreen";
import { ProfileCreationScreen } from "@/components/dashboard/ProfileCreationScreen";
import { logger } from "@/utils/logger";
import { useAuthRedirect } from "@/hooks/index/useAuthRedirect";
import { useProfileCreation } from "@/hooks/index/useProfileCreation";
import { useLoadingState } from "@/hooks/index/useLoadingState";
import { useAutoProfileCreation } from "@/hooks/auth/useAutoProfileCreation";

const isDev = import.meta.env.DEV;

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const log = logger.createLogger({ component: 'IndexPage' });

  useAuthRedirect();
  useAutoProfileCreation();

  const {
    isCreatingProfile,
    creationAttempts,
    createProfileManually,
    handleSignOut
  } = useProfileCreation(user);

  const {
    loading,
    loadingTimedOut,
    showProfileCreatingMessageRef
  } = useLoadingState(user, profile, authLoading);

  useEffect(() => {
    if (user && profile) {
      log.info("User authenticated and has profile, updating history state");
      window.history.replaceState({}, document.title, "/");
    }
  }, [user, profile]);

  if ((loading || authLoading) && !loadingTimedOut) {
    return <LoadingScreen />;
  }

  if (loadingTimedOut && !user) {
    log.info("Loading timed out, showing welcome screen");
    return <WelcomeScreen />;
  }

  if (user && profile) {
    return <Dashboard />;
  }

  if (user && !profile && (showProfileCreatingMessageRef.current || creationAttempts > 0)) {
    return (
      <ProfileCreationScreen
        isCreatingProfile={isCreatingProfile}
        creationAttempts={creationAttempts}
        onCreateProfile={createProfileManually}
        onRefresh={() => window.location.reload()}
        onSignOut={handleSignOut}
      />
    );
  }

  if (user && !profile) {
    log.info("User authenticated but no profile found");
    return <LoadingScreen message="טוען פרופיל משתמש..." />;
  }

  return <WelcomeScreen />;
};

export default Index;
