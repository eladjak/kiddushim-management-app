
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getNavItems } from "./navItems";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, User, LogOut } from "lucide-react";
import { useOnClickOutside } from "@/hooks/use-click-outside";

interface MobileNavProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
  onLogout: () => Promise<void>;
}

export const MobileNav = ({ 
  isOpen, 
  isLoggedIn, 
  isAdmin, 
  isCoordinator,
  onLogout 
}: MobileNavProps) => {
  const [closing, setClosing] = useState(false);
  const isMobile = useIsMobile();
  const navRef = useRef<HTMLDivElement>(null);
  const navItems = getNavItems(isAdmin, isCoordinator);
  
  // Handle outside clicks to close menu
  useOnClickOutside(navRef, () => {
    if (isOpen && !closing) {
      handleClose();
    }
  });
  
  const handleClose = () => {
    if (!isOpen) return;
    
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
    }, 300);
  };

  // Don't render at all if not on mobile
  if (!isMobile) return null;

  // Animation classes
  const animationClass = isOpen 
    ? "translate-x-0 opacity-100" 
    : "translate-x-full opacity-0";
  
  return (
    <div
      className={`md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div 
        ref={navRef}
        className={`fixed top-0 left-0 bottom-0 right-0 w-3/4 max-w-xs bg-white shadow-xl transition-transform duration-300 transform ${animationClass} h-full`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">תפריט ניווט</h2>
            
            <div className="space-y-1 mb-6">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="block py-2 px-3 rounded-md hover:bg-secondary text-base"
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link to="/notifications" className="flex items-center py-2 px-3 rounded-md hover:bg-secondary">
                  <Bell className="h-5 w-5 ml-2" />
                  <span>התראות</span>
                </Link>
                
                <Link to="/profile" className="flex items-center py-2 px-3 rounded-md hover:bg-secondary">
                  <User className="h-5 w-5 ml-2" />
                  <span>פרופיל</span>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start mt-2" 
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5 ml-2" />
                  <span>התנתק</span>
                </Button>
              </div>
            ) : (
              <Button asChild className="w-full">
                <Link to="/auth">התחבר</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
