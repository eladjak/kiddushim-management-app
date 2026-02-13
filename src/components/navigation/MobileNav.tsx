
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getNavItems } from "./navItems";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/dashboard/useNotifications";
import { Bell, User, LogOut, UserPlus } from "lucide-react";
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
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications(user?.id);
  
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

  // Animation classes - RTL: drawer comes from right, so negative translation when closed
  const animationClass = isOpen
    ? "translate-x-0 opacity-100"
    : "-translate-x-full opacity-0";

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div
      className={`md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={navRef}
        className={`fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white shadow-xl transition-transform duration-300 transform ${animationClass} h-full`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-4">
            {isLoggedIn && profile && (
              <>
                <div className="flex items-center gap-3 mb-6 p-3 bg-secondary/10 rounded-lg">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
                      <AvatarFallback className="text-sm">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </>
            )}
            
            <h2 className="text-lg font-bold mb-4">תפריט ניווט</h2>
            
            <div className="space-y-1 mb-6">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-base"
                  >
                    {IconComponent && <IconComponent className="h-5 w-5 me-2" />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            <Separator className="my-4" />
            
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link to="/notifications" className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 me-2" />
                    <span>התראות</span>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
                
                <Link to="/profile" className="flex items-center py-2 px-3 rounded-md hover:bg-secondary">
                  <User className="h-5 w-5 me-2" />
                  <span>פרופיל</span>
                </Link>
                
                {isAdmin && (
                  <Link to="/users" className="flex items-center py-2 px-3 rounded-md hover:bg-secondary">
                    <UserPlus className="h-5 w-5 me-2" />
                    <span>הוספת משתמש</span>
                  </Link>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start mt-2" 
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5 me-2" />
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
