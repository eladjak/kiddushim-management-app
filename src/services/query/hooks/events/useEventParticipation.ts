
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services/entity/events';
import { toast } from '@/hooks/use-toast';
import { EVENTS_KEYS } from './eventQueryKeys';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'useEventParticipation' });

/**
 * הוק לרישום משתתף לאירוע
 */
export const useRegisterParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventsService.addParticipant(eventId, userId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.participants(eventId) });
      toast({
        title: 'נרשמת לאירוע בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      log.error('Error registering participant', { error });
      toast({
        title: 'שגיאה ברישום לאירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק לביטול רישום משתתף לאירוע
 */
export const useCancelParticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventsService.removeParticipant(eventId, userId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.participants(eventId) });
      toast({
        title: 'ביטלת את ההרשמה לאירוע בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      log.error('Error canceling participation', { error });
      toast({
        title: 'שגיאה בביטול הרשמה לאירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
