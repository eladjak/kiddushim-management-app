
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LoadingScreen } from "@/components/dashboard/LoadingScreen";
import { ProfileCreationScreen } from "@/components/dashboard/ProfileCreationScreen";
import { logger } from "@/utils/logger";
import { useAuthRedirect } from "@/hooks/index/useAuthRedirect";
import { useProfileCreation } from "@/hooks/index/useProfileCreation";
import { useLoadingState } from "@/hooks/index/useLoadingState";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const log = logger.createLogger({ component: 'IndexPage' });
  const navigate = useNavigate();
  const sessionCheckedRef = useRef(false);

  // First, perform an immediate session check - this is necessary because sometimes
  // the auth context doesn't get updated correctly
  useEffect(() => {
    if (sessionCheckedRef.current) return;
    sessionCheckedRef.current = true;
    
    const checkSession = async () => {
      log.info("Performing initial session check on index page");
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          log.error("Error checking session on index page:", error);
          return;
        }
        
        log.info("Index page direct session check:", { 
          hasSession: !!data.session,
          currentUser: !!user
        });
        
        // If we have a session but user isn't set in context, force reload
        if (data.session && !user) {
          log.info("Session exists but user not in context, forcing reload");
          window.location.reload();
        }
      } catch (err) {
        log.error("Error in direct session check:", err);
      }
    };
    
    checkSession();
  }, [user]);

  // Handle redirects for OAuth callback URLs
  useAuthRedirect();
  
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

  // Show loading state if still loading and not timed out
  if ((loading || authLoading) && !loadingTimedOut) {
    return <LoadingScreen />;
  }

  // Handle timed out loading but show appropriate content based on auth state
  if (loadingTimedOut && !user) {
    // Assume user is not authenticated after timeout
    log.info("Loading timed out, showing welcome screen");
    return <WelcomeScreen />;
  }

  // User is authenticated and has a profile, show the dashboard
  if (user && profile) {
    log.info("Rendering dashboard for authenticated user");
    return <Dashboard />;
  }

  // User is authenticated but no profile yet, and we've waited long enough
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

  // User is authenticated but no profile yet - shorter wait
  if (user && !profile) {
    log.info("User authenticated but no profile found");
    return <LoadingScreen message="טוען פרופיל משתמש..." />;
  }

  // Default: user not authenticated, show welcome screen
  log.info("Rendering welcome screen for unauthenticated user");
  return <WelcomeScreen />;
};

export default Index;
