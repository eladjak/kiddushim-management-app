
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { Brand } from "./navigation/Brand";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";

/**
 * Main navigation component for the application
 * 
 * Provides navigation links and authentication controls
 */
export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'Navigation' });

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      log.info('Logout initiated', { userId: user?.id });
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        description: "התנתקת בהצלחה",
      });
      log.info('Logout successful', { userId: user?.id });
    } catch (error: any) {
      log.error('Logout failed', { error: error.message });
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";
  const isLoggedIn = !!user;

  return (
    <nav className="fixed top-0 right-0 left-0 bg-white shadow-sm z-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Brand />
          </div>
          
          <DesktopNav 
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            isCoordinator={isCoordinator}
            onLogout={handleLogout}
          />

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              aria-expanded={isOpen}
              aria-label="תפריט ניווט"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <MobileNav 
        isOpen={isOpen}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        isCoordinator={isCoordinator}
        onLogout={handleLogout}
      />
    </nav>
  );
};
