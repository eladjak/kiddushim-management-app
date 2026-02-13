
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/dashboard/useNotifications";
import { NotificationsList } from "./NotificationsList";

export const NotificationsDropdown = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(user?.id);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`התראות${unreadCount > 0 ? ` - ${unreadCount} לא נקראו` : ''}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground" aria-hidden="true">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationsList 
          notifications={notifications}
          isLoading={isLoading}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
};
