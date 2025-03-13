
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export interface CreateNotificationParams {
  userId: string;
  content: string;
  type: 'event' | 'assignment' | 'report' | 'system' | 'alert';
  link?: string;
  metadata?: Record<string, any>;
}

export const createNotification = async ({
  userId,
  content,
  type,
  link,
  metadata = {}
}: CreateNotificationParams) => {
  const log = logger.createLogger({ component: 'NotificationUtils' });
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        content,
        type,
        link,
        metadata
      })
      .select();

    if (error) {
      throw error;
    }

    log.info("Notification created", { 
      notificationId: data?.[0]?.id,
      userId,
      type 
    });
    
    return { success: true, notification: data?.[0] };
  } catch (error: any) {
    log.error("Error creating notification", { error, userId });
    return { success: false, error };
  }
};

export const getNotificationTypeIcon = (type: string) => {
  switch (type) {
    case 'event':
      return 'Calendar';
    case 'assignment':
      return 'Users';
    case 'report':
      return 'FileText';
    case 'alert':
      return 'AlertTriangle';
    case 'system':
    default:
      return 'Bell';
  }
};
