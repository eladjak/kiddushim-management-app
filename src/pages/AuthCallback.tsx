
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkAndSetAdminStatus } from "@/lib/admin-utils";
import { useToast } from "@/hooks/use-toast";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback page loaded, checking session...");
        
        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Auth session error:", sessionError);
          setError(sessionError.message);
          return;
        }
        
        if (!sessionData.session) {
          console.log("No session found, attempting to exchange code for session...");
          
          // Exchange auth code for session if needed (this step is usually handled automatically)
          const { data: authData, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error("Auth data error:", authError);
            setError(authError.message);
            return;
          }
          
          if (!authData.user) {
            console.error("Auth callback completed but no user found");
            setError("לא ניתן לאמת את ההתחברות. אנא נסה שוב.");
            return;
          }
        }
        
        // Recheck session after exchange
        const { data: finalSessionData, error: finalSessionError } = await supabase.auth.getSession();
        
        if (finalSessionError) {
          console.error("Final session error:", finalSessionError);
          setError(finalSessionError.message);
          return;
        }
        
        // If we have a session, check if user should be an admin
        if (finalSessionData.session?.user) {
          console.log("User authenticated:", finalSessionData.session.user.email);
          toast({
            description: "התחברת בהצלחה!",
          });
          
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("id", finalSessionData.session.user.id)
            .single();
            
          if (profileData) {
            await checkAndSetAdminStatus(
              finalSessionData.session.user.email || "",
              profileData.id,
              profileData.role,
              toast
            );
          }
        } else {
          console.error("Auth callback completed but session is missing");
          setError("ההתחברות הושלמה, אך לא ניתן למצוא את נתוני המשתמש. אנא נסה שוב.");
          return;
        }
        
        // Successfully authenticated, redirect to home
        navigate("/");
      } catch (err: any) {
        console.error("Unexpected auth callback error:", err);
        setError(err.message || "שגיאה לא צפויה התרחשה במהלך ההתחברות");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">שגיאה בהתחברות</div>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => navigate("/auth")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            חזרה לדף ההתחברות
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-4 text-lg font-medium">מתחבר למערכת...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
