
import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notification } from "@/hooks/dashboard/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationsList = ({
  notifications,
  isLoading,
  markAsRead,
  markAllAsRead,
}: NotificationsListProps) => {
  const navigate = useNavigate();
  const [displayCount, setDisplayCount] = useState(5);
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">טוען התראות...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-gray-500">אין התראות חדשות</p>
      </div>
    );
  }

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    
    // Navigate based on notification metadata if needed
    // This would need to be enhanced based on your navigation needs
  };
  
  const visibleNotifications = notifications.slice(0, displayCount);
  const hasMore = notifications.length > displayCount;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h3 className="font-medium">התראות</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={markAllAsRead}
          disabled={notifications.every(n => n.read)}
          className="text-xs flex items-center"
        >
          <CheckCheck className="h-4 w-4 mr-1" />
          סמן הכל כנקרא
        </Button>
      </div>
      
      <ScrollArea className="h-[350px]">
        {visibleNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`p-3 m-2 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted'}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow text-right">
                <h4 className="font-medium">{notification.type}</h4>
                <p className="text-sm text-gray-600 mb-1">{notification.content}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(notification.created_at), 'dd בMMMM, HH:mm', { locale: he })}
                </p>
              </div>
              {notification.read ? (
                <Check className="h-4 w-4 text-muted-foreground" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-primary"></div>
              )}
            </div>
          </Card>
        ))}
        
        {hasMore && (
          <Button 
            variant="ghost" 
            className="w-full text-xs py-1 mt-2"
            onClick={() => setDisplayCount(prev => prev + 5)}
          >
            טען עוד
          </Button>
        )}
      </ScrollArea>
    </div>
  );
};
