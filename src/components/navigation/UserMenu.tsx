
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { User, Settings, Bell, LogOut, UserPlus } from "lucide-react";
import { useNotifications } from "@/hooks/dashboard/useNotifications";

interface UserMenuProps {
  onLogout: () => Promise<void>;
}

export const UserMenu = ({ onLogout }: UserMenuProps) => {
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications(user?.id);
  const isAdmin = profile?.role === "admin";

  if (!user || !profile) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
            <AvatarFallback className="text-xs">
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link to="/profile">
          <DropdownMenuItem>
            <User className="me-2 h-4 w-4" />
            <span>פרופיל</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/notifications">
          <DropdownMenuItem>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Bell className="me-2 h-4 w-4" />
                <span>התראות</span>
              </div>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </DropdownMenuItem>
        </Link>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <Link to="/users">
              <DropdownMenuItem>
                <UserPlus className="me-2 h-4 w-4" />
                <span>הוספת משתמש</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="me-2 h-4 w-4" />
          <span>התנתק</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
