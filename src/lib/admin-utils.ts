
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Hook to check if user should have admin permissions and grant them if needed
 */
export function useAdminCheck() {
  const { user, profile } = useAuth();
  
  useEffect(() => {
    // Only run for authenticated users with profiles
    if (!user || !profile) return;
    
    const checkAdminStatus = async () => {
      try {
        // Log current status
        logger.info("Checking admin status", {
          userId: user.id,
          email: user.email,
          currentRole: profile.role
        });
        
        // We'll use email to determine if this is an admin user
        // This is a simplified check - in production, you'd use a more secure approach
        const adminEmails = [
          "eladyk@gmail.com", 
          "admin@kidushishi.org",
          "tech@kidushishi.org"
        ];
        
        // If user has an admin email but not admin role, upgrade them
        if (adminEmails.includes(user.email) && profile.role !== "admin") {
          logger.info("Upgrading user to admin", { email: user.email });
          
          // Use type assertion for the update data
          const updateData = {
            role: "admin",
            updated_at: new Date().toISOString()
          } as any;
          
          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", user.id as any);
            
          if (error) {
            logger.error("Failed to update user role", { error });
          } else {
            logger.info("User role updated to admin successfully");
            // Force reload to apply new permissions
            window.location.reload();
          }
        }
      } catch (error) {
        logger.error("Error in admin check", { error });
      }
    };
    
    checkAdminStatus();
  }, [user, profile]);
}
