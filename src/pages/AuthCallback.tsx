
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auth callback page for handling redirects from OAuth providers
 */
const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          return;
        }
        
        // Successfully authenticated, redirect to home
        navigate("/");
      } catch (err: any) {
        console.error("Unexpected auth callback error:", err);
        setError(err.message || "An unexpected error occurred");
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
