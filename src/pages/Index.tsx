
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
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, profile, isLoading: authLoading, session } = useAuth();
  const log = logger.createLogger({ component: 'IndexPage' });
  const navigate = useNavigate();
  const sessionCheckedRef = useRef(false);
  const [directSessionInfo, setDirectSessionInfo] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

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
          setDirectSessionInfo("שגיאה בבדיקת הסשן: " + error.message);
          return;
        }
        
        const sessionInfo = {
          hasSession: !!data.session,
          currentUser: !!user,
          sessionUserId: data.session?.user?.id,
          contextUserId: user?.id
        };
        
        log.info("Index page direct session check:", sessionInfo);
        setDirectSessionInfo(
          "מידע ישיר מהסשן: " + 
          (data.session ? "יש סשן" : "אין סשן") + 
          (data.session?.user ? `, ID: ${data.session.user.id.slice(0, 6)}...` : "")
        );
        
        // If we have a session but user isn't set in context, force reload
        if (data.session && !user) {
          log.info("Session exists but user not in context, forcing reload");
          window.location.reload();
        }
      } catch (err) {
        log.error("Error in direct session check:", err);
        setDirectSessionInfo("שגיאה בבדיקת הסשן הישירה");
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

  if (debugMode) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">מצב דיאגנוסטיקה</h1>
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <h2 className="font-bold">מידע מקונטקסט האימות:</h2>
            <p>מצב טעינה: {authLoading ? "טוען" : "סיים טעינה"}</p>
            <p>משתמש: {user ? `נמצא (${user.id.slice(0, 6)}...)` : "לא נמצא"}</p>
            <p>סשן: {session ? `נמצא (${session.access_token.slice(0, 10)}...)` : "לא נמצא"}</p>
            <p>פרופיל: {profile ? `נמצא (${profile.name})` : "לא נמצא"}</p>
          </div>
          
          <div>
            <h2 className="font-bold">בדיקת סשן ישירה:</h2>
            <p>{directSessionInfo || "טרם נבדק"}</p>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button onClick={() => setDebugMode(false)}>
              חזרה למסך רגיל
            </Button>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              עבור לדף התחברות
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              התנתקות
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              רענן דף
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if still loading and not timed out
  if ((loading || authLoading) && !loadingTimedOut) {
    return (
      <div>
        <LoadingScreen />
        <div className="text-center p-4">
          <button 
            onClick={() => setDebugMode(true)}
            className="text-xs text-gray-400 hover:underline"
          >
            מצב דיאגנוסטיקה
          </button>
        </div>
      </div>
    );
  }

  // Handle timed out loading but show appropriate content based on auth state
  if (loadingTimedOut && !user) {
    // Assume user is not authenticated after timeout
    log.info("Loading timed out, showing welcome screen");
    return (
      <div>
        <WelcomeScreen />
        <div className="text-center p-4">
          <button 
            onClick={() => setDebugMode(true)}
            className="text-xs text-gray-400 hover:underline"
          >
            מצב דיאגנוסטיקה
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has a profile, show the dashboard
  if (user && profile) {
    log.info("Rendering dashboard for authenticated user");
    return (
      <div>
        <Dashboard />
        <div className="text-center p-4">
          <button 
            onClick={() => setDebugMode(true)}
            className="text-xs text-gray-400 hover:underline"
          >
            מצב דיאגנוסטיקה
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated but no profile yet, and we've waited long enough
  if (user && !profile && (showProfileCreatingMessageRef.current || creationAttempts > 0)) {
    return (
      <div>
        <ProfileCreationScreen
          isCreatingProfile={isCreatingProfile}
          creationAttempts={creationAttempts}
          onCreateProfile={createProfileManually}
          onRefresh={() => window.location.reload()}
          onSignOut={handleSignOut}
        />
        <div className="text-center p-4">
          <button 
            onClick={() => setDebugMode(true)}
            className="text-xs text-gray-400 hover:underline"
          >
            מצב דיאגנוסטיקה
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated but no profile yet - shorter wait
  if (user && !profile) {
    log.info("User authenticated but no profile found");
    return (
      <div>
        <LoadingScreen message="טוען פרופיל משתמש..." />
        <div className="text-center p-4">
          <button 
            onClick={() => setDebugMode(true)}
            className="text-xs text-gray-400 hover:underline"
          >
            מצב דיאגנוסטיקה
          </button>
        </div>
      </div>
    );
  }

  // Default: user not authenticated, show welcome screen
  log.info("Rendering welcome screen for unauthenticated user");
  return (
    <div>
      <WelcomeScreen />
      <div className="text-center p-4">
        <button 
          onClick={() => setDebugMode(true)}
          className="text-xs text-gray-400 hover:underline"
        >
          מצב דיאגנוסטיקה
        </button>
      </div>
    </div>
  );
};

export default Index;
