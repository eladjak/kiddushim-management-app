
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services/entity/events';
import { EventCreate, EventUpdate } from '@/types/events';
import { toast } from '@/hooks/use-toast';
import { EVENTS_KEYS } from './eventQueryKeys';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'useEventMutations' });

/**
 * הוק ליצירת אירוע חדש
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEvent: EventCreate) => eventsService.create(newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.upcoming() });
      toast({
        title: 'אירוע נוצר בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      log.error('Error creating event', { error });
      toast({
        title: 'שגיאה ביצירת אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק לעדכון אירוע
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventUpdate }) =>
      eventsService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.upcoming() });
      toast({
        title: 'אירוע עודכן בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      log.error('Error updating event', { error });
      toast({
        title: 'שגיאה בעדכון אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק למחיקת אירוע
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.upcoming() });
      queryClient.removeQueries({ queryKey: EVENTS_KEYS.detail(id) });
      toast({
        title: 'אירוע נמחק בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      log.error('Error deleting event', { error });
      toast({
        title: 'שגיאה במחיקת אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
