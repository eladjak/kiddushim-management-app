
/**
 * כפתור שליחת התראת WhatsApp לאירוע
 * משתמש ב-GreenAPI לשליחת הודעות
 */

import { useState } from 'react';
import { MessageCircle, Bell, X, RefreshCw, Send, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWhatsApp } from '@/hooks/whatsapp/useWhatsApp';
import type { Event } from '@/types/events';
import { NotificationType, NOTIFICATION_LABELS } from '@/types/whatsapp';
import { cn } from '@/lib/utils';

interface WhatsAppNotifyButtonProps {
  /** האירוע לשליחת התראה עליו */
  event: Event;
  /** מזהה הצ'אט ב-WhatsApp (למשל 972XXXXXXXXXX@c.us) */
  chatId: string;
  /** וריאנט הכפתור */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** גודל הכפתור */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** כיתת CSS נוספת */
  className?: string;
}

/** מיפוי סוג התראה לאייקון */
const NOTIFICATION_ICONS: Record<NotificationType, typeof MessageCircle> = {
  [NotificationType.EVENT_CREATED]: Send,
  [NotificationType.EVENT_REMINDER]: Bell,
  [NotificationType.EVENT_CANCELED]: X,
  [NotificationType.EVENT_UPDATED]: RefreshCw,
  [NotificationType.EVENT_ASSIGNMENT]: UserPlus,
  [NotificationType.GENERAL]: MessageCircle,
};

export function WhatsAppNotifyButton({
  event,
  chatId,
  variant = 'outline',
  size = 'default',
  className,
}: WhatsAppNotifyButtonProps) {
  const { sendNotification, isLoading } = useWhatsApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async (type: NotificationType) => {
    setIsOpen(false);
    await sendNotification(chatId, type, event);
  };

  const notificationTypes: NotificationType[] = [
    NotificationType.EVENT_CREATED,
    NotificationType.EVENT_REMINDER,
    NotificationType.EVENT_UPDATED,
    NotificationType.EVENT_CANCELED,
    NotificationType.EVENT_ASSIGNMENT,
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('gap-2', className)}
          disabled={isLoading}
          aria-label="שלח התראת WhatsApp"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          {size !== 'icon' && (
            <span>{isLoading ? 'שולח...' : 'WhatsApp'}</span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-start">
          שלח התראת WhatsApp
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notificationTypes.map((type) => {
          const Icon = NOTIFICATION_ICONS[type];
          const label = NOTIFICATION_LABELS[type];

          return (
            <DropdownMenuItem
              key={type}
              onClick={() => handleSend(type)}
              className="cursor-pointer"
              aria-label={`שלח ${label}`}
            >
              <Icon className="me-2 h-4 w-4" />
              <span>{label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WhatsAppNotifyButton;
