
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { logger } from "@/utils/logger";

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const log = logger.createLogger({ component: 'IndexPage' });

  // Clean hash from URL if present
  useEffect(() => {
    if (window.location.hash && window.location.hash.length > 0) {
      try {
        log.info("Cleaning URL hash", { hash: window.location.hash });
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        log.error("Error cleaning URL hash", { error });
      }
    }
  }, []);

  // Set loading state based on auth status
  useEffect(() => {
    log.info("Index page loaded", { 
      authenticated: !!user,
      authLoading,
      profile: profile ? 'exists' : 'missing'
    });

    // If auth is no longer loading, or we have a user, we can stop our loading
    if (!authLoading || user) {
      setLoading(false);
    }
    
    // Additional timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        log.warn("Auth loading timed out", { authLoading });
        setLoadingTimedOut(true);
        setLoading(false);
      }
    }, 3000); // Shorter timeout of 3 seconds
    
    return () => clearTimeout(timeout);
  }, [authLoading, user, profile, loading]);

  // Effect to log rendering state
  useEffect(() => {
    if (!loading && !authLoading) {
      log.info("Index page rendering", {
        user: user ? 'Authenticated' : 'Not authenticated',
        profile: profile ? 'Profile loaded' : 'No profile',
        rendering: 'In progress'
      });
    }
  }, [loading, authLoading, user, profile]);

  // Show loading state
  if (loading || (authLoading && !loadingTimedOut)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-primary font-medium mb-4">טוען...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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

  // User is authenticated but no profile yet
  if (user && !profile) {
    log.warn("User authenticated but no profile found", { userId: user.id });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-primary font-medium mb-4">מייצר פרופיל משתמש...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Default: user not authenticated, show welcome screen
  log.info("Rendering welcome screen for unauthenticated user");
  return <WelcomeScreen />;
};

export default Index;
