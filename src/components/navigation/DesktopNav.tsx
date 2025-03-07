
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";
import { navItems } from "./navItems";
import { UserDropdown } from "./UserDropdown";

export function DesktopNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex h-16 items-center px-4 border-b">
      <Brand />
      
      {/* Push nav items to the right side for RTL */}
      <div className="mr-auto flex items-center space-x-4 rtl:space-x-reverse">
        {user && (
          <nav className="flex items-center space-x-4 rtl:space-x-reverse">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                onClick={() => navigate(item.href)}
                className="text-sm font-medium transition-colors"
              >
                {item.icon && <item.icon className="ml-2 h-4 w-4" />}
                {item.label}
              </Button>
            ))}
          </nav>
        )}
      </div>
      
      <div className="flex items-center">
        {user ? (
          <UserDropdown />
        ) : (
          <Button onClick={() => navigate("/auth")} size="sm">
            התחברות
          </Button>
        )}
      </div>
    </div>
  );
}
