
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [authProcessed, setAuthProcessed] = useState(false);
  const log = logger.createLogger({ component: 'IndexPage' });

  // Handle authentication process
  useEffect(() => {
    // Check if there's an auth hash that needs to be processed
    const hasAuthHash = window.location.hash && window.location.hash.includes('access_token');
    
    if (hasAuthHash && !authProcessed) {
      // Clean the URL regardless of success/failure
      window.history.replaceState({}, document.title, window.location.pathname);
      setAuthProcessed(true);
      
      // Let the page reload to get the latest auth state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      setAuthProcessed(true);
    }
  }, []);

  // Set loading state based on auth status
  useEffect(() => {
    if (!authProcessed) return;

    log.info("Processing regular page load", { 
      authenticated: !!user,
      authLoading,
      hasProfile: !!profile
    });

    // If auth is no longer loading, we can stop loading
    if (!authLoading) {
      setLoading(false);
    }
    
    // Additional timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        log.warn("Auth loading timed out");
        setLoadingTimedOut(true);
        setLoading(false);
      }
    }, 800);
    
    return () => clearTimeout(timeout);
  }, [authLoading, user, profile, loading, authProcessed]);

  // Render the appropriate content based on auth state
  const renderContent = () => {
    // Show loading state if still loading
    if ((loading || authLoading) && !loadingTimedOut) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
          <div className="text-primary font-medium mb-4">טוען...</div>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    // User is authenticated and has a profile, show the dashboard
    if (user && profile) {
      log.info("Rendering dashboard for authenticated user");
      return <Dashboard />;
    }

    // User is authenticated but no profile yet
    if (user && !profile) {
      log.warn("User authenticated but no profile found");
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

  // This ensures hooks are called unconditionally
  return renderContent();
};

export default Index;
