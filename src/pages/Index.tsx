
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { logger } from "@/utils/logger";

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const log = logger.createLogger({ component: 'IndexPage' });
  const mountedRef = useRef(true);
  const navigate = useNavigate();
  const hashCheckedRef = useRef(false);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showProfileCreatingMessageRef = useRef(false);

  // Handle access token in URL hash - redirect to auth callback
  useEffect(() => {
    if (hashCheckedRef.current) return;
    hashCheckedRef.current = true;
    
    // Check if there's an auth hash (OAuth callback)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      log.info("Detected auth hash, redirecting to callback page");
      
      if (mountedRef.current) {
        // Redirect to the auth callback page to handle the login properly
        navigate("/auth/callback", { replace: true });
      }
      return;
    }
    
    log.info("No auth hash detected, proceeding with normal page load");
  }, [navigate]);

  // Set loading state based on auth status
  useEffect(() => {
    if (!mountedRef.current) return;
    
    // If auth is no longer loading, or we have a user, we can stop loading
    if (!authLoading || user) {
      if (mountedRef.current) setLoading(false);
    }
    
    // Additional timeout to prevent infinite loading
    timeoutIdRef.current = setTimeout(() => {
      if (loading && mountedRef.current) {
        log.warn("Auth loading timed out");
        setLoadingTimedOut(true);
        setLoading(false);
      }
    }, 800);
    
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [authLoading, user, loading]);

  // Set a timeout to show profile creating message if needed
  useEffect(() => {
    if (user && !profile && !authLoading) {
      log.warn("User authenticated but no profile found", {
        userId: user.id.substring(0, 8) + '...',
        email: user.email
      });
      
      // After 3 seconds of waiting for profile, show the profile creating message
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && user && !profile) {
          showProfileCreatingMessageRef.current = true;
          // Force re-render by updating some state
          setLoading(prev => !prev);
        }
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, profile, authLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

  // User is authenticated but no profile yet, and we've waited long enough
  if (user && !profile && showProfileCreatingMessageRef.current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-primary font-medium mb-4">מייצר פרופיל משתמש...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <div className="text-sm text-gray-600 max-w-md text-center px-4">
          זה עשוי לקחת מספר רגעים. אם ההמתנה נמשכת זמן רב, אנא רענן את הדף או התנתק והתחבר שוב.
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          רענן דף
        </button>
      </div>
    );
  }

  // User is authenticated but no profile yet - shorter wait
  if (user && !profile) {
    log.warn("User authenticated but no profile found");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-primary font-medium mb-4">טוען פרופיל משתמש...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Default: user not authenticated, show welcome screen
  log.info("Rendering welcome screen for unauthenticated user");
  return <WelcomeScreen />;
};

export default Index;
