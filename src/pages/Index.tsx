
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
import { useDirectSessionCheck } from "@/hooks/index/useDirectSessionCheck";
import { useDebugMode } from "@/hooks/index/useDebugMode";
import { useAutoProfileCreation } from "@/hooks/auth/useAutoProfileCreation";
import { DebugPanel } from "@/components/index/DebugPanel";
import { DebugModeToggle } from "@/components/index/DebugModeToggle";

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const log = logger.createLogger({ component: 'IndexPage' });
  
  // Handle redirects for OAuth callback URLs
  useAuthRedirect();
  
  // Auto-create profile if user is authenticated but has no profile
  useAutoProfileCreation();
  
  // Check session directly to help with debugging
  const { directSessionInfo } = useDirectSessionCheck(user);
  
  // Handle debug mode toggle
  const { debugMode, enterDebugMode, exitDebugMode } = useDebugMode();
  
  // Handle profile creation functionality
  const { 
    isCreatingProfile, 
    creationAttempts, 
    createProfileManually, 
    handleSignOut 
  } = useProfileCreation(user);

  // Handle loading state and timeouts
  const { 
    loading, 
    loadingTimedOut, 
    showProfileCreatingMessageRef 
  } = useLoadingState(user, profile, authLoading);

  // Force reset history after login to prevent back-button issues
  useEffect(() => {
    if (user && profile) {
      log.info("User authenticated and has profile, updating history state");
      // Replace the current history entry to prevent going back to auth pages
      window.history.replaceState({}, document.title, "/");
    }
  }, [user, profile]);

  if (debugMode) {
    return (
      <DebugPanel 
        directSessionInfo={directSessionInfo} 
        onSignOut={handleSignOut} 
        onExitDebugMode={exitDebugMode}
      />
    );
  }

  // Show loading state if still loading and not timed out
  if ((loading || authLoading) && !loadingTimedOut) {
    return (
      <div>
        <LoadingScreen />
        <DebugModeToggle onEnterDebugMode={enterDebugMode} />
      </div>
    );
  }

  // Handle timed out loading but show appropriate content based on auth state
  if (loadingTimedOut && !user) {
    // Assume user is not authenticated after timeout
    log.info("Loading timed out, showing welcome screen");
    return (
      <div>
        <WelcomeScreen />
        <DebugModeToggle onEnterDebugMode={enterDebugMode} />
      </div>
    );
  }

  // User is authenticated and has a profile, show the dashboard
  if (user && profile) {
    log.info("Rendering dashboard for authenticated user");
    return (
      <div>
        <Dashboard />
        <DebugModeToggle onEnterDebugMode={enterDebugMode} />
      </div>
    );
  }

  // User is authenticated but no profile yet, and we've waited long enough
  if (user && !profile && (showProfileCreatingMessageRef.current || creationAttempts > 0)) {
    return (
      <div>
        <ProfileCreationScreen
          isCreatingProfile={isCreatingProfile}
          creationAttempts={creationAttempts}
          onCreateProfile={createProfileManually}
          onRefresh={() => window.location.reload()}
          onSignOut={handleSignOut}
        />
        <DebugModeToggle onEnterDebugMode={enterDebugMode} />
      </div>
    );
  }

  // User is authenticated but no profile yet - shorter wait
  if (user && !profile) {
    log.info("User authenticated but no profile found");
    return (
      <div>
        <LoadingScreen message="טוען פרופיל משתמש..." />
        <DebugModeToggle onEnterDebugMode={enterDebugMode} />
      </div>
    );
  }

  // Default: user not authenticated, show welcome screen
  log.info("Rendering welcome screen for unauthenticated user");
  return (
    <div>
      <WelcomeScreen />
      <DebugModeToggle onEnterDebugMode={enterDebugMode} />
    </div>
  );
};

export default Index;
