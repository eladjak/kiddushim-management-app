
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getNavItems, getPublicNavItems, NavItem } from "./navItems";

interface DesktopNavProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
  onLogout: () => Promise<void>;
}

export const DesktopNav = ({ isLoggedIn, isAdmin, isCoordinator, onLogout }: DesktopNavProps) => {
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

  return (
    <div className="hidden md:flex items-center space-x-4">
      {isLoggedIn ? (
        <>
          {filterNavItemsByRole(getNavItems(isAdmin, isCoordinator)).map((item) => (
            <Button
              key={item.path}
              variant={isActivePath(item.path) ? "secondary" : "ghost"}
              className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
              asChild
            >
              <Link to={item.path} className={item.icon ? "flex items-center" : undefined}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}

          <Button
            variant="ghost"
            className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
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
              className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
              asChild
            >
              <Link to={item.path} className={item.icon ? "flex items-center" : undefined}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
        </>
      )}
    </div>
  );
};
