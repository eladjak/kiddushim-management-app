
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { logger } from "@/utils/logger";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'IndexPage' });

  useEffect(() => {
    const init = async () => {
      try {
        log.info("Index page loaded", { 
          authenticated: !!user,
          dataLoading: { status: loading }
        });
        
        // Give the auth system a moment to stabilize
        setTimeout(() => {
          setLoading(false);
        }, 1000); // Increased timeout to ensure auth is fully processed
        
      } catch (error) {
        log.error("Error initializing index page", { error });
        setLoading(false);
      }
    };

    init();
  }, [user]);

  // Separate logging to prevent excessive calls
  useEffect(() => {
    if (!loading && !authLoading) {
      log.info("Index page rendering", {
        user: user ? 'Authenticated' : 'Not authenticated',
        rendering: 'In progress'
      });
    }
  }, [loading, authLoading, user]);

  // Show loading state while authentication is in progress
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary font-medium">טוען...</div>
      </div>
    );
  }

  // User is authenticated, show the dashboard
  if (user && profile) {
    log.info("Rendering dashboard for authenticated user");
    return <Dashboard />;
  }

  // User not authenticated, show welcome screen
  log.info("Rendering welcome screen for unauthenticated user");
  return <WelcomeScreen />;
};

export default Index;
