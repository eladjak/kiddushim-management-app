
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
  const log = logger.createLogger({ component: 'IndexPage' });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle access token in URL hash - redirect to auth callback if present
  useEffect(() => {
    // Check if we have an auth token in the URL hash (but avoid examining the actual token content)
    if (window.location.hash && window.location.hash.includes("access_token=")) {
      try {
        log.info("Detected auth hash in URL, will process it directly");
        setIsRedirecting(true);
        
        // Handle auth directly on the main page to avoid redirect issues
        // Let supabase extract the token itself
        const processAuth = async () => {
          try {
            // Attempt to extract the session from the hash
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              log.error("Error getting session from hash:", { error });
              // If there's an error, clean the URL anyway
              window.history.replaceState({}, document.title, window.location.pathname);
              setIsRedirecting(false);
              return;
            }
            
            if (data.session) {
              // Success! Clean the URL and force a reload to reset app state
              log.info("Successfully processed auth hash");
              window.history.replaceState({}, document.title, "/");
              window.location.reload();
            } else {
              // No session found, clean URL and show normal content
              log.warn("No session found in auth hash");
              window.history.replaceState({}, document.title, window.location.pathname);
              setIsRedirecting(false);
            }
          } catch (processError) {
            log.error("Error processing auth:", { error: processError });
            setIsRedirecting(false);
          }
        };
        
        processAuth();
      } catch (error) {
        log.error("Error handling auth hash:", { error });
        setIsRedirecting(false);
      }
    } else if (window.location.hash && window.location.hash.length > 0) {
      // Clean any other hash that may be in the URL
      try {
        log.info("Cleaning URL hash");
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        log.error("Error cleaning URL hash", { error });
      }
    }
  }, []);

  // Set loading state based on auth status
  useEffect(() => {
    // Skip any loading logic if we're redirecting
    if (isRedirecting) return;

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
    }, 1200); // Short timeout
    
    return () => clearTimeout(timeout);
  }, [authLoading, user, profile, loading, isRedirecting]);

  // If we're redirecting, show a dedicated loading state
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-primary font-medium mb-4">מעבד פרטי התחברות...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
