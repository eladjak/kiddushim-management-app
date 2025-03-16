
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
      log.info("Cleaning URL hash", { hash: window.location.hash });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        log.info("Index page loaded", { 
          authenticated: !!user,
          authLoading,
          profile: profile ? 'exists' : 'missing',
          dataLoading: { status: loading }
        });
        
        // Give the auth system a moment to stabilize
        const timeout = setTimeout(() => {
          setLoading(false);
          
          // If still loading auth after timeout, set a flag
          if (authLoading) {
            setLoadingTimedOut(true);
            log.warn("Auth loading timed out", { authLoading });
          }
        }, 3000); // Increased timeout to ensure auth is fully processed
        
        return () => clearTimeout(timeout);
      } catch (error) {
        log.error("Error initializing index page", { error });
        setLoading(false);
      }
    };

    init();
  }, [user, profile, authLoading]);

  // Extra check for redirect if needed
  useEffect(() => {
    // If we have timed out but now have user data, we can stop showing loading
    if (loadingTimedOut && user && profile) {
      log.info("Loaded user data after timeout", { 
        user: user ? 'Authenticated' : 'Not authenticated',
        profile: profile ? 'Profile loaded' : 'No profile'
      });
      setLoadingTimedOut(false);
      setLoading(false);
    }
  }, [loadingTimedOut, user, profile]);

  // Separate logging to prevent excessive calls
  useEffect(() => {
    if (!loading && !authLoading) {
      log.info("Index page rendering", {
        user: user ? 'Authenticated' : 'Not authenticated',
        profile: profile ? 'Profile loaded' : 'No profile',
        rendering: 'In progress'
      });
    }
  }, [loading, authLoading, user, profile]);

  // Show extended loading state while authentication is in progress
  if (loading || authLoading || loadingTimedOut) {
    // If loading takes too long, show a message
    const loadingMessage = loadingTimedOut ? 
      "טוען... זה לוקח קצת יותר זמן מהצפוי" : 
      "טוען...";
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-primary font-medium mb-4">{loadingMessage}</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle case where we have a user but no profile yet
  if (user && !profile) {
    log.warn("User authenticated but no profile found", { userId: user.id });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-primary font-medium mb-4">מייצר פרופיל משתמש...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // User is authenticated and has a profile, show the dashboard
  if (user && profile) {
    log.info("Rendering dashboard for authenticated user");
    return <Dashboard />;
  }

  // User not authenticated, show welcome screen
  log.info("Rendering welcome screen for unauthenticated user");
  return <WelcomeScreen />;
};

export default Index;
