import { Menu, LogOut, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { Image } from "@/components/ui/image";

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
  
  // Check if the current path is active
  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 right-0 left-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Image 
                src="/kidushishi-logo.png" 
                alt="קידושישי" 
                className="h-12 ml-2" 
                fallback="/placeholder.svg"
              />
              <span className="text-xl font-semibold text-primary">קידושישי</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant={isActivePath('/') ? "secondary" : "ghost"}
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/">דף הבית</Link>
                </Button>
                
                <Button
                  variant={isActivePath('/events') ? "secondary" : "ghost"}
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/events">אירועים</Link>
                </Button>

                <Button
                  variant={isActivePath('/documentation') ? "secondary" : "ghost"}
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/documentation">תיעוד</Link>
                </Button>

                {(isAdmin || isCoordinator) && (
                  <Button
                    variant={isActivePath('/volunteers') ? "secondary" : "ghost"}
                    className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                    asChild
                  >
                    <Link to="/volunteers">מתנדבים</Link>
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    variant={isActivePath('/users') ? "secondary" : "ghost"}
                    className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                    asChild
                  >
                    <Link to="/users">ניהול משתמשים</Link>
                  </Button>
                )}

                <Button
                  variant={isActivePath('/reports') ? "secondary" : "ghost"}
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/reports">דיווחים</Link>
                </Button>

                <Button
                  variant={isActivePath('/equipment') ? "secondary" : "ghost"}
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/equipment">ציוד</Link>
                </Button>

                <Button
                  variant="ghost"
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 ml-1" />
                  התנתק
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={isActivePath('/documentation') ? "secondary" : "ghost"}
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/documentation">
                    <FileText className="h-4 w-4 ml-1" />
                    תיעוד הפרויקט
                  </Link>
                </Button>
                
                <Button
                  variant={isActivePath('/auth') ? "secondary" : "ghost"}
                  className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/auth">התחבר</Link>
                </Button>
              </>
            )}
          </div>

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

      {isOpen && (
        <div className="md:hidden animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {user ? (
              <>
                <Button
                  variant={isActivePath('/') ? "secondary" : "ghost"}
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/">דף הבית</Link>
                </Button>
                
                <Button
                  variant={isActivePath('/events') ? "secondary" : "ghost"}
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/events">אירועים</Link>
                </Button>

                <Button
                  variant={isActivePath('/documentation') ? "secondary" : "ghost"}
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/documentation">תיעוד</Link>
                </Button>

                {(isAdmin || isCoordinator) && (
                  <Button
                    variant={isActivePath('/volunteers') ? "secondary" : "ghost"}
                    className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                    asChild
                  >
                    <Link to="/volunteers">מתנדבים</Link>
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    variant={isActivePath('/users') ? "secondary" : "ghost"}
                    className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                    asChild
                  >
                    <Link to="/users">ניהול משתמשים</Link>
                  </Button>
                )}

                <Button
                  variant={isActivePath('/reports') ? "secondary" : "ghost"}
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/reports">דיווחים</Link>
                </Button>

                <Button
                  variant={isActivePath('/equipment') ? "secondary" : "ghost"}
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/equipment">ציוד</Link>
                </Button>

                <Button
                  variant="ghost"
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors flex items-center justify-end gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 ml-1" />
                  התנתק
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={isActivePath('/documentation') ? "secondary" : "ghost"}
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/documentation">
                    <div className="flex items-center justify-end gap-2">
                      <FileText className="h-4 w-4 ml-1" />
                      תיעוד הפרויקט
                    </div>
                  </Link>
                </Button>
                
                <Button
                  variant={isActivePath('/auth') ? "secondary" : "ghost"}
                  className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link to="/auth">התחבר</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
