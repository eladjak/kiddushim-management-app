
/**
 * React hook לשליחת הודעות WhatsApp דרך GreenAPI
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { greenApiService } from '@/services/whatsapp/greenApi';
import type { Event } from '@/types/events';
import type { WhatsAppSendResult } from '@/types/whatsapp';
import { NotificationType, NOTIFICATION_LABELS } from '@/types/whatsapp';

const log = logger.createLogger({ component: 'useWhatsApp' });

interface UseWhatsAppReturn {
  /** שליחת התראה לפי סוג */
  sendNotification: (
    chatId: string,
    type: NotificationType,
    event: Event,
    hoursUntil?: number,
  ) => Promise<WhatsAppSendResult>;
  /** שליחת הודעת טקסט חופשי */
  sendMessage: (chatId: string, message: string) => Promise<WhatsAppSendResult>;
  /** האם נמצא בתהליך שליחה */
  isLoading: boolean;
  /** שגיאה אחרונה */
  error: string | null;
}

export function useWhatsApp(): UseWhatsAppReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const sendNotification = useCallback(
    async (
      chatId: string,
      type: NotificationType,
      event: Event,
      hoursUntil?: number,
    ): Promise<WhatsAppSendResult> => {
      setIsLoading(true);
      setError(null);

      const label = NOTIFICATION_LABELS[type];
      log.info('שולח התראת WhatsApp', { chatId, type, eventId: event.id });

      const result = await greenApiService.sendNotificationByType(
        chatId,
        type,
        event,
        hoursUntil,
      );

      setIsLoading(false);

      if (result.success) {
        log.info('התראת WhatsApp נשלחה בהצלחה', { type, eventId: event.id });
        toast({
          title: 'הודעה נשלחה',
          description: `${label} - "${event.title}" נשלח בהצלחה ב-WhatsApp`,
        });
      } else {
        const errorMsg = result.error ?? 'שגיאה לא ידועה';
        setError(errorMsg);
        log.error('שליחת התראת WhatsApp נכשלה', { error: errorMsg, type, eventId: event.id });
        toast({
          title: 'שגיאה בשליחה',
          description: `לא ניתן לשלוח ${label}: ${errorMsg}`,
          variant: 'destructive',
        });
      }

      return result;
    },
    [toast],
  );

  const sendMessage = useCallback(
    async (chatId: string, message: string): Promise<WhatsAppSendResult> => {
      setIsLoading(true);
      setError(null);

      log.info('שולח הודעת WhatsApp', { chatId });

      const result = await greenApiService.sendMessage(chatId, message);

      setIsLoading(false);

      if (result.success) {
        log.info('הודעת WhatsApp נשלחה בהצלחה');
        toast({
          title: 'הודעה נשלחה',
          description: 'ההודעה נשלחה בהצלחה ב-WhatsApp',
        });
      } else {
        const errorMsg = result.error ?? 'שגיאה לא ידועה';
        setError(errorMsg);
        log.error('שליחת הודעת WhatsApp נכשלה', { error: errorMsg });
        toast({
          title: 'שגיאה בשליחה',
          description: `לא ניתן לשלוח את ההודעה: ${errorMsg}`,
          variant: 'destructive',
        });
      }

      return result;
    },
    [toast],
  );

  return {
    sendNotification,
    sendMessage,
    isLoading,
    error,
  };
}

export default useWhatsApp;
