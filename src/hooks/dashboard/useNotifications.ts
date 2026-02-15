
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { Notification, NotificationType } from "@/types/notification";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook for managing user notifications
 */
export const useNotifications = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const log = logger.createLogger({ component: 'useNotifications' });
  
  // Local state for unread count
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  /**
   * Fetch notifications from Supabase
   */
  const fetchNotifications = async (): Promise<Notification[]> => {
    if (!userId) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId as any)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Convert the data to our Notification type with a proper type assertion
      const notifications = data as unknown as Notification[];
      
      // Update unread count
      const unreadNotifications = notifications.filter(notif => !notif.read);
      setUnreadCount(unreadNotifications.length);
      
      log.info("Notifications fetched successfully", { 
        count: notifications.length,
        unreadCount: unreadNotifications.length 
      });
      
      return notifications;
    } catch (error) {
      log.error("Failed to fetch notifications", { error });
      toast({
        variant: "destructive",
        description: "שגיאה בטעינת התראות"
      });
      return [];
    }
  };
  
  /**
   * Mark a notification as read
   */
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    
    try {
      log.info("Marking notification as read", { notificationId });
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true } as any)
        .eq("id", notificationId as any)
        .eq("user_id", userId as any);
      
      if (error) {
        throw error;
      }
      
      // Update local state after successful operation
      queryClient.invalidateQueries({ 
        queryKey: ["notifications", userId] 
      });
      
      log.info("Notification marked as read", { notificationId });
    } catch (error) {
      log.error("Failed to mark notification as read", { error, notificationId });
      toast({
        variant: "destructive",
        description: "שגיאה בעדכון התראה"
      });
    }
  };
  
  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      log.info("Marking all notifications as read");
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true } as any)
        .eq("user_id", userId as any)
        .eq("read", false as any);
      
      if (error) {
        throw error;
      }
      
      // Update local state after successful operation
      setUnreadCount(0);
      queryClient.invalidateQueries({ 
        queryKey: ["notifications", userId] 
      });
      
      toast({
        description: "כל ההתראות סומנו כנקראו"
      });
      
      log.info("All notifications marked as read");
    } catch (error) {
      log.error("Failed to mark all notifications as read", { error });
      toast({
        variant: "destructive",
        description: "שגיאה בעדכון התראות"
      });
    }
  };
  
  // Setup React Query for notifications
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: fetchNotifications,
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Mutation for marking notifications as read
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["notifications", userId] 
      });
    }
  });
  
  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["notifications", userId] 
      });
    }
  });
  
  // Setup realtime subscription to notifications
  useEffect(() => {
    if (!userId) return;
    
    log.info("Setting up notifications subscription", { userId });
    
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        log.info("New notification received", { payload });
        
        // Show toast for new notification
        toast({
          description: payload.new.content
        });
        
        // Update queries
        queryClient.invalidateQueries({ 
          queryKey: ["notifications", userId] 
        });
      })
      .subscribe();
      
    return () => {
      log.info("Cleaning up notifications subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, toast]);
  
  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    isError,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
};
