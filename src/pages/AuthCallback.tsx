
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
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback page loaded, extracting session from URL...");
        
        // The URL includes the access token and refresh token as hash parameters
        // Supabase Auth will automatically extract these and establish the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session from URL:", error);
          setError(error.message);
          setIsProcessing(false);
          return;
        }
        
        if (!data.session) {
          console.error("No session found in callback URL");
          setError("לא ניתן למצוא פרטי משתמש בקישור. אנא נסה להתחבר שוב.");
          setIsProcessing(false);
          return;
        }
        
        console.log("Successfully established session for user:", data.session.user.email);
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", data.session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
          // Continue anyway - the trigger should create the profile
        }
        
        // Check admin status if we have a profile
        if (profileData) {
          await checkAndSetAdminStatus(
            data.session.user.email || "",
            profileData.id,
            profileData.role,
            toast
          );
        }
        
        // Successfully authenticated, redirect to home
        toast({
          description: "התחברת בהצלחה!",
        });
        
        navigate("/");
      } catch (err: any) {
        console.error("Unexpected auth callback error:", err);
        setError(err.message || "שגיאה לא צפויה התרחשה במהלך ההתחברות");
        setIsProcessing(false);
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
