
import { useAuth } from "@/context/AuthContext";
import { getNavItems } from "./navItems";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";

interface DesktopNavProps {
  onLogout: () => Promise<void>;
}

export const DesktopNav = ({ onLogout }: DesktopNavProps) => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navItems = getNavItems(profile?.role === "admin", profile?.role === "coordinator");

  return (
    <div className="hidden md:flex h-16 items-center px-4 w-full">
      <nav className="flex-1 flex items-center space-x-6 rtl:space-x-reverse">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {user ? (
          <UserMenu onLogout={onLogout} />
        ) : (
          <Link to="/auth">
            <Button size="sm">כניסה</Button>
          </Link>
        )}
      </div>
    </div>
  );
};
