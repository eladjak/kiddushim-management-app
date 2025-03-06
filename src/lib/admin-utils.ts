
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoleType } from "@/types/profile";

// List of admin email addresses
export const ADMIN_EMAILS = [
  "eladjak@gmail.com",
  "eladhiteclearning@gmail.com"
];

/**
 * Hook to automatically check and update admin status on login
 */
export const useAdminCheck = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Only run this check if we have a user and profile
    if (user && profile) {
      checkAndSetAdminStatus(user.email, profile.id, profile.role, toast);
    }
  }, [user, profile, toast]);

  return null;
};

/**
 * Check if user should be an admin and update their role if needed
 */
export const checkAndSetAdminStatus = async (
  email: string | undefined, 
  userId: string,
  currentRole: RoleType,
  toast: any
) => {
  if (!email) return;
  
  // If user is in the admin list but doesn't have admin role, update it
  if (ADMIN_EMAILS.includes(email.toLowerCase()) && currentRole !== "admin") {
    try {
      console.log(`Setting admin role for user: ${email}`);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          role: "admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
        
      if (error) throw error;
      
      console.log(`Admin role set successfully for: ${email}`);
      toast({
        description: "הרשאות ניהול הופעלו בהצלחה",
      });
      
      // Force reload for the changes to take effect in the UI
      window.location.reload();
      
    } catch (error: any) {
      console.error("Error setting admin status:", error);
      toast({
        variant: "destructive",
        description: `שגיאה בהגדרת הרשאות ניהול: ${error.message}`,
      });
    }
  }
};
