
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { logger } from "@/utils/logger";

/**
 * Main Index page component
 * 
 * Handles the application's entry point, displaying either the dashboard
 * for authenticated users or the welcome screen for unauthenticated users
 */
const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const [authProcessed, setAuthProcessed] = useState(false);
  const log = logger.createLogger({ component: 'IndexPage' });
  const processingRef = useRef(false);
  const mountedRef = useRef(true);

  // Process authentication hash from URL if present
  useEffect(() => {
    // Set mounted flag
    mountedRef.current = true;
    
    const processAuthHash = () => {
      if (processingRef.current || !mountedRef.current) return;
      
      const hasAuthHash = window.location.hash && window.location.hash.includes('access_token');
      
      if (hasAuthHash && !authProcessed) {
        processingRef.current = true;
        log.info("Processing auth hash from URL");
        
        try {
          // Safely clear the hash to avoid reprocessing
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          log.error("Failed to clean URL hash", { error: e });
        }
        
        if (mountedRef.current) {
          setAuthProcessed(true);
          
          // Use a safer approach to reload
          setTimeout(() => {
            try {
              if (mountedRef.current) {
                window.location.href = window.location.pathname;
              }
            } catch (e) {
              log.error("Failed to reload page", { error: e });
            }
          }, 100);
        }
      } else if (mountedRef.current && !authProcessed) {
        setAuthProcessed(true);
      }
    };
    
    processAuthHash();
    
    return () => {
      mountedRef.current = false;
    };
  }, [authProcessed]);

  // Handle loading states
  useEffect(() => {
    mountedRef.current = true;
    
    if (!authProcessed) return;

    log.info("Auth state processed", { 
      authenticated: !!user,
      hasProfile: !!profile,
      authLoading
    });

    // End loading when auth is no longer loading
    if (!authLoading && mountedRef.current) {
      setLocalLoading(false);
    }
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (localLoading && mountedRef.current) {
        log.warn("Loading timed out");
        setLocalLoading(false);
      }
    }, 1500);
    
    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
    };
  }, [authLoading, user, profile, authProcessed, localLoading]);

  // Loading state
  if ((localLoading || authLoading) && authProcessed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-primary font-medium mb-4">טוען...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // User is authenticated but profile is still loading
  if (user && !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-primary font-medium mb-4">מייצר פרופיל משתמש...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // User is authenticated and has a profile
  if (user && profile) {
    log.info("Rendering dashboard for authenticated user");
    return <Dashboard />;
  }

  // Default: user not authenticated
  log.info("Rendering welcome screen for unauthenticated user");
  return <WelcomeScreen />;
};

export default Index;
