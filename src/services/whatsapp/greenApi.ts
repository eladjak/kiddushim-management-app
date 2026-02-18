
/**
 * שירות WhatsApp באמצעות GreenAPI
 * שליחת הודעות WhatsApp לאירועים, תזכורות והתראות
 */

import { logger } from '@/utils/logger';
import type { Event } from '@/types/events';
import type {
  WhatsAppConfig,
  WhatsAppMessage,
  WhatsAppSendResponse,
  WhatsAppSendResult,
} from '@/types/whatsapp';
import { NotificationType } from '@/types/whatsapp';

const log = logger.createLogger({ component: 'GreenApiService' });

// ─── Configuration ──────────────────────────────────────────────

function getConfig(): WhatsAppConfig {
  const instanceId = import.meta.env.VITE_GREEN_API_INSTANCE_ID ?? '';
  const apiToken = import.meta.env.VITE_GREEN_API_TOKEN ?? '';

  if (!instanceId || !apiToken) {
    log.warn('GreenAPI credentials not configured. Set VITE_GREEN_API_INSTANCE_ID and VITE_GREEN_API_TOKEN.');
  }

  return {
    instanceId,
    apiToken,
    baseUrl: `https://api.green-api.com/waInstance${instanceId}`,
  };
}

// ─── Formatters (Hebrew message templates) ──────────────────────

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return '';
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
}

function buildEventNotificationMessage(event: Event): string {
  const date = formatDate(event.date);
  const time = formatTime(event.main_time);
  const location = event.location_name || event.location || '';

  return [
    `📋 *אירוע חדש נוצר!*`,
    '',
    `*${event.title}*`,
    date ? `📅 תאריך: ${date}` : '',
    time ? `🕐 שעה: ${time}` : '',
    location ? `📍 מיקום: ${location}` : '',
    event.parasha ? `📖 פרשה: ${event.parasha}` : '',
    '',
    'לפרטים נוספים היכנסו למערכת הניהול.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildEventReminderMessage(event: Event, hoursUntil: number): string {
  const date = formatDate(event.date);
  const time = formatTime(event.main_time);
  const location = event.location_name || event.location || '';

  const hoursText =
    hoursUntil < 1
      ? 'בקרוב'
      : hoursUntil === 1
        ? 'בעוד שעה'
        : `בעוד ${hoursUntil} שעות`;

  return [
    `⏰ *תזכורת - אירוע ${hoursText}!*`,
    '',
    `*${event.title}*`,
    date ? `📅 תאריך: ${date}` : '',
    time ? `🕐 שעה: ${time}` : '',
    location ? `📍 מיקום: ${location}` : '',
    '',
    'אנא וודאו הגעה. תודה!',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildEventCanceledMessage(event: Event): string {
  const date = formatDate(event.date);

  return [
    `❌ *אירוע בוטל*`,
    '',
    `*${event.title}*`,
    date ? `📅 תאריך: ${date}` : '',
    '',
    'האירוע בוטל. לפרטים נוספים פנו למנהל/ת.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildEventUpdatedMessage(event: Event): string {
  const date = formatDate(event.date);
  const time = formatTime(event.main_time);
  const location = event.location_name || event.location || '';

  return [
    `🔄 *עדכון אירוע*`,
    '',
    `*${event.title}*`,
    date ? `📅 תאריך: ${date}` : '',
    time ? `🕐 שעה: ${time}` : '',
    location ? `📍 מיקום: ${location}` : '',
    '',
    'פרטי האירוע עודכנו. בדקו את הפרטים המלאים במערכת.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildEventAssignmentMessage(event: Event): string {
  const date = formatDate(event.date);
  const time = formatTime(event.main_time);

  return [
    `👤 *שויכת לאירוע!*`,
    '',
    `*${event.title}*`,
    date ? `📅 תאריך: ${date}` : '',
    time ? `🕐 שעה: ${time}` : '',
    '',
    'שויכת לאירוע זה. אנא וודא/י הגעה.',
  ]
    .filter(Boolean)
    .join('\n');
}

// ─── Message builder by notification type ──────────────────────

interface BuildMessageOptions {
  type: NotificationType;
  event: Event;
  hoursUntil?: number;
}

function buildMessageByType({ type, event, hoursUntil }: BuildMessageOptions): string {
  switch (type) {
    case NotificationType.EVENT_CREATED:
      return buildEventNotificationMessage(event);
    case NotificationType.EVENT_REMINDER:
      return buildEventReminderMessage(event, hoursUntil ?? 1);
    case NotificationType.EVENT_CANCELED:
      return buildEventCanceledMessage(event);
    case NotificationType.EVENT_UPDATED:
      return buildEventUpdatedMessage(event);
    case NotificationType.EVENT_ASSIGNMENT:
      return buildEventAssignmentMessage(event);
    case NotificationType.GENERAL:
      return buildEventNotificationMessage(event);
  }
}

// ─── API Communication ─────────────────────────────────────────

async function postMessage(payload: WhatsAppMessage): Promise<WhatsAppSendResult> {
  const config = getConfig();

  if (!config.instanceId || !config.apiToken) {
    const errorMsg = 'חסרות הגדרות GreenAPI. הגדר VITE_GREEN_API_INSTANCE_ID ו-VITE_GREEN_API_TOKEN.';
    log.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  const url = `${config.baseUrl}/sendMessage/${config.apiToken}`;

  log.info('שולח הודעת WhatsApp', { chatId: payload.chatId });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error('שגיאה בשליחת הודעת WhatsApp', {
        status: response.status,
        error: errorText,
      });
      return {
        success: false,
        error: `שגיאת שרת: ${response.status} - ${errorText}`,
      };
    }

    const data = (await response.json()) as WhatsAppSendResponse;
    log.info('הודעת WhatsApp נשלחה בהצלחה', { messageId: data.idMessage });

    return { success: true, messageId: data.idMessage };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
    log.error('שגיאה בשליחת הודעת WhatsApp', { error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * שליחת הודעת טקסט ישירה
 */
export async function sendMessage(chatId: string, message: string): Promise<WhatsAppSendResult> {
  return postMessage({ chatId, message });
}

/**
 * שליחת התראת אירוע מעוצבת
 */
export async function sendEventNotification(
  chatId: string,
  event: Event,
): Promise<WhatsAppSendResult> {
  const message = buildEventNotificationMessage(event);
  return postMessage({ chatId, message });
}

/**
 * שליחת תזכורת לאירוע
 */
export async function sendEventReminder(
  chatId: string,
  event: Event,
  hoursUntil: number,
): Promise<WhatsAppSendResult> {
  const message = buildEventReminderMessage(event, hoursUntil);
  return postMessage({ chatId, message });
}

/**
 * שליחת התראה לפי סוג
 */
export async function sendNotificationByType(
  chatId: string,
  type: NotificationType,
  event: Event,
  hoursUntil?: number,
): Promise<WhatsAppSendResult> {
  const message = buildMessageByType({ type, event, hoursUntil });
  return postMessage({ chatId, message });
}

/** אובייקט השירות המלא */
export const greenApiService = {
  sendMessage,
  sendEventNotification,
  sendEventReminder,
  sendNotificationByType,
  buildMessageByType,
};

export default greenApiService;
