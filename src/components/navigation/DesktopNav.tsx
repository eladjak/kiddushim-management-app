import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";
import { getNavItems, getPublicNavItems } from "./navItems";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function DesktopNav() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";

  // Filter nav items based on user role
  const navItems = user 
    ? getNavItems(isAdmin, isCoordinator).filter(item => {
        if (!item.requiredRoles) return true;
        if (isAdmin && item.requiredRoles.includes("admin")) return true;
        if (isCoordinator && item.requiredRoles.includes("coordinator")) return true;
        return false;
      })
    : getPublicNavItems();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Get initials for the avatar fallback
  const getInitials = (): string => {
    if (!profile?.name) return "U";
    
    const nameParts = profile.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
    }
    return nameParts[0].substring(0, 2);
  };

  return (
    <div className="hidden md:flex h-16 items-center px-4 border-b">
      <Brand />
      
      {/* Push nav items to the right side for RTL */}
      <div className="mr-auto flex items-center space-x-4 rtl:space-x-reverse">
        {user && (
          <nav className="flex items-center space-x-4 rtl:space-x-reverse">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className="text-sm font-medium transition-colors"
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
        )}
      </div>
      
      <div className="flex items-center">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "User"} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{profile?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 ml-2" />
                פרופיל
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 ml-2" />
                הגדרות
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                התנתקות
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => navigate("/auth")} size="sm">
            התחברות
          </Button>
        )}
      </div>
    </div>
  );
}
