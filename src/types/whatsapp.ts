
/**
 * טיפוסים עבור שירות WhatsApp (GreenAPI)
 */

/** סוגי התראות */
export enum NotificationType {
  EVENT_CREATED = 'event_created',       // אירוע חדש נוצר
  EVENT_REMINDER = 'event_reminder',     // תזכורת לאירוע
  EVENT_CANCELED = 'event_canceled',     // אירוע בוטל
  EVENT_UPDATED = 'event_updated',       // אירוע עודכן
  EVENT_ASSIGNMENT = 'event_assignment', // שיוך לאירוע
  GENERAL = 'general',                   // הודעה כללית
}

/** תצורת GreenAPI */
export interface WhatsAppConfig {
  instanceId: string;
  apiToken: string;
  baseUrl: string;
}

/** הודעת WhatsApp יוצאת */
export interface WhatsAppMessage {
  chatId: string;
  message: string;
}

/** תשובת GreenAPI לשליחת הודעה */
export interface WhatsAppSendResponse {
  idMessage: string;
}

/** שגיאת GreenAPI */
export interface WhatsAppErrorResponse {
  message: string;
  statusCode?: number;
}

/** תוצאת שליחת הודעה */
export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/** תווית התראה בעברית */
export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  [NotificationType.EVENT_CREATED]: 'אירוע חדש',
  [NotificationType.EVENT_REMINDER]: 'תזכורת',
  [NotificationType.EVENT_CANCELED]: 'ביטול אירוע',
  [NotificationType.EVENT_UPDATED]: 'עדכון אירוע',
  [NotificationType.EVENT_ASSIGNMENT]: 'שיוך לאירוע',
  [NotificationType.GENERAL]: 'הודעה כללית',
};
