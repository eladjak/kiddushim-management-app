
import { useAuth } from "@/context/AuthContext";
import { Brand } from "./Brand";
import { navItems } from "./navItems";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export const DesktopNav = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="hidden md:flex h-16 items-center px-4 border-b bg-white">
      <Brand />
      
      <nav className="mx-8 flex items-center space-x-6 rtl:space-x-reverse">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={index}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="ml-auto flex items-center space-x-4 rtl:space-x-reverse">
        {user ? (
          <>
            <NotificationsDropdown />
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                פרופיל
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>
              התנתק
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button size="sm">כניסה</Button>
          </Link>
        )}
      </div>
    </div>
  );
};
