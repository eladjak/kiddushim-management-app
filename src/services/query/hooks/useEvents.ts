import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services/entity/events';
import type { Event, EventCreate, EventUpdate } from '@/types/events';
import { toast } from '@/components/ui/use-toast';

// קבועים לשימוש כמפתחות query
export const EVENTS_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENTS_KEYS.all, 'list'] as const,
  list: (filters: string) => [...EVENTS_KEYS.lists(), { filters }] as const,
  upcoming: () => [...EVENTS_KEYS.all, 'upcoming'] as const,
  details: () => [...EVENTS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EVENTS_KEYS.details(), id] as const,
  participants: (id: string) => [...EVENTS_KEYS.detail(id), 'participants'] as const,
};

/**
 * הוק לקבלת כל האירועים
 */
export const useEvents = (filters = '') => {
  return useQuery({
    queryKey: EVENTS_KEYS.list(filters),
    queryFn: () => eventsService.getAll(),
    onError: (error: Error) => {
      console.error('Error fetching events:', error);
      toast({
        title: 'שגיאה בטעינת אירועים',
        description: error.message,
        variant: 'destructive',
      });
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
    onError: (error: Error) => {
      console.error('Error fetching upcoming events:', error);
      toast({
        title: 'שגיאה בטעינת אירועים עתידיים',
        description: error.message,
        variant: 'destructive',
      });
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
    onError: (error: Error) => {
      console.error(`Error fetching event ${id}:`, error);
      toast({
        title: 'שגיאה בטעינת פרטי אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק ליצירת אירוע חדש
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newEvent: EventCreate) => eventsService.create(newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
      toast({
        title: 'אירוע נוצר בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error creating event:', error);
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
      toast({
        title: 'אירוע עודכן בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating event:', error);
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
      queryClient.removeQueries({ queryKey: EVENTS_KEYS.detail(id) });
      toast({
        title: 'אירוע נמחק בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting event:', error);
      toast({
        title: 'שגיאה במחיקת אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

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
      console.error('Error registering participant:', error);
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
      console.error('Error canceling participation:', error);
      toast({
        title: 'שגיאה בביטול הרשמה לאירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}; 