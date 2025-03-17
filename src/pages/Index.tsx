
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { logger } from "@/utils/logger";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authProcessed, setAuthProcessed] = useState(false);
  const log = logger.createLogger({ component: 'IndexPage' });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle access token in URL hash - process auth directly when present
  useEffect(() => {
    // This runs once on mount to check if there's an auth hash
    if (window.location.hash && !authProcessed) {
      try {
        // Process authentication directly without parsing the hash
        const processAuth = async () => {
          setIsRedirecting(true);
          log.info("Processing auth directly from Index page");
          
          try {
            // Let Supabase handle the hash extraction
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              log.error("Error getting session:", { error });
              setIsRedirecting(false);
              setAuthProcessed(true);
              // Clean the URL regardless of error
              window.history.replaceState({}, document.title, window.location.pathname);
              return;
            }

            if (data.session) {
              log.info("Auth successful, cleaning URL and reloading");
              
              // Successfully authenticated, clean the URL
              window.history.replaceState({}, document.title, "/");
              
              // Mark as processed
              setAuthProcessed(true);
              
              // Wait a moment before reload to ensure state is updated
              setTimeout(() => {
                window.location.reload();
              }, 100);
            } else {
              log.warn("No session found after auth attempt");
              setIsRedirecting(false);
              setAuthProcessed(true);
              // Clean URL anyway
              window.history.replaceState({}, document.title, "/");
            }
          } catch (e) {
            log.error("Error during auth processing:", e);
            setIsRedirecting(false);
            setAuthProcessed(true);
            // Clean URL on error
            window.history.replaceState({}, document.title, "/");
          }
        };
        
        // Run the auth processing
        processAuth();
      } catch (error) {
        log.error("Auth processing failed:", error);
        setIsRedirecting(false);
        setAuthProcessed(true);
        // Clean URL on outer error
        window.history.replaceState({}, document.title, "/");
      }
    } else {
      // No hash or already processed, mark as processed
      setAuthProcessed(true);
    }
  }, []);

  // Set loading state based on auth status
  useEffect(() => {
    // Skip any loading logic if we're redirecting or haven't processed auth
    if (isRedirecting || !authProcessed) return;

    log.info("Processing regular page load", { 
      authenticated: !!user,
      authLoading,
      hasProfile: !!profile
    });

    // If auth is no longer loading, or we have a user, we can stop loading
    if (!authLoading || user) {
      setLoading(false);
    }
    
    // Additional timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        log.warn("Auth loading timed out");
        setLoadingTimedOut(true);
        setLoading(false);
      }
    }, 800); // Shorter timeout
    
    return () => clearTimeout(timeout);
  }, [authLoading, user, profile, loading, isRedirecting, authProcessed]);

  // If we're redirecting, show a dedicated loading state
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-primary font-medium mb-4">מעבד פרטי התחברות...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show loading state if still loading and not timed out
  if ((loading || authLoading) && !loadingTimedOut) {
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

export default Index;
