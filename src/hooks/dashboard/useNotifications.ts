
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  metadata?: any;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'Notifications' });

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          throw error;
        }

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        
        log.info("Notifications loaded", { count: data?.length });
      } catch (error: any) {
        log.error("Error fetching notifications", { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        log.info("New notification received", { payload });
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for new notification
        toast({
          title: (payload.new as Notification).title,
          description: (payload.new as Notification).message,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      log.info("Notification marked as read", { notificationId });
    } catch (error: any) {
      log.error("Error marking notification as read", { error });
    }
  };

  const markAllAsRead = async () => {
    if (!userId || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      
      log.info("All notifications marked as read");
    } catch (error: any) {
      log.error("Error marking all notifications as read", { error });
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
};
