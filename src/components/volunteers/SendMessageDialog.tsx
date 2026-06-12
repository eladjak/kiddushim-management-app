/**
 * דיאלוג שליחת הודעת WhatsApp חופשית למתנדב/ת.
 * מחובר ל-GreenAPI דרך useWhatsApp.sendMessage.
 */

import { useState } from 'react';
import { MessageCircle, Send, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWhatsApp } from '@/hooks/whatsapp/useWhatsApp';
import { phoneToChatId } from '@/utils/phone';

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** שם המתנדב/ת — לכותרת ולפנייה */
  name: string | null;
  /** מספר הטלפון של המתנדב/ת */
  phone: string | null;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  name,
  phone,
}: SendMessageDialogProps) {
  const { sendMessage, isLoading } = useWhatsApp();
  const [message, setMessage] = useState('');

  const chatId = phoneToChatId(phone);
  const displayName = name?.trim() || 'מתנדב/ת';

  const handleSend = async () => {
    if (!chatId || !message.trim()) return;

    const result = await sendMessage(chatId, message.trim());
    if (result.success) {
      setMessage('');
      onOpenChange(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setMessage('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start">
            <MessageCircle className="h-5 w-5 text-green-600" />
            שליחת הודעה ל{displayName}
          </DialogTitle>
          <DialogDescription className="text-start">
            ההודעה תישלח ב-WhatsApp ישירות למספר של המתנדב/ת.
          </DialogDescription>
        </DialogHeader>

        {chatId ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="wa-message">תוכן ההודעה</Label>
              <Textarea
                id="wa-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="כתוב/כתבי כאן את ההודעה..."
                rows={5}
                dir="rtl"
                disabled={isLoading}
                aria-label="תוכן ההודעה"
              />
            </div>
            <p className="text-xs text-muted-foreground text-start" dir="ltr">
              {chatId.replace('@c.us', '')}
            </p>
          </div>
        ) : (
          <div
            className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              למתנדב/ת זה/זו אין מספר טלפון תקין במערכת. עדכן/י את הפרופיל כדי
              לאפשר שליחת הודעות.
            </span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !chatId || !message.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading ? 'שולח...' : 'שלח הודעה'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SendMessageDialog;
