
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { Brand } from "./navigation/Brand";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { SkipToContent } from "./navigation/SkipToContent";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * קומפוננט ניווט ראשי של האפליקציה
 * 
 * מספק קישורי ניווט ובקרות אימות
 * מוצג בכל העמודים למעט עמוד הבית כאשר המשתמש אינו מחובר
 */
export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const log = logger.createLogger({ component: 'Navigation' });
  
  // בדיקה האם אנחנו בעמוד הבית
  const isIndexPage = location.pathname === "/";
  
  // סגירת תפריט נייד בעת שינוי נתיב
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  // הצגת הניווט תמיד למשתמשים מחוברים, או בעמודים שאינם הדף הראשי
  if (isIndexPage && !isAuthenticated) {
    return null;
  }

  /**
   * טיפול ביציאת משתמש
   */
  const handleLogout = async () => {
    try {
      log.info('Logout initiated', { userId: user?.id });
      
      // שימוש בפונקציית signOut מהקונטקסט
      signOut();
      
      navigate("/");
      toast({
        description: "התנתקת בהצלחה",
      });
      
      log.info('Logout successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      log.error('Logout failed', { error: errorMessage });
      toast({
        variant: "destructive",
        description: errorMessage,
      });
    }
  };

  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";

  return (
    <>
      <SkipToContent />
      <nav className="fixed top-0 right-0 left-0 bg-white shadow-sm z-50" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brand />
            </div>
          
          {!isMobile && <DesktopNav onLogout={handleLogout} />}

          {isMobile && (
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
          )}
        </div>
      </div>

      <MobileNav 
        isOpen={isOpen}
        isLoggedIn={isAuthenticated}
        isAdmin={isAdmin}
        isCoordinator={isCoordinator}
        onLogout={handleLogout}
      />
      </nav>
    </>
  );
};
