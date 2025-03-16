
import { useState } from "react";
import { Notification } from "@/types/notification";
import { CheckCheck, Trash2, Calendar, Users, FileText, Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { formatDistance } from "date-fns";
import { he } from "date-fns/locale";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading?: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  onClose?: () => void;
}

export const NotificationsList = ({ 
  notifications, 
  isLoading = false,
  markAsRead, 
  markAllAsRead,
  onClose
}: NotificationsListProps) => {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate if there's a link
    if (notification.link) {
      if (onClose) onClose();
      navigate(notification.link);
    } else {
      // Toggle expand if no link
      toggleExpand(notification.id);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-5 w-5 flex-shrink-0 text-blue-500" />;
      case 'assignment':
        return <Users className="h-5 w-5 flex-shrink-0 text-green-500" />;
      case 'report':
        return <FileText className="h-5 w-5 flex-shrink-0 text-amber-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />;
      case 'system':
      default:
        return <Bell className="h-5 w-5 flex-shrink-0 text-primary" />;
    }
  };
  
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), {
        addSuffix: true,
        locale: he
      });
    } catch (e) {
      return "לא ידוע";
    }
  };
  
  const hasUnreadNotifications = notifications.some(n => !n.read);
  
  if (isLoading) {
    return (
      <div className="py-4 px-2 text-center text-muted-foreground">
        טוען התראות...
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="py-4 px-2 text-center text-muted-foreground">
        אין התראות חדשות
      </div>
    );
  }
  
  return (
    <div className="w-full flex flex-col">
      {hasUnreadNotifications && (
        <div className="p-2 border-b">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-4 w-4" />
            <span>סמן הכל כנקרא</span>
          </Button>
        </div>
      )}
      
      <ScrollArea className="h-[300px]">
        <div className="divide-y">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`flex p-3 gap-3 hover:bg-muted/50 cursor-pointer ${
                !notification.read ? 'bg-muted/30' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.content}
                  </p>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {getRelativeTime(notification.created_at)}
                </p>
              </div>
              
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
