
/**
 * Notification types used throughout the application
 */

/**
 * Represents a notification in the system
 */
export interface Notification {
  id: string;
  user_id: string;
  content: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
  read: boolean;
  created_at: string;
}

/**
 * Notification types supported by the system
 */
export type NotificationType = 'event' | 'assignment' | 'report' | 'system' | 'alert';

/**
 * Notification filter options for viewing notifications
 */
export interface NotificationFilters {
  type?: NotificationType;
  read?: boolean;
  limit?: number;
}

/**
 * Statistics about notifications
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}
