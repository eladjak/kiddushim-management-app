
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RoleType } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [creationAttempts, setCreationAttempts] = useState(0);
  const log = logger.createLogger({ component: 'IndexPage' });
  const mountedRef = useRef(true);
  const navigate = useNavigate();
  const hashCheckedRef = useRef(false);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showProfileCreatingMessageRef = useRef(false);
  const { toast } = useToast();

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

  // Function to manually create a profile
  const createProfileManually = async () => {
    if (!user || isCreatingProfile) return;
    
    try {
      setIsCreatingProfile(true);
      setCreationAttempts(prev => prev + 1);
      
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
        
      if (existingProfile) {
        toast({
          description: "הפרופיל כבר קיים, מרענן את הדף...",
        });
        window.location.reload();
        return;
      }
      
      const defaultRole: RoleType = 'coordinator';
      
      // Create new profile
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: user.user_metadata?.name || 
               user.user_metadata?.full_name || 
               user.email?.split('@')[0] || 'משתמש',
          email: user.email,
          language: 'he',
          role: defaultRole,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          shabbat_mode: false
        });
        
      if (error) {
        if (error.code === '23505') {
          toast({
            description: "הפרופיל כבר קיים, מרענן את הדף...",
          });
          window.location.reload();
        } else {
          throw error;
        }
      } else {
        toast({
          description: "פרופיל נוצר בהצלחה, מרענן את הדף...",
        });
        
        // Wait a moment for the profile to be properly saved
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      log.error("Error creating profile manually:", { error });
      toast({
        variant: "destructive",
        description: `שגיאה ביצירת פרופיל: ${error.message}`,
      });
    } finally {
      if (mountedRef.current) {
        setIsCreatingProfile(false);
      }
    }
  };

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
  if (user && !profile && (showProfileCreatingMessageRef.current || creationAttempts > 0)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-primary font-medium mb-4 text-xl">מייצר פרופיל משתמש...</div>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-sm text-gray-600 mb-6">
            יצירת הפרופיל עשויה לקחת מספר רגעים. אם ההמתנה נמשכת זמן רב, ניתן ליצור את הפרופיל באופן ידני או לרענן את הדף.
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={createProfileManually}
              disabled={isCreatingProfile}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isCreatingProfile ? "יוצר פרופיל..." : "צור פרופיל באופן ידני"}
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              רענן דף
            </Button>
          </div>
          
          {creationAttempts > 0 && (
            <div className="mt-4 text-xs text-gray-500">
              מספר ניסיונות: {creationAttempts}
            </div>
          )}
        </div>
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
