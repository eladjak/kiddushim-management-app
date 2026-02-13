
import { useQuery } from '@tanstack/react-query';
import { eventsService } from '@/services/entity/events';
import { toast } from '@/hooks/use-toast';
import { EVENTS_KEYS } from './eventQueryKeys';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'useEventQueries' });

/**
 * הוק לקבלת כל האירועים
 */
export const useEvents = (filters = '') => {
  return useQuery({
    queryKey: EVENTS_KEYS.list(filters),
    queryFn: () => eventsService.getAll(),
    meta: {
      onError: (error: Error) => {
        log.error('Error fetching events', { error });
        toast({
          title: 'שגיאה בטעינת אירועים',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });
};

/**
 * הוק לקבלת אירועים עתידיים
 */
export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: EVENTS_KEYS.upcoming(),
    queryFn: () => eventsService.getUpcoming(),
    meta: {
      onError: (error: Error) => {
        log.error('Error fetching upcoming events', { error });
        toast({
          title: 'שגיאה בטעינת אירועים עתידיים',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });
};

/**
 * הוק לקבלת אירוע ספציפי
 */
export const useEvent = (id: string) => {
  return useQuery({
    queryKey: EVENTS_KEYS.detail(id),
    queryFn: () => eventsService.getById(id),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        log.error(`Error fetching event ${id}`, { error });
        toast({
          title: 'שגיאה בטעינת פרטי אירוע',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });
};
