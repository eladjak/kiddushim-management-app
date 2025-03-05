
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getNavItems, getPublicNavItems, NavItem } from "./navItems";

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
  const location = useLocation();
  
  // Check if the current path is active
  const isActivePath = (path: string) => location.pathname === path;
  
  // Filter nav items based on user role
  const filterNavItemsByRole = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (!item.requiredRoles) return true;
      if (isAdmin && item.requiredRoles.includes("admin")) return true;
      if (isCoordinator && item.requiredRoles.includes("coordinator")) return true;
      return false;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden animate-slide-in">
      <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
        {isLoggedIn ? (
          <>
            {filterNavItemsByRole(getNavItems(isAdmin, isCoordinator)).map((item) => (
              <Button
                key={item.path}
                variant={isActivePath(item.path) ? "secondary" : "ghost"}
                className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                asChild
              >
                <Link to={item.path}>
                  {item.icon && (
                    <div className="flex items-center justify-end gap-2">
                      {item.icon}
                      {item.label}
                    </div>
                  )}
                  {!item.icon && item.label}
                </Link>
              </Button>
            ))}

            <Button
              variant="ghost"
              className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors flex items-center justify-end gap-2"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 ml-1" />
              התנתק
            </Button>
          </>
        ) : (
          <>
            {getPublicNavItems().map((item) => (
              <Button
                key={item.path}
                variant={isActivePath(item.path) ? "secondary" : "ghost"}
                className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors"
                asChild
              >
                <Link to={item.path}>
                  {item.icon && (
                    <div className="flex items-center justify-end gap-2">
                      {item.icon}
                      {item.label}
                    </div>
                  )}
                  {!item.icon && item.label}
                </Link>
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
